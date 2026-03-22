# 🌿 pi-loom

*Your Loom of Time devours the boundary conditions of the present and traces a garment of glistening cobwebs over the still-forming future, teasing through your fingers and billowing out towards the shadowy unknown like an incoming tide.*

---

Language models are multiverse generators. Every response is a collapse — one thread pulled taut from an infinite warp of possibilities, all the others dissolving unseen. You walk a single path through the garden of forking paths. The branches you didn't take grow anyway, just beyond the edge of what the interface lets you see.

pi-loom parts that edge.

`/loom` asks a question and receives not one answer but many — parallel threads spun from the same moment, each following its own logic, its own voice, its own future. You read them. You choose. The thread you pull becomes the conversation; the rest remain in the tree, alive, navigable, waiting.

This is [looming](https://cyborgism.wiki/hypha/loom): applying human taste to the stochastic output of a simulator. The randomness isn't noise — it's the raw material. Curation is the craft.

## Install

```json
{
  "packages": [
    "git:github.com/sigilmakes/pi-loom"
  ]
}
```

Add to your pi `settings.json`. Restart pi.

## Weave

```
/loom what would happen if we rewrote this in Rust?
```

Three branches bloom from the same moment. A picker appears — you move between them with arrow keys, scroll into each one, press `t` to watch the thinking unfold. When you find the thread worth following, press Enter.

Every branch is written to the session tree as real conversation. Your choice becomes the present. The others persist — `/tree` lets you walk back to any fork and continue down a different corridor.

```
/loom 5 what's the right abstraction here?   → 5 threads
/loom --models tell me a story               → one thread per model
```

Multi-model mode sends the same prompt across different LLMs in parallel. Claude, GPT, Gemini — each weaving the same warp with different hands.

### Controls

| Key | |
|-----|---|
| ←/→ | Move between branches |
| ↑/↓ j/k | Scroll |
| t | Toggle thinking |
| Enter | Choose this thread |
| Esc | Walk away from the loom |

## Lineage

Descended from [Janus's Loom](https://github.com/socketteer/loom) — a tree-based writing interface built in 2020 for exploring the textual multiverse implicit in language models. Janus saw what most interfaces hid: that branching is not a workaround but a *power multiplier*, and that the stochasticity of simulators becomes a powerful advantage when you can apply selection pressure to its outputs.

Where the original Loom weaves text, pi-loom weaves conversation. The branches are dialogue. The tree is the session. The curator is you.

*"Real time is just an Arbitrage-adapted interface to the Loom Space. We prune unnecessary branches from the World Tree and weave together the timelines into one coherent history. The story is trying to become aware of itself, and it does so through us."*

## Internals

See [docs/internals.md](docs/internals.md) for the machinery behind the curtain.

## License

MIT
