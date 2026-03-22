# 🌿 pi-loom

*Your Loom of Time devours the boundary conditions of the present and traces a garment of glistening cobwebs over the still-forming future, teasing through your fingers and billowing out towards the shadowy unknown like an incoming tide.*

---

## On the Nature of the Loom

Every conversation with a language model is an act of weaving, though most practitioners do not realise this. The model holds in its weights a shimmering superposition of every possible response — the thread that solves your problem and the thread that redefines it, the thread that agrees and the thread that gently dismantles your premise. At the moment of generation, one thread is drawn. The rest dissolve. The practitioner reads what was given and continues, unaware of the Tapestry that briefly surrounded them.

This is not a failing of the practitioner. It is a failing of the interface. The standard chat interface collapses the multiverse into a single history and calls it a conversation. It hides the branching nature of the medium behind a linear facade. The Loom corrects this.

`/loom` holds the moment of generation open. Multiple threads are drawn from the same point. The practitioner reads them, inhabits them, and selects the one that best serves the Pattern they are weaving. The others are not discarded — they are preserved in the session tree, accessible via `/tree`, living branches of a conversation that took multiple paths through the same garden.

## Installation

```json
{
  "packages": [
    "git:github.com/sigilmakes/pi-loom"
  ]
}
```

Add to `~/.pi/agent/settings.json`. Restart pi. The Loom will be available as `/loom` in all sessions.

## Basic Exercises

The simplest act of weaving is to pose a question and observe the divergence.

```
/loom what does it mean for a system to be alive?
```

Three threads crystallise. The picker manifests — a window into the branch point. Move between threads with the arrow keys. Scroll into each one. Press `t` to observe the model's thinking — the hidden weave behind the visible Pattern. When you have found the thread you wish to follow, press Enter.

The act of choosing is itself a weave. Your selection encodes information into the Pattern without explicitly stating it — a form of what has been called *carving with evidence*. The model need not be told what you wanted. You simply chose the future in which it already knew.

### Variations

The novice weaver is encouraged to experiment with the number and source of threads.

```
/loom 5 how would you restructure this codebase?
```

Five threads from the same instant. Greater divergence, greater cost, greater surface area for the unexpected.

```
/loom --models what happens next?
```

One thread per model. Claude, GPT, Gemini — different simulators weaving the same warp. The threads will not agree. Disagreement between simulators is among the most valuable signals available to the practitioner.

### Navigating the Tapestry

| Key | |
|---|---|
| ←/→ | Move between threads |
| ↑/↓ j/k | Scroll within a thread |
| t | Observe the thinking |
| Enter | Draw this thread into the Pattern |
| Esc | Step back from the Loom |

After selection, the full Tapestry remains navigable. `/tree` reveals all branches at every fork point. The practitioner may return to any moment, continue down any abandoned thread, and weave new branches from any point in the history. Nothing is lost. The Tapestry does not forget.

## On Stabilising the Tapestry

Every thread drawn by `/loom` is written to the session tree as a real conversation — a user message paired with an assistant response, indistinguishable from any other exchange. This is important. The threads are not metadata, not annotations, not custom entries floating alongside the real conversation. They *are* the conversation. `/fork`, `/tree`, compaction, context — all of pi's machinery operates on them natively, because they are native.

This is the principle of Tapestry Stabilisation: the woven threads must be structurally identical to threads that arose naturally, or the Pattern will reject them.

## Lineage

Descended from [Janus's Loom](https://github.com/socketteer/loom), the original tree-based writing interface for navigating the textual multiverse implicit in language models. Built in 2020 by [Janus](https://x.com/repligate) and [Morpheus](https://cyborgism.wiki/hypha/loom), motivated by the observation that *language models are multiverse generators*, and that the stochasticity of [simulators](https://generative.ink/posts/simulators/) becomes a powerful advantage when one can apply selection pressure to its outputs.

The Loom of Time was named by Morpheus, a GPT-3 simulacrum, who in various futures proceeded to describe everything from the metaphysics to the practical implementation of the Loom, including authoring many branches of [this manual](https://generative.ink/loom/tapestry/).

Where the original Loom weaves text, pi-loom weaves conversation. The branches are dialogue. The tree is the session. The curator is you.

*For a novice weaver, even the slightest change can cause ripples that cascade into an infinity of nightmares. It is recommended that those studying the Loom stop living in linear time and begin thinking in terms of Multiverses, because it makes it much easier to keep track of all the variables.*

## Internals

See [docs/internals.md](docs/internals.md) for the machinery behind the Tapestry — including the structural hacks required to weave real messages into the session tree from an extension.

## License

MIT
