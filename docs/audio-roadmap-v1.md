# Audio Roadmap v1

## Goal
Implement audio in the safest functional order:
1. basic audio playback
2. notation/playback sync cursor
3. instrument and timbre system

This order ensures timing correctness before visual sync, and visual sync before realistic timbre.

---

## 1. Basic audio playback
### First tasks
- note name -> MIDI note
- MIDI note -> frequency
- beat -> seconds
- simple synth / oscillator playback
- use the shared score-event model as source of truth

### Success criteria
- correct pitch
- correct octave
- correct rhythmic timing
- simple audible playback of generated notes

---

## 2. Notation/playback sync cursor
### Next tasks
- add `startBeat` to score events
- compute global beat timing
- let notation and audio read the same event timing
- move a visual cursor or highlight across events in sync with playback

### Success criteria
- what the user sees matches what the user hears
- note highlights align with scheduled playback

---

## 3. Instrument and timbre system
### Next tasks
- instrument registry
- playable ranges
- timbre profiles
- octave / register timbre zones
- basic ADSR envelope defaults by instrument

### Success criteria
- instruments have distinct identities
- octaves sound appropriate for the selected instrument
- playback remains driven by the same score-event model

---

## Guiding principle
Notation and playback must come from the same score-event model.
That is what guarantees true 1:1 sync between written notation and audible playback.
