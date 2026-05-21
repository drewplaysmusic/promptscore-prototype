# PromptScore

A prompt-driven music composition engine with notation rendering, playback, and an education mode. Type natural language like *"16 measures melody in G major in the style of Mozart"* and get real sheet music.

## Quick Start

### Prerequisites
You need two things installed on your computer:

1. **Node.js** (LTS version) — download from https://nodejs.org
2. **Git** — download from https://git-scm.com

To check if they're installed, open your terminal and type:
```bash
node --version    # should show v18 or higher
git --version     # should show any version
```

### Run the app locally
```bash
git clone https://github.com/drewplaysmusic/promptscore-prototype.git
cd promptscore-prototype
npm install
npm run dev
```
Then open the URL shown in your terminal (usually http://localhost:5173).

### Build for production
```bash
npm run build
```

---

## Project Structure

```
promptscore/
├── src/
│   ├── main.tsx                          # App entry point
│   │
│   ├── music/                            # 🧠 Music engine (all the brains)
│   │   ├── musicBrain.ts                 # Master router + melody generator (v1 pipeline)
│   │   ├── PromptIntentEngine.ts         # Parses prompts → structured intent
│   │   ├── PromptIntentComposer.ts       # Style-aware composition (v2 pipeline)
│   │   ├── PromptHarmonyEngine.ts        # Bridges prompt intent → harmony plan
│   │   │
│   │   ├── PitchEngine.ts               # Octave-aware pitch math, scales, chords
│   │   ├── StyleEngine.ts               # Style contours + rhythm patterns per genre
│   │   ├── harmonyBrain.ts              # Chord progressions by style + mode
│   │   ├── HarmonyTheoryEngine.ts       # Roman numeral → chord tones, voice leading
│   │   ├── exerciseBrain.ts             # Scale exercise generator
│   │   │
│   │   ├── MusicCursor.ts              # Tick-precise cursor for note placement
│   │   ├── MeasureFillEngine.ts        # Fills measures exactly with rhythm patterns
│   │   ├── PlaybackEngine.ts           # Web Audio API playback with cursor sync
│   │   │
│   │   ├── RhythmFunnel.ts            # Prompt → rhythm intent → RhythmTree
│   │   ├── RhythmTree.ts              # Tree structure for nested rhythms
│   │   ├── RhythmTreeToNoteEvents.ts  # Converts rhythm tree → note events
│   │   ├── pulseGridEngine.ts         # Core rhythm math (PPQ=960)
│   │   ├── pulseGridMusicBridge.ts    # Bridges pulse grid → music events
│   │   ├── rhythmMath.ts             # Simpler rhythm math (PPQ=96)
│   │   ├── rhythmPlacement.ts        # Rhythm placement within measures
│   │   ├── musicXYGrid.ts            # 2D grid for nested ratio rhythms
│   │   ├── musicEventAxes.ts         # Rhythm + pitch axis types
│   │   └── measureFrame.ts           # VexFlow measure layout math
│   │
│   ├── ui/                              # 🎹 User interface
│   │   ├── PromptScoreHarmonyWorkbench.tsx  # Main app shell (4 modes)
│   │   ├── ScoreRenderer.tsx                # VexFlow notation with pulse grid
│   │   └── VexFlowCanvas.tsx                # Simple VexFlow renderer
│   │
│   └── debug/                            # 🔧 Debug panels (dev tools)
│       ├── PromptIntentDebugPanel.tsx
│       ├── PitchEngineDebugPanel.tsx
│       ├── ChordCursorDebugPanel.tsx
│       ├── CursorDebugPanel.tsx
│       └── RhythmTreeDebugPanel.tsx
│
├── docs/                                 # 📐 Architecture blueprints
│   ├── vertical-brain-architecture.md    # Master brain design document
│   ├── brain-blueprint-first-3.md        # Pitch, Rhythm, Placement brain specs
│   ├── style-brain-blueprint.md
│   ├── motif-brain-blueprint.md
│   ├── evaluation-brain-blueprint.md
│   ├── music-corpus-and-retrieval-blueprint.md
│   ├── retrieval-v1-blueprint.md
│   ├── ui-workspace-blueprint.md
│   ├── audio-brain-playback-sync-blueprint.md
│   └── audio-roadmap-v1.md
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How the prompt engine works

When you type a prompt, PromptScore routes it through one of three paths:

1. **Scale exercises** — "C major scale in quarter notes" → `exerciseBrain`
2. **Rhythm-focused** — "eighth note triplets" → `RhythmFunnel` → `RhythmTree`
3. **Full composition** — "16 measures melody in G major Mozart style" → `PromptIntentComposer` (or `musicBrain` for simpler prompts)

All paths produce `NoteEvent[]` arrays that feed into `ScoreRenderer` (VexFlow) and `PlaybackEngine` (Web Audio).

## App modes

- **Compose** — Click to place notes, type prompts to generate music
- **Learn** — Educational exercises (rhythm, pitch, staff reading)
- **Rhythm** — Focused rhythm prompt testing
- **Playback** — Listen and inspect timing

## What's built vs. what's planned

| Brain | Status | File(s) |
|-------|--------|---------|
| Pitch | ✅ Built | `PitchEngine.ts` |
| Rhythm | ✅ Built | `pulseGridEngine.ts`, `RhythmTree.ts`, `RhythmFunnel.ts` |
| Harmony | ✅ Built | `harmonyBrain.ts`, `HarmonyTheoryEngine.ts` |
| Style | 🔶 Partial | `StyleEngine.ts` (contours + patterns, not full constraint stack) |
| Audio | 🔶 Partial | `PlaybackEngine.ts` (basic synth, no instrument registry) |
| Phrase | 📐 Designed | `docs/brain-blueprint-first-3.md` |
| Placement | 📐 Designed | `docs/brain-blueprint-first-3.md` |
| Motif | 📐 Designed | `docs/motif-brain-blueprint.md` |
| Evaluation | 📐 Designed | `docs/evaluation-brain-blueprint.md` |
| Corpus/Retrieval | 📐 Designed | `docs/music-corpus-and-retrieval-blueprint.md` |

## Tech stack

- **React 18** + **TypeScript** — UI framework
- **Vite** — Build tool and dev server
- **VexFlow 4** — Music notation rendering
- **Web Audio API** — Playback synthesis

## License

MIT
