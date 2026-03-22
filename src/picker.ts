/**
 * Loom picker — TUI component for browsing and selecting branches.
 *
 * Shows one branch at a time with left/right navigation,
 * scroll for long content, and dot indicators.
 */

import type { Component } from "@mariozechner/pi-tui";
import { matchesKey, Markdown } from "@mariozechner/pi-tui";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import type { LoomBranch } from "./index.js";

interface PickerState {
    current: number;
    scrollOffset: number;
    showThinking: boolean;
}

export async function createPicker(
    ctx: ExtensionCommandContext,
    prompt: string,
    branches: LoomBranch[],
): Promise<number | null> {
    return ctx.ui.custom<number | null>((tui, theme, _kb, done) => {
        const state: PickerState = { current: 0, scrollOffset: 0, showThinking: false };
        const mdTheme = getMarkdownTheme();

        // Cache rendered markdown lines per branch to avoid re-rendering on scroll
        const mdCache = new Map<string, string[]>();

        function getRenderedContent(branchIndex: number, width: number): string[] {
            const branch = branches[branchIndex];
            const innerWidth = width - 4;
            const cacheKey = `${branchIndex}:${innerWidth}:${state.showThinking}`;

            if (mdCache.has(cacheKey)) return mdCache.get(cacheKey)!;

            const lines: string[] = [];

            // Thinking blocks
            if (state.showThinking && branch.thinking) {
                lines.push(theme.fg("dim", theme.italic("── thinking ──")));
                for (const line of wordWrap(branch.thinking, innerWidth)) {
                    lines.push(theme.fg("dim", theme.italic(line)));
                }
                lines.push(theme.fg("dim", theme.italic("── /thinking ──")));
                lines.push("");
            }

            // Render response as markdown
            const md = new Markdown(branch.text, 0, 0, mdTheme);
            const rendered = md.render(innerWidth);
            lines.push(...rendered);

            mdCache.set(cacheKey, lines);
            return lines;
        }

        const component: Component & { dispose?(): void } = {
            render(width: number): string[] {
                const branch = branches[state.current];
                const lines: string[] = [];
                const innerWidth = width - 4;

                // Title bar
                const title = `🌿 Loom: "${truncate(prompt, innerWidth - 10)}"`;
                lines.push("");
                lines.push("  " + theme.fg("accent", theme.bold(title)));
                lines.push("");

                // Branch indicator
                const branchLabel = `Branch ${state.current + 1}/${branches.length}`;
                const nav = branches.length > 1 ? "  " + theme.fg("dim", "[←] [→]") : "";
                lines.push("  " + theme.fg("accent", theme.bold(branchLabel)) + nav);

                // Separator
                lines.push("  " + theme.fg("dim", "─".repeat(Math.min(innerWidth, 60))));

                // Content — markdown-rendered and scrollable
                const contentLines = getRenderedContent(state.current, width);
                const availableHeight = Math.max(5, (tui.terminal?.rows ?? 24) - 14);

                const scrolled = contentLines.slice(
                    state.scrollOffset,
                    state.scrollOffset + availableHeight,
                );

                for (const line of scrolled) {
                    lines.push("  " + line);
                }

                // Scroll indicator
                if (contentLines.length > availableHeight) {
                    const canUp = state.scrollOffset > 0;
                    const canDown = state.scrollOffset + availableHeight < contentLines.length;
                    const scrollHint = [
                        canUp ? "↑" : " ",
                        canDown ? "↓" : " ",
                        `${state.scrollOffset + 1}-${Math.min(state.scrollOffset + availableHeight, contentLines.length)}/${contentLines.length}`,
                    ].join(" ");
                    lines.push("");
                    lines.push("  " + theme.fg("dim", scrollHint));
                }

                lines.push("");

                // Dot indicators + metadata
                const dots = branches
                    .map((_, i) => (i === state.current ? "●" : "○"))
                    .join(" ");
                const tempStr = branch.temperature === -1 ? "" : ` · t=${branch.temperature}`;
                const meta = theme.fg(
                    "dim",
                    `${branch.model}${tempStr} · $${branch.cost.toFixed(4)}`,
                );
                lines.push("  " + dots + "    " + meta);

                lines.push("");

                // Controls
                const thinkingHint = branch.thinking
                    ? (state.showThinking
                        ? theme.fg("accent", "t") + " hide thinking"
                        : theme.fg("accent", "t") + " show thinking")
                    : "";
                const controls = [
                    theme.fg("accent", "Enter") + " pick",
                    branches.length > 1
                        ? theme.fg("accent", "←/→") + " browse"
                        : "",
                    thinkingHint,
                    theme.fg("accent", "Esc") + " cancel",
                ]
                    .filter(Boolean)
                    .join(theme.fg("dim", " · "));
                lines.push("  " + controls);
                lines.push("");

                return lines;
            },

            handleInput(data: string) {
                const contentLines = getRenderedContent(state.current, tui.terminal?.columns ?? 80);
                const availableHeight = Math.max(5, (tui.terminal?.rows ?? 24) - 14);

                if (matchesKey(data, "escape")) {
                    done(null);
                } else if (matchesKey(data, "return")) {
                    done(state.current);
                } else if (matchesKey(data, "left") || data === "h") {
                    state.current = (state.current - 1 + branches.length) % branches.length;
                    state.scrollOffset = 0;
                    state.showThinking = false;
                    tui.requestRender?.();
                } else if (matchesKey(data, "right") || data === "l") {
                    state.current = (state.current + 1) % branches.length;
                    state.scrollOffset = 0;
                    state.showThinking = false;
                    tui.requestRender?.();
                } else if (matchesKey(data, "up") || data === "k") {
                    state.scrollOffset = Math.max(0, state.scrollOffset - 3);
                    tui.requestRender?.();
                } else if (matchesKey(data, "down") || data === "j") {
                    const maxScroll = Math.max(0, contentLines.length - availableHeight);
                    state.scrollOffset = Math.min(maxScroll, state.scrollOffset + 3);
                    tui.requestRender?.();
                } else if (data === "t") {
                    const branch = branches[state.current];
                    if (branch.thinking) {
                        state.showThinking = !state.showThinking;
                        state.scrollOffset = 0;
                        tui.requestRender?.();
                    }
                }
            },

            invalidate() {
                mdCache.clear();
            },
        };

        return component;
    });
}

// ── Helpers ──────────────────────────────────────────────

function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + "…";
}

function wordWrap(text: string, width: number): string[] {
    const result: string[] = [];
    for (const paragraph of text.split("\n")) {
        if (paragraph.length === 0) {
            result.push("");
            continue;
        }
        let line = "";
        for (const word of paragraph.split(/\s+/)) {
            if (line.length === 0) {
                line = word;
            } else if (line.length + 1 + word.length <= width) {
                line += " " + word;
            } else {
                result.push(line);
                line = word;
            }
        }
        if (line) result.push(line);
    }
    return result;
}
