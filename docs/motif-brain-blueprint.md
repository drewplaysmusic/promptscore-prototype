# Motif Brain Blueprint

## Core purpose
Motif Brain gives the music identity.
Without it, generated output can be correct but feel like exercises.
With it, the system can repeat, vary, develop, and compare musical ideas.

---

## 1. Raw substrate
- short pitch cells
- short rhythm cells
- short placement cells
- combined pitch-rhythm fragments

Motif Brain does not invent music from nothing. It works on small event groups supplied by Pitch Brain, Rhythm Brain, and Placement Brain.

---

## 2. Primitive distinctions
Start with the smallest meaningful contrasts:
- repeat / vary
- same / transformed
- stable / unstable
- compact / expanded
- anchored / displaced

These are the binary or near-binary primitives underneath the motif system.

---

## 3. Organizational layer
Motifs can be organized by:
- interval pattern
- contour pattern
- rhythm cell
- placement pattern
- phrase position
- harmonic function

A motif is not only a pitch shape. It is a combined object made from:
- pitch identity
- rhythm identity
- placement identity
- function within phrase

---

## 4. Functional layer
Motif Brain should support:
- repetition
- sequence
- inversion
- retrograde
- augmentation
- diminution
- rhythmic displacement
- contour preservation with new pitches
- harmonic adaptation of the same shape

Main functional jobs:
- create identity
- create memory for the listener
- create cohesion across measures
- create contrast without losing unity
- support phrase shaping

---

## 5. Intent layer
### Education mode
- repeat a cell clearly
- vary only one feature at a time
- compare original vs transformed motif
- isolate rhythm-only or pitch-only changes

### Composer mode
- search multiple motif candidates
- test which motif develops best across a phrase
- preserve identity while adapting to harmony
- compare stronger and weaker motif versions

### Randomized idea mode
- generate multiple motif seeds
- apply controlled transformations
- surface surprising but coherent options

### Evaluation mode
- rank motifs by:
  - memorability
  - coherence
  - contrast balance
  - phrase fit
  - harmonic fit

---

## 6. Inputs
Motif Brain should read from:
- Pitch Brain
- Rhythm Brain
- Placement Brain
- Harmony Brain
- Phrase Brain
- user intent / prompt

Typical inputs:
- pitch candidates
- rhythm vocabulary
- onBeat vs syncopated tags
- phrase role (opening / middle / cadence)
- harmonic target zone

---

## 7. Outputs
Motif Brain should output:
- motif seed
- motif transformations
- ranked motif candidates
- motif-linked event groups for each phrase section

---

## 8. Suggested first version
Build Motif Brain in this order:

### Version 1
- extract first short cell from opening measure
- repeat it in middle measure
- allow one controlled variation

### Version 2
- support rhythm-only variation
- support pitch-only variation
- support sequence by scale degree shift

### Version 3
- support harmonic adaptation
- support phrase-aware motif development
- compare motif candidates and keep the strongest

---

## 9. Interaction with first 3 brains
- Pitch Brain provides note vocabulary and contour possibilities
- Rhythm Brain provides duration vocabulary and measure-fit shapes
- Placement Brain provides onBeat vs syncopated identity
- Motif Brain combines them into a reusable musical idea

This creates the next musical-language layer:
- Pitch = alphabet
- Rhythm = time syntax
- Placement = stress pattern
- Motif = words / recognizable units

---

## 10. Important design rule
Motif Brain should not be purely decorative.
It should shape later choices.
Once a motif exists, later measures should ask:
- should this repeat?
- should this vary?
- should this resolve?
- should this intensify?

That is what moves the engine toward true musical reasoning.
