# pi-loom

Conversation looming for [pi](https://github.com/badlogic/pi-mono) — generate multiple responses to the same prompt, browse them in a picker, and keep all branches in the session tree.

Inspired by [Janus's Loom](https://github.com/socketteer/loom), adapted for agentic conversation.

## Install

Add to your pi `settings.json`:

```json
{
  "packages": [
    "git:github.com/willow-builds/pi-loom"
  ]
}
```

Then restart pi.

## Usage

```
/loom how should we handle auth?          → 3 branches (default)
/loom 5 how should we handle auth?        → 5 branches
/loom --models how should we handle auth? → 1 branch per available model
```

### What happens

1. **Generates** N responses sequentially (avoids rate limiting)
2. **Picker** appears — browse with ←/→, scroll with ↑↓/j/k, press `t` to toggle thinking blocks
3. **Pick one** with Enter (or Esc to cancel)
4. **All branches** are written to the session tree as real user/assistant messages
5. **Navigate** between branches anytime with `/tree`

### Picker controls

| Key | Action |
|-----|--------|
| ←/→ or h/l | Browse branches |
| ↑/↓ or j/k | Scroll content |
| t | Toggle thinking blocks |
| Enter | Pick current branch |
| Esc | Cancel |

## How it works

- Uses `completeSimple()` from pi-ai to make direct LLM calls with the current conversation context
- Matches your current thinking/reasoning level
- For non-reasoning models, uses escalating temperatures (0.7–1.1) for diversity
- For reasoning models, relies on natural sampling randomness (temperature is ignored by the API)
- Writes branches using `SessionManager.branch()` + `appendMessage()` — real messages, not custom entries
- Picker renders markdown with pi's `Markdown` component

## Multi-model mode

`/loom --models` sends the prompt to multiple models in parallel:

- Anthropic Claude Sonnet 4
- OpenAI o4-mini
- Google Gemini 2.5 Pro

Only models with configured API keys are used. Different endpoints don't rate-limit each other, so this mode runs in parallel.

## Known limitations

- Sequential generation for same-model branches (parallel hits rate limits). ~10-30s for 3 branches depending on model.
- Reasoning models ignore temperature — diversity comes from sampling randomness only.
- Empty responses are filtered out. You may get fewer branches than requested.
- Uses `SessionManager.appendMessage()` via type cast — not part of the public extension API. See [docs/internals.md](docs/internals.md) for details.

## Internals

See [docs/internals.md](docs/internals.md) for how it works under the hood, including the SessionManager hack and why it's necessary.

## License

MIT
