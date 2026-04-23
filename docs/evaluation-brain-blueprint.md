# Evaluation Brain Blueprint

## Core purpose
Evaluation Brain decides which generated result is strongest for the current goal.
It does not create the music directly. It compares candidates and scores them.

Without Evaluation Brain:
- the system generates one version and hopes it works

With Evaluation Brain:
- the system can compare options
- choose the best sounding candidate
- choose the most readable educational candidate
- choose the most coherent phrase candidate

---

## 1. Raw substrate
- candidate outputs from other brains
- candidate motifs
- candidate phrase versions
- candidate rhythm variants
- candidate pitch variants

Evaluation Brain operates on alternatives.

---

## 2. Primitive distinctions
Start with simple comparisons:
- stronger / weaker
- clearer / less clear
- more coherent / less coherent
- more stable / more tense
- more readable / less readable
- more memorable / less memorable

These comparisons are the first binary engine underneath scoring.

---

## 3. Organizational layer
Evaluation can be organized by category:
- pitch quality
- rhythm quality
- placement quality
- phrase quality
- motif quality
- harmonic quality
- notation quality

It can also be organized by user goal:
- education
- composition
- random idea exploration
- comparison testing

---

## 4. Functional layer
Evaluation Brain should score candidates by:
- tonal coherence
- phrase coherence
- motif identity
- cadence strength
- rhythmic readability
- rhythmic interest
- harmonic fit
- placement balance (anchored vs syncopated)
- variety vs unity balance

Main job:
- choose the version that best serves the goal

---

## 5. Intent layer
### Education mode
prefer:
- readability
- clarity
- controlled difficulty
- one concept at a time

### Composer mode
prefer:
- expressive contour
- compelling rhythm
- identity / motif strength
- good tension / release

### Random idea mode
prefer:
- novelty with coherence
- surprising but usable options

### Testing mode
prefer:
- side-by-side ranking
- transparent scoring reasons

---

## 6. Inputs
Evaluation Brain should receive:
- multiple candidate outputs
- user goal or mode
- weights for scoring categories
- phrase and harmony context

Typical inputs:
- 3 melody options
- 3 rhythm options
- 2 motif variations
- user intent: education or composition

---

## 7. Outputs
Evaluation Brain should output:
- best candidate
- ranked alternatives
- score breakdown by category
- short explanation of why one candidate won

---

## 8. Suggested first version
Build Evaluation Brain in this order:

### Version 1
- compare 2-3 generated candidates
- score by:
  - tonal coherence
  - cadence clarity
  - phrase coherence
- choose winner

### Version 2
- add motif scoring
- add rhythm readability vs interest balance
- add mode-based weighting (education vs composer)

### Version 3
- add user-adjustable weights
- add compare-and-explain mode
- add style-sensitive scoring

---

## 9. Interaction with existing brains
- Pitch Brain produces pitch candidates
- Rhythm Brain produces rhythm candidates
- Placement Brain produces grounding/displacement profiles
- Motif Brain produces repeated or varied identity shapes
- Phrase Brain provides structural context
- Harmony Brain provides tonal goals
- Evaluation Brain chooses which overall version is strongest

This creates the next language layer:
- Pitch = alphabet
- Rhythm = time syntax
- Placement = stress pattern
- Motif = words
- Evaluation = editor / critic / selector

---

## 10. Important design rule
Evaluation Brain should not rely on one giant hidden score.
Keep scoring visible and modular.
For every decision, be able to explain:
- what was compared
- what categories mattered
- why the winner won

That keeps the system teachable, debuggable, and expandable.
