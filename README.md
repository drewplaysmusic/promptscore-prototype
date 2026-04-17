# PromptScore Prototype

This repository has a working Vite + React scaffold.

## Current status

- GitHub repo scaffold is created
- Vite config is present
- React entry files are present
- `src/App.tsx` is currently a placeholder while the full music engine is being repaired and split safely

## Local run steps

After Git and Node.js LTS are installed:

```bash
git clone https://github.com/drewplaysmusic/promptscore-prototype.git
cd promptscore-prototype
npm install
npm run dev
```

Then open the localhost URL shown by Vite.

## Next planned work

- restore the full PromptScore engine into `src/App.tsx`
- split logic into repo-ready modules:
  - `src/music/theoryBrain.ts`
  - `src/music/melodyBrain.ts`
  - `src/music/rhythmBrain.ts`
  - `src/music/compositionAssembler.ts`
- build PhraseBrain next:
  - phrase opening
  - middle motion
  - cadence ending
  - repetition with variation

## Notes

The previous canvas version of the app was truncated, so the repo is intentionally using a safe placeholder until the repaired engine is ready.
