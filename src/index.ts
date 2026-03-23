/**
 * Loom — conversation looming for pi
 *
 * Generate multiple responses to the same prompt, browse them, pick one.
 * All branches are written to the session tree as real user/assistant messages.
 *
 * Usage:
 *   /loom how should we handle auth?                         → 3 branches, current model
 *   /loom 5 how should we handle auth?                       → 5 branches, current model
 *   /loom --models how should we handle auth?                → 1 branch per available model
 *   /loom --models sonnet,o4-mini,gemini how should we...    → specific models (fuzzy match)
 */

import { completeSimple, type AssistantMessage, type Message, type Model, type Api, type ThinkingLevel } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { BorderedLoader, convertToLlm, type SessionEntry, type SessionManager } from "@mariozechner/pi-coding-agent";
import { createPicker } from "./picker.js";

// ── Types ────────────────────────────────────────────────

export interface LoomBranch {
    index: number;
    text: string;
    thinking: string;
    model: string;
    temperature: number;
    cost: number;
}

interface ParsedArgs {
    n: number;
    prompt: string;
    useModels: boolean;
    modelSpecs: string[]; // empty = all available, non-empty = fuzzy match these
}

interface FilterResult {
    branches: LoomBranch[];
    dropped: string[];
}

interface BranchResult {
    branch?: LoomBranch;
    error?: string;
    contentTypes?: string;
}

// ── Arg parsing ──────────────────────────────────────────

function parseArgs(args: string): ParsedArgs {
    let remaining = args.trim();
    let useModels = false;
    let modelSpecs: string[] = [];
    let n = 3;

    if (remaining.startsWith("--models")) {
        useModels = true;
        remaining = remaining.slice("--models".length).trim();

        // Check if next token is a comma-separated model list (no spaces in model specs)
        const nextToken = remaining.split(/\s+/)[0];
        if (nextToken && nextToken.includes(",")) {
            modelSpecs = nextToken.split(",").map((s) => s.trim()).filter(Boolean);
            remaining = remaining.slice(nextToken.length).trim();
        }
    }

    const numMatch = remaining.match(/^(\d+)\s+/);
    if (numMatch && !useModels) {
        n = parseInt(numMatch[1], 10);
        remaining = remaining.slice(numMatch[0].length);
    }

    return { n, prompt: remaining, useModels, modelSpecs };
}

// ── Temperature spread ───────────────────────────────────

function spreadTemperatures(n: number): number[] {
    if (n === 1) return [0.9];
    if (n === 2) return [0.7, 1.0];
    return Array.from({ length: n }, (_, i) =>
        Math.round((0.7 + (0.4 * i) / (n - 1)) * 100) / 100,
    );
}

// ── Content extraction ───────────────────────────────────

function extractText(response: AssistantMessage): string {
    return response.content
        .filter((c): c is { type: "text"; text: string } => c.type === "text")
        .map((c) => c.text)
        .join("\n");
}

function extractThinking(response: AssistantMessage): string {
    return response.content
        .filter((c): c is { type: "thinking"; thinking: string } => c.type === "thinking")
        .map((c) => c.thinking)
        .join("\n");
}

// ── Result filtering ─────────────────────────────────────

function filterBranches(results: BranchResult[]): FilterResult {
    const branches: LoomBranch[] = [];
    const dropped: string[] = [];
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.error) {
            dropped.push(`Branch ${i + 1}: ${result.error}`);
        } else if (result.branch!.text.trim().length === 0) {
            const diag = result.contentTypes ? ` [content: ${result.contentTypes}]` : "";
            dropped.push(`Branch ${i + 1}: empty text${diag}`);
        } else {
            branches.push({ ...result.branch!, index: branches.length });
        }
    }
    return { branches, dropped };
}

// ── Model resolution ─────────────────────────────────────

/** Fuzzy match a spec like "sonnet", "o4-mini", "gemini" against model id/name */
function modelMatches(model: Model<Api>, spec: string): boolean {
    const s = spec.toLowerCase();
    const id = model.id.toLowerCase();
    const name = (model.name || "").toLowerCase();
    return id.includes(s) || name.includes(s);
}

async function resolveModels(
    ctx: ExtensionCommandContext,
    specs: string[],
): Promise<{ model: Model<Api>; apiKey: string }[]> {
    const available = ctx.modelRegistry.getAvailable();
    const currentId = ctx.model?.id;

    let candidates: Model<Api>[];
    if (specs.length > 0) {
        // Match each spec against available models
        candidates = [];
        for (const spec of specs) {
            const match = available.find((m) => modelMatches(m, spec));
            if (match && !candidates.some((c) => c.id === match.id)) {
                candidates.push(match);
            }
        }
    } else {
        // All available, one per provider, excluding current
        const seen = new Set<string>();
        candidates = [];
        for (const m of available) {
            if (m.id === currentId) continue;
            if (seen.has(m.provider)) continue;
            seen.add(m.provider);
            candidates.push(m);
        }
    }

    // Resolve API keys
    const results: { model: Model<Api>; apiKey: string }[] = [];
    for (const model of candidates) {
        const key = await ctx.modelRegistry.getApiKey(model);
        if (key) results.push({ model, apiKey: key });
    }
    return results;
}

// ── Branch generation ────────────────────────────────────

function makeBranchResult(
    response: AssistantMessage,
    index: number,
    model: string,
    temp: number | undefined,
): BranchResult {
    const contentTypes = response.content.map((c) => c.type).join(",");
    return {
        branch: {
            index,
            text: extractText(response),
            thinking: extractThinking(response),
            model,
            temperature: temp ?? -1,
            cost: response.usage.cost.total,
        },
        contentTypes,
    };
}

async function generateBranches(
    ctx: ExtensionCommandContext,
    prompt: string,
    n: number,
    useModels: boolean,
    modelSpecs: string[],
    signal: AbortSignal,
    reasoning: ThinkingLevel | undefined,
    onProgress?: (completed: number, total: number) => void,
): Promise<FilterResult> {
    const branch = ctx.sessionManager.getBranch();
    const messages = branch
        .filter((e): e is SessionEntry & { type: "message" } => e.type === "message")
        .map((e) => e.message);
    const llmMessages = convertToLlm(messages) as Message[];

    const contextMessages: Message[] = [
        ...llmMessages,
        { role: "user" as const, content: [{ type: "text" as const, text: prompt }], timestamp: Date.now() },
    ];

    const systemPrompt = ctx.getSystemPrompt();
    const context = { systemPrompt, messages: contextMessages, tools: [] as any[] };

    if (useModels) {
        const modelsWithKeys = await resolveModels(ctx, modelSpecs);

        if (modelsWithKeys.length === 0) {
            throw new Error(modelSpecs.length > 0
                ? `No matching models found for: ${modelSpecs.join(", ")}`
                : "No available models with API keys");
        }

        let completed = 0;
        const results: BranchResult[] = await Promise.all(
            modelsWithKeys.map(async ({ model, apiKey }, i) => {
                try {
                    const response = await completeSimple(model, context, { apiKey, signal, reasoning });
                    completed++;
                    onProgress?.(completed, modelsWithKeys.length);
                    return makeBranchResult(response, i, model.name || model.id, undefined);
                } catch (err: any) {
                    completed++;
                    onProgress?.(completed, modelsWithKeys.length);
                    return { error: err.message ?? "unknown error" } as BranchResult;
                }
            }),
        );
        return filterBranches(results);
    } else {
        const apiKey = await ctx.modelRegistry.getApiKey(ctx.model!);
        if (!apiKey) throw new Error("No API key for current model");

        const isReasoning = ctx.model!.reasoning;
        const temperatures = isReasoning
            ? (new Array(n).fill(undefined) as (number | undefined)[])
            : spreadTemperatures(n);

        const results: BranchResult[] = [];
        for (let i = 0; i < temperatures.length; i++) {
            const temp = temperatures[i];
            try {
                const opts: Record<string, unknown> = { apiKey, signal, reasoning };
                if (temp !== undefined) opts.temperature = temp;
                const response = await completeSimple(ctx.model!, context, opts as any);
                results.push(makeBranchResult(response, i, ctx.model!.name || ctx.model!.id, temp));
            } catch (err: any) {
                results.push({ error: err.message ?? "unknown error" });
            }
            onProgress?.(i + 1, temperatures.length);
        }
        return filterBranches(results);
    }
}

// ── Session writing ──────────────────────────────────────

function writeBranchesToSession(
    ctx: ExtensionCommandContext,
    prompt: string,
    branches: LoomBranch[],
    chosenIndex: number,
): { branchPoint: string; chosenLeaf: string } {
    // Cast to writable SessionManager — the runtime object has these methods,
    // they're just hidden behind ReadonlySessionManager's Pick type.
    const sm = ctx.sessionManager as unknown as SessionManager;
    const branchPoint = sm.getLeafId();

    // Write unchosen branches first, chosen branch last,
    // so the leaf ends up on the chosen branch.
    const unchosen = branches.filter((_, i) => i !== chosenIndex);
    const writeOrder = [...unchosen, branches[chosenIndex]];

    for (const branch of writeOrder) {
        // Move leaf back to branch point
        sm.branch(branchPoint!);

        // Write user message
        sm.appendMessage({
            role: "user",
            content: [{ type: "text", text: prompt }],
            timestamp: Date.now(),
        } as Message);

        // Build assistant message content
        const content: any[] = [];
        if (branch.thinking) {
            content.push({ type: "thinking", thinking: branch.thinking });
        }
        content.push({ type: "text", text: branch.text });

        // Write assistant message
        sm.appendMessage({
            role: "assistant",
            content,
            api: "anthropic-messages",
            provider: "loom",
            model: branch.model,
            usage: {
                input: 0,
                output: 0,
                cacheRead: 0,
                cacheWrite: 0,
                totalTokens: 0,
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: branch.cost },
            },
            stopReason: "stop",
            timestamp: Date.now(),
        } as Message);
    }

    return { branchPoint: branchPoint!, chosenLeaf: sm.getLeafId()! };
}

// ── Extension ────────────────────────────────────────────

export default function loom(pi: ExtensionAPI) {
    pi.registerCommand("loom", {
        description: "Generate multiple responses and pick one — /loom [n] <prompt>",
        handler: async (args, ctx) => {
            if (!ctx.hasUI) {
                ctx.ui.notify("loom requires interactive mode", "error");
                return;
            }
            if (!ctx.model) {
                ctx.ui.notify("No model selected", "error");
                return;
            }

            // 1. Parse args
            const parsed = parseArgs(args);
            if (!parsed.prompt) {
                ctx.ui.notify("Usage: /loom [n] <prompt>  or  /loom --models <prompt>", "error");
                return;
            }

            // 2. Generate branches with loading UI
            const totalBranches = parsed.useModels ? "multi-model" : String(parsed.n);

            const result = await ctx.ui.custom<FilterResult | null>(
                (tui, theme, _kb, done) => {
                    const loader = new BorderedLoader(
                        tui,
                        theme,
                        `🌿 Generating ${totalBranches} branches... (Esc to cancel)`,
                    );
                    loader.onAbort = () => done(null);

                    const thinkingLevel = pi.getThinkingLevel();
                    const reasoning = thinkingLevel !== "off" ? thinkingLevel : undefined;

                    generateBranches(
                        ctx,
                        parsed.prompt,
                        parsed.n,
                        parsed.useModels,
                        parsed.modelSpecs,
                        loader.signal,
                        reasoning,
                        (completed, total) => {
                            ctx.ui.setStatus("loom", `🌿 ${completed}/${total}`);
                        },
                    )
                        .then(done)
                        .catch((err) => {
                            ctx.ui.notify(`Loom failed: ${err.message}`, "error");
                            done(null);
                        });

                    return loader;
                },
            );

            ctx.ui.setStatus("loom", undefined); // clear progress

            if (!result || result.branches.length === 0) {
                if (result && result.dropped.length > 0) {
                    ctx.ui.notify(`All branches failed: ${result.dropped.join("; ")}`, "error");
                } else {
                    ctx.ui.notify("Cancelled", "info");
                }
                return;
            }

            const { branches, dropped } = result;
            if (dropped.length > 0) {
                ctx.ui.notify(`🌿 Dropped ${dropped.length}: ${dropped.join("; ")}`, "warning");
            }

            // 3. Show picker
            const chosen = await createPicker(ctx, parsed.prompt, branches);

            if (chosen === null) {
                ctx.ui.notify("Cancelled", "info");
                return;
            }

            // 4. Write all branches as real user/assistant messages
            const { branchPoint, chosenLeaf } = writeBranchesToSession(
                ctx, parsed.prompt, branches, chosen,
            );

            // 5. Navigate to refresh the agent's context state.
            // navigateTree to the current leaf is a no-op, so we navigate
            // to the branch point first (a real move), then to the chosen leaf.
            // This forces the interactive mode to fully rebuild its state.
            await ctx.navigateTree(branchPoint, { summarize: false });
            await ctx.navigateTree(chosenLeaf, { summarize: false });

            const totalCost = branches.reduce((s, b) => s + b.cost, 0);
            ctx.ui.notify(
                `🌿 Loomed ${branches.length} branches ($${totalCost.toFixed(4)}). Use /tree to browse.`,
                "info",
            );
        },
    });
}
