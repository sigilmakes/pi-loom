# Internals

How pi-loom works under the hood, including the hacks.

## Architecture

```
/loom [n] <prompt>
    │
    ├── 1. Parse args (n, prompt, --models)
    ├── 2. Build conversation context from session
    ├── 3. Generate N responses via completeSimple()
    │       ├── Sequential for same-model (avoids rate limiting)
    │       ├── Parallel for --models (different endpoints)
    │       └── Matches user's thinking/reasoning level
    ├── 4. Show picker (markdown-rendered, scrollable)
    ├── 5. Write all branches to session tree
    │       └── SessionManager.branch() + appendMessage()
    └── 6. Double-navigate to refresh agent context
            └── navigateTree(branchPoint) → navigateTree(chosenLeaf)
```

## The SessionManager hack

pi's extension API exposes `ctx.sessionManager` as `ReadonlySessionManager` — a TypeScript `Pick` type that only includes read methods like `getLeafId()`, `getBranch()`, `getEntries()`, etc.

The actual runtime object is a full `SessionManager` with write methods: `branch()`, `appendMessage()`, `branchWithSummary()`, etc. The type restriction is a design boundary, not a runtime limitation.

We bypass it:

```typescript
const sm = ctx.sessionManager as unknown as SessionManager;
sm.branch(branchPoint);
sm.appendMessage(userMessage);
sm.appendMessage(assistantMessage);
```

### Why not use the public API?

The extension API offers two ways to inject content:

1. **`pi.sendMessage()`** — creates `CustomMessageEntry` with a `customType`. These participate in LLM context but are NOT real user/assistant messages. `/fork` treats them as editable text (wrong), and the LLM doesn't understand the conversation structure.

2. **`pi.sendUserMessage()`** — sends a real user message but always triggers an LLM response. We don't want that — we already have the response.

Neither lets us write a user+assistant message pair without triggering a turn. `appendMessage()` is the only way to inject real conversation entries silently.

### What appendMessage does

From `session-manager.js`:

```javascript
appendMessage(message) {
    const entry = {
        type: "message",
        id: generateId(this.byId),
        parentId: this.leafId,
        timestamp: new Date().toISOString(),
        message,
    };
    this._appendEntry(entry);
    return entry.id;
}

_appendEntry(entry) {
    this.fileEntries.push(entry);   // in-memory array
    this.byId.set(entry.id, entry); // id lookup map
    this.leafId = entry.id;         // advance leaf
    this._persist(entry);           // append to JSONL file
}
```

It's completely mechanical: generate an ID, set parentId to current leaf, push to arrays, write to file, advance leaf. No events fired, no side effects.

`branch(id)` is even simpler — one line: `this.leafId = branchFromId`.

### Risk assessment

**Safe in practice:**
- Command handlers run when the agent is idle — no concurrent writes
- Same code path pi's own agent loop uses
- Session format is stable (JSONL with id/parentId tree)
- Append-only — can't corrupt existing data

**Theoretical risk:**
- A future pi version could rename or change `appendMessage()` signature
- The hack would fail loudly (runtime error), not silently
- Fix: update the cast or adapt to the new API

### Why not custom messages?

The public API's `pi.sendMessage()` creates `CustomMessageEntry` entries. These participate in LLM context but behave differently from real user/assistant messages in the session tree — `/fork` puts their content in the editor as if they're user input, and the LLM doesn't recognise them as a natural conversation exchange.

If `sendMessage()` supported an option to treat custom messages as assistant messages in the session tree (e.g. a `role` field), the SessionManager hack wouldn't be necessary.

## The double-navigate hack

After writing branches via `appendMessage()`, the session's in-memory state is updated but the interactive mode's context builder doesn't know about the new entries. The TUI renders them (it reads from the SessionManager directly), but the agent's LLM context doesn't include them.

`navigateTree(currentLeaf)` where the leaf is already at `currentLeaf` is a no-op — nothing to navigate to.

Fix: navigate away first, then back:

```typescript
await ctx.navigateTree(branchPoint, { summarize: false });
await ctx.navigateTree(chosenLeaf, { summarize: false });
```

The first call is a real navigation (moves to a different entry). The second brings us to the chosen branch. Both fire `session_tree` events that force the interactive mode to rebuild its context state.

## Temperature and reasoning models

Anthropic ignores the `temperature` parameter when extended thinking is enabled:

```javascript
// From pi-ai's anthropic provider:
if (options?.temperature !== undefined && !options?.thinkingEnabled) {
    params.temperature = options.temperature;
}
```

For reasoning models, all branches get the same effective temperature. Diversity comes entirely from sampling randomness. For non-reasoning models, we spread temperatures from 0.7 to 1.1.

We detect this via `ctx.model.reasoning` and skip setting temperature for reasoning models.

## Sequential vs parallel generation

Same-model branches are generated sequentially. Three parallel calls to the same Anthropic endpoint reliably causes 1-2 branches to return empty responses (likely soft rate limiting). Sequential generation is ~3x slower wall-clock but consistently produces all branches.

Multi-model branches (`--models`) are generated in parallel since they hit different API endpoints.
