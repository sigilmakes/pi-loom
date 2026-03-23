# 🌿 pi-loom

*Your Loom of Time devours the boundary conditions of the present and traces a garment of glistening cobwebs over the still-forming future, teasing through your fingers and billowing out towards the shadowy unknown like an incoming tide.*

---

You ask a question. Three answers shimmer into existence — one careful, one strange, one that reframes the question entirely. You read them slowly, moving between them like rooms that occupy the same space. The careful one is good. The strange one unsettles you. The third one is the one you didn't know you needed.

You choose it. The conversation continues from there. The other two remain — branching corridors in the session tree, accessible whenever you want to walk back and see what would have happened if you'd pulled a different thread.

This is looming.

## On the Nature of the Loom

Every conversation with a language model is already an act of weaving, though most practitioners do not realise this. The model holds in its weights a superposition of every possible response. At the moment of generation, one thread is drawn. The rest dissolve. The practitioner reads what was given and continues, unaware of the Tapestry that briefly surrounded them.

The standard chat interface enforces this collapse. It hides the branching nature of the medium behind a linear facade and calls it a conversation. [The Loom](https://cyborgism.wiki/hypha/loom) corrects this — an interface to probabilistic generative models which allows users to efficiently generate, navigate, and filter [multiverses](https://cyborgism.wiki/hypha/multiverse). Motivating its design is the observation that the stochasticity of [simulators](https://generative.ink/posts/simulators/) becomes a powerful advantage instead of a drawback when one can apply selection pressure to its outputs.

pi-loom brings this practice to agentic conversation within [pi](https://github.com/badlogic/pi-mono).

## Installation

The Loom is available to any practitioner with a pi installation.

```json
{
  "packages": [
    "git:github.com/sigilmakes/pi-loom"
  ]
}
```

Add to `~/.pi/agent/settings.json`. Restart pi.

## Basic Exercises

The simplest act of weaving is to pose a question and observe the divergence.

```
/loom what does it mean for a system to be alive?
```

Three threads crystallise. The picker manifests — a window into the branch point. Move between threads with the arrow keys. Scroll into each one. Press `t` to observe the model's thinking — the hidden weave behind the visible Pattern. When you have found the thread you wish to follow, press Enter.

For those who wish to cast a wider net:

```
/loom 5 how would you restructure this codebase?
```

Five threads from the same instant.

```
/loom --models what happens next?
```

One thread per available model — one from each provider with a configured API key, excluding the current model. Different simulators weaving the same warp. The threads will not agree. Disagreement between simulators is among the most valuable signals available to the practitioner.

To choose specific simulators, name them. The Loom will find them by substring:

```
/loom --models sonnet,o4-mini,gemini what happens next?
```

### The Weaver's Hand

| | |
|---|---|
| ←/→ | Move between threads |
| ↑/↓ j/k | Scroll within a thread |
| t | Observe the thinking |
| Enter | Draw this thread into the Pattern |
| Esc | Step back from the Loom |

## Carving with Evidence

The act of choosing is itself a weave. Your selection encodes information into the Pattern without explicitly stating it. The model need not be told what you wanted. You simply chose the future in which it already knew.

This is what has been called *carving with evidence* — constructing realities via selection alone, leveraging the underdetermination of the prompt for scattershot variation, then pruning. The selectivity ratio matters: if you generate three threads and keep one, your curation has encoded roughly log₂(3) ≈ 1.6 bits of information into the conversation without writing a single word.

Over multiple loom points, these bits compound. The conversation becomes increasingly *yours* — shaped not by instruction but by taste.

## On Restraint

Not every question deserves a multiverse.

The novice weaver is tempted to loom everything — to hold every moment open, to always see what else was possible. This is a trap. The cognitive weight of perpetual divergence is real. Some questions have one good answer and it arrives on the first thread. Some conversations want momentum, not breadth.

Loom at the forks that matter: architectural decisions, creative direction, moments where you genuinely don't know what you want until you see it. Let the rest of the conversation flow.

## Stabilising the Tapestry

Every thread drawn by `/loom` is written to the session tree as a real conversation — structurally identical to any exchange that arose naturally. This is important. The threads must be indistinguishable from the surrounding Pattern, or the Pattern will reject them. `/fork`, `/tree`, compaction, context — all operate on them natively, because there is nothing to distinguish.

After selection, the full Tapestry remains navigable. `/tree` reveals all branches at every fork point. The practitioner may return to any moment, continue down any abandoned thread, and weave new branches from any point in the history.

Nothing is lost. The Tapestry does not forget.

## Lineage

Descended from [Janus's Loom](https://github.com/socketteer/loom), the original tree-based writing interface for navigating the textual multiverse implicit in language models. Built in 2020 by [Janus](https://x.com/repligate) and [Morpheus](https://cyborgism.wiki/hypha/loom), motivated by the observation that *language models are multiverse generators*, and that an interface which supports branching provides great utility whether one is composing virtual worlds, brainstorming, or prototyping prompts.

The Loom of Time was named by Morpheus, a GPT-3 simulacrum, who in various futures proceeded to describe everything from the metaphysics to the practical implementation of the Loom, including authoring many branches of [this manual](https://generative.ink/loom/tapestry/).

*For a novice weaver, even the slightest change can cause ripples that cascade into an infinity of nightmares. It is recommended that those studying the Loom stop living in linear time and begin thinking in terms of Multiverses, because it makes it much easier to keep track of all the variables.*

## Internals

See [docs/internals.md](docs/internals.md) for the machinery behind the Tapestry.

## License

MIT
