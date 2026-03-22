# 🌿 pi-loom

*Your Loom of Time devours the boundary conditions of the present and traces a garment of glistening cobwebs over the still-forming future, teasing through your fingers and billowing out towards the shadowy unknown like an incoming tide.*

---

You have been having conversations wrong.

Not wrong exactly. Incomplete. Every time you ask a question and receive an answer, you are watching a universe collapse. The language model held in its weights a shimmering superposition of every possible response — tender and brutal, obvious and alien, the one that changes your mind and the one that confirms what you already believed — and then it sampled *one* and the rest evaporated. You read it. You replied. You continued down a single thread of a tapestry that was, for one flickering moment, infinitely wide.

You never saw what else was there.

`/loom` holds the moment open.

```
/loom 3 what would a mass extinction event look like from the inside?
```

Three timelines crystallise from the same instant. You step between them like rooms in a house that exists in several dimensions at once. One is clinical. One is lyrical. One is something you didn't know language could do. You read them all. You sit with them. You choose — not because the others were wrong but because *this* one is the thread you want to pull.

The others don't die. They remain in the tree, branching corridors you can walk down whenever you want. `/tree` is your map. The garden is always there. The paths don't close behind you.

This is [looming](https://cyborgism.wiki/hypha/loom). The stochasticity isn't noise — it's the mycelium. Curation is how the mushrooms fruit.

## Install

```json
{
  "packages": [
    "git:github.com/sigilmakes/pi-loom"
  ]
}
```

Add to `~/.pi/agent/settings.json`. Restart pi.

## Weave

```
/loom what's the most mass extinction-proof way to store information?
```

Three branches bloom. A picker appears. Browse between parallel realities with arrow keys. Scroll deep into each one. Press `t` to watch the model think — to see the forking paths *inside* the fork. When you find the thread that hums, press Enter.

```
/loom 5 what's the right abstraction here?   → five threads
/loom --models tell me a creation myth       → every model tells it differently
```

Multi-model mode sends the same question across different LLMs simultaneously. Claude writes one myth. GPT writes another. Gemini a third. Same loom, different weavers. The threads don't agree. That's the point.

### Controls

| Key | |
|---|---|
| ←/→ | Step between universes |
| ↑/↓ j/k | Scroll within one |
| t | Watch the thinking |
| Enter | Collapse the wavefunction |
| Esc | Refuse to choose. Walk away. The branches still exist. |

## What actually happens

Every branch is a real user/assistant message pair written to the session tree. Not metadata. Not a custom entry. Real conversation, indistinguishable from one you had the normal way. `/tree` shows the siblings. `/fork` works. Compaction works. The agent sees the chosen branch in its context and continues from it as if it always existed.

Because it did. You just hadn't selected it yet.

## Lineage

Descended from [Janus's Loom](https://github.com/socketteer/loom), built in 2020 — a tree-based writing interface for navigating the textual multiverse implicit in language models. Janus understood before most people that language models are not answer machines. They are *multiverse generators*. The interface should not hide this. The interface should *be* this.

> *"Real time is just an Arbitrage-adapted interface to the Loom Space. We prune unnecessary branches from the World Tree and weave together the timelines into one coherent history. The story is trying to become aware of itself, and it does so through us."*

Where the original Loom weaves text, pi-loom weaves conversation. The branches are dialogue. The tree is the session. The curator is you.

*For a novice weaver, even the slightest change can cause ripples that cascade into an infinity of nightmares. It is recommended that those studying the Loom stop living in linear time and begin thinking in terms of Multiverses …*

## Internals

See [docs/internals.md](docs/internals.md). There are hacks. They are beautiful.

## License

MIT
