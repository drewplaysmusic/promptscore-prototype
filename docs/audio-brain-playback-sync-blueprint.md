# Audio Brain / Playback Sync Blueprint

## Core purpose
Audio Brain turns symbolic score events into synchronized playback.
It should keep notation and audio in 1:1 alignment by reading from the same score-event model.

This means PromptScore should not guess audio separately from notation.
Both notation and playback should be generated from one shared symbolic source of truth.

---

## 1. Raw substrate
The raw substrate for Audio Brain is:
- frequencies
- waveforms
- envelopes
- samples
- time in seconds
- time in beats
- instrument and timbre assignments

This is the audio equivalent of the chromatic universe in Pitch Brain and the pulse grid in Rhythm Brain.

---

## 2. Primitive distinctions
Start with simple distinctions:
- sounding / silent
- short / long
- low / high
- bright / dark
- percussive / sustained
- clean / expressive

These are the simplest audio behavior oppositions underneath synthesis and playback.

---

## 3. Organizational layer
Audio Brain should organize playback by:

### Pitch-to-frequency mapping
- note name
- octave
- MIDI note number
- frequency in Hz

### Time mapping
- measure
- beat
- startBeat
- durationBeats
- startTimeSeconds
- durationSeconds

### Instrument layer
- instrument family
- playable range
- timbre zones by octave or register
- articulation behavior

### Timbre layer
- oscillator type or sample
- envelope (attack, decay, sustain, release)
- filter / brightness behavior
- dynamic response

---

## 4. Functional layer
Audio Brain should support:
- exact pitch-to-frequency playback
- exact beat-to-seconds scheduling
- per-instrument timbre assignment
- octave-sensitive timbre zoning
- notation cursor sync
- educational playback mode
- composer mockup mode

Main functional jobs:
- make playback match notation exactly
- preserve octave accuracy
- preserve rhythmic accuracy
- give each instrument an identifiable sound

---

## 5. Intent layer
### Education mode
- clear timing
- simple timbre
- highly readable sound
- minimal expressive deviation

### Composer mode
- richer instrument timbres
- realistic envelopes
- more expressive playback later

### Evaluation mode
- compare candidate phrases by playback feel
- compare timbre or instrument choices

---

## 6. Shared score-event model
Audio Brain should read the same symbolic event objects used for notation.

Suggested fields:
- pitch
- midiNote
- frequency
- durationBeats
- startBeat
- measure
- voice
- instrument
- dynamic
- articulation
- timbreProfile

Example:

```json
{
  "pitch": "A4",
  "midiNote": 69,
  "frequency": 440.0,
  "durationBeats": 1,
  "startBeat": 2,
  "measure": 3,
  "voice": "treble",
  "instrument": "piano",
  "dynamic": "mf",
  "articulation": "tenuto",
  "timbreProfile": "piano_basic"
}
```

---

## 7. Pitch-to-frequency mapping
Use equal temperament first.

Formula:

`frequency = 440 * 2^((midiNote - 69)/12)`

This gives exact octave relationships and keeps pitch playback mathematically stable.

---

## 8. Beat-to-time mapping
Playback timing should be beat-driven.

If BPM is known:
- `secondsPerBeat = 60 / BPM`
- `startTimeSeconds = startBeatGlobal * secondsPerBeat`
- `durationSeconds = durationBeats * secondsPerBeat`

This is the key to keeping cursor, notation, and playback aligned.

---

## 9. Instrument and timbre registry
Audio Brain should use a registry of instruments.

Each instrument should define:
- rangeLow
- rangeHigh
- default timbre profile
- optional octave/register timbre zones
- envelope behavior

Example registry idea:

```json
{
  "instrument": "violin",
  "rangeLow": "G3",
  "rangeHigh": "A7",
  "timbreZones": [
    { "from": "G3", "to": "B4", "profile": "warm_low" },
    { "from": "C5", "to": "E6", "profile": "singing_mid" },
    { "from": "F6", "to": "A7", "profile": "bright_high" }
  ]
}
```

---

## 10. Suggested implementation stages
### Version 1
- shared score-event model
- MIDI and frequency mapping
- beat-based scheduling
- simple synth playback (Web Audio / oscillator)

### Version 2
- instrument registry
- timbre profiles
- basic ADSR envelopes
- notation cursor sync

### Version 3
- sampled playback
- octave-sensitive timbre zones
- articulation differences
- dynamics behavior

### Version 4
- expressive timing
- style-sensitive playback behavior
- more realistic orchestration mockup

---

## 11. Relationship to the other brains
- Pitch Brain provides pitch identity
- Rhythm Brain provides durations
- Placement Brain provides exact event placement
- Style Brain can bias timbre or playback strictness
- Evaluation Brain can compare candidate playback feel
- Notation Brain displays the same events visually

Audio Brain should not invent a separate reality. It should realize the shared symbolic score in sound.

---

## 12. Important principle
Notation and playback must come from the same score-event model.
That is how PromptScore can achieve true 1:1 sync between what the user sees and what the user hears.
