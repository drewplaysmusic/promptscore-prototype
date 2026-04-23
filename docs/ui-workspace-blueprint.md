# UI Workspace Blueprint

## Goal
Design PromptScore so different modes can feel like professional notation software without copying any one product directly.

The UI should feel familiar to users of notation apps by using a workstation layout:
- top toolbar
- left entry palette
- center score canvas
- right inspector panel
- playback controls

At the same time, PromptScore should remain distinct by exposing its own AI/brain workflow.

---

## 1. Core app shell
Use one shared shell across the app.

### Top bar
- app title / logo
- file actions
- save / export
- mode switcher
- prompt access
- account / settings

### Left panel
Notation entry and symbol palettes.

### Center panel
Score canvas / document view.

### Right panel
Context-sensitive inspector.

### Bottom or floating transport
- play
- stop
- loop
- tempo
- metronome

---

## 2. Primary modes / workspaces
### Compose mode
Purpose:
- notation entry
- score editing
- traditional music-writing workflow

Feels like:
- notation workstation

Left palette focus:
- note values
- rests
- accidentals
- ties / slurs
- articulations
- dynamics
- clefs / signatures

Right inspector focus:
- selected note properties
- measure properties
- instrument / staff settings

---

### Learn mode
Purpose:
- guided rhythm and pitch exercises
- reduced complexity
- pedagogy-first layout

Left palette focus:
- simplified note/rhythm tools
- lesson-specific symbols only

Right inspector focus:
- exercise instructions
- concept feedback
- progress / hints

---

### Brain mode
Purpose:
- prompt-driven generation
- view the reasoning layers
- compare candidates and references

Left palette focus:
- minimal notation controls
- generation and candidate controls

Right inspector focus:
- style stack
- retrieval references
- brain snapshot
- evaluation breakdown

---

### Playback mode
Purpose:
- focus on listening and timing
- playback inspection
- practice and compare

Left palette focus:
- minimal

Right inspector focus:
- playback settings
- tempo
- loop points
- instrument / timbre
- mixer later

---

## 3. Toolbar grouping strategy
Do not group tools only by software category.
Group them by musical meaning.

### Pitch group
- accidentals
- octave tools
- transposition
- clef / key signature

### Rhythm group
- note values
- rests
- dots
- tuplets
- beaming later

### Expression group
- dynamics
- articulations
- slurs
- phrase marks later

### Structure group
- time signatures
- repeats
- barlines
- sections

### Playback group
- play
- stop
- loop
- tempo
- metronome

### AI / Brain group
- prompt
- regenerate
- compare candidates
- references
- style mode

---

## 4. Glyph strategy
Use a real notation glyph system rather than custom improvised icons.

Preferred direction:
- use a SMuFL-compatible music font or notation glyph set
- map toolbar buttons to proper music symbols for:
  - note values
  - rests
  - accidentals
  - articulations
  - dynamics
  - clefs

This makes the UI feel legitimate and consistent.

---

## 5. Visual behavior by mode
Keep the shell consistent and swap emphasis, not the entire app.

### Compose mode
- dense symbolic toolbar
- full note entry palette
- inspector for note/measure details

### Learn mode
- simplified palettes
- fewer visible tools
- more explanation surfaces

### Brain mode
- prompt and reference panels become prominent
- notation controls are secondary

### Playback mode
- transport and timing controls become prominent
- editing controls fade back

---

## 6. Distinct PromptScore identity
To stay distinct from existing notation software:
- keep Brain mode visible and integrated
- keep style / retrieval / evaluation surfaces native to the UI
- do not clone exact product arrangements or branding
- treat notation entry and AI generation as equal first-class workflows

---

## 7. Suggested implementation order
### Version 1
- define app shell
- add mode switcher
- create placeholder left / center / right layout

### Version 2
- build notation toolbar groups
- add real glyph buttons
- add context-sensitive inspector panel

### Version 3
- connect Compose mode to notation actions
- connect Brain mode to prompt / reference / candidate tools
- connect Playback mode to transport controls

### Version 4
- refine visual density by mode
- add keyboard shortcuts and advanced palettes

---

## 8. Important principle
PromptScore should feel familiar to notation users, but it should not behave like a copy of another notation product.
Its defining feature is that notation, AI reasoning, retrieval, evaluation, and playback all live in one coherent workspace system.
