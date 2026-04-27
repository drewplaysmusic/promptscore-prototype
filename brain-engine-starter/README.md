# Brain Engine Starter

A small starter prototype for a universal scenario-based learning engine.

The core idea:

```txt
Source Knowledge -> Learning Atoms -> Scenario -> User Actions -> Feedback -> Improved Training
```

This first version focuses on an **Automotive No-Start Diagnostic Trainer** because it is practical, low-regulation, and easy to model.

## What this includes

- A learning atom data structure
- A small seed dataset for no-start diagnosis
- A scenario engine
- A feedback/scoring loop
- A simple CLI demo

## Project Structure

```txt
brain-engine-starter/
  data/
    automotive-no-start-atoms.json
  src/
    engine.js
    demo.js
  package.json
  README.md
```

## Run locally

```bash
cd brain-engine-starter
npm install
npm start
```

## Long-term platform vision

The mechanism stays the same across disciplines:

```txt
Prompt -> Scenario -> Interaction -> Thinking Prompt -> Feedback -> Memory
```

Domain packs can later be added for:

- automotive
- music
- medical training
- HVAC
- electrical
- business
- trades

## Important note

This is an educational training prototype, not professional advice. Medical or safety-critical domains need expert review, safety filters, and clear boundaries.
