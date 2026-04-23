# Retrieval v1 Blueprint

## Core purpose
Retrieval v1 translates a user prompt into a lightweight search over the music corpus using:
- style tags
- era
- genre
- composer reference
- key / mode
- meter
- high-level behavior traits

It returns relevant references that the other brains can use as guidance.

This is retrieval-first, not full model training.

---

## 1. What Retrieval v1 should do
Given a prompt such as:
- "Write a Bach-like phrase in D minor"
- "Give me a Mozart-style antecedent-consequent in G major"
- "Create a Romantic lyric idea with more rhythmic freedom"

Retrieval v1 should:
1. parse the prompt into structured filters
2. search the corpus manifest / metadata / style traits
3. return a small set of best-fit references
4. expose the style constraints to the other brains

---

## 2. Prompt-to-query mapping
### Parse these first
- composer reference words
- era words
- genre words
- key / mode words
- meter words
- style trait words

### Example mapping
Prompt:
"Mozart-style phrase in G major with clear cadence"

Maps to:
- composer_reference = Mozart
- era = Classical
- genre = theme or phrase
- key = G major
- harmonic_clarity = high
- phrase_symmetry = high

---

## 3. Retrieval sources
Retrieval v1 can read from:
- `corpus/manifests/source-manifest.json`
- `corpus/extracted/metadata/*.json`
- `corpus/extracted/style-traits/*.json`

Later it can also read extracted feature indexes.

---

## 4. Matching strategy v1
Use simple weighted matching.

### Strong matches
- exact composer reference
- exact era
- exact genre
- exact key / mode if available

### Medium matches
- style stack overlap
- style trait overlap
- meter match

### Light matches
- category similarity
- general common-practice compatibility

Score candidates and return top 3 to 5 references.

---

## 5. Retrieval output shape
Retrieval v1 should return something like:

```json
{
  "query_summary": {
    "composer_reference": "W.A. Mozart",
    "era": "Classical",
    "genre": "theme",
    "key": "G major"
  },
  "style_constraints": {
    "phrase_symmetry": "high",
    "harmonic_clarity": "high",
    "syncopation_level": "low"
  },
  "references": [
    {
      "id": "mozart_theme_001",
      "match_score": 0.92,
      "reasons": ["composer match", "era match", "style match"]
    }
  ]
}
```

---

## 6. How Retrieval v1 feeds the brains
### Style Brain
Gets the style stack and selected references.

### Pitch Brain
Uses retrieved stylistic tendencies for contour and interval behavior.

### Rhythm Brain
Uses retrieved rhythmic family and density tendencies.

### Placement Brain
Uses retrieved anchored vs syncopated balance.

### Phrase Brain
Uses retrieved cadence and symmetry tendencies.

### Motif Brain
Uses retrieved repetition and variation behavior.

### Evaluation Brain
Uses retrieval results to score stylistic fit.

---

## 7. Suggested first implementation
### Version 1A
- exact tag matching only
- search by:
  - composer_reference
  - era
  - category / genre
  - style_stack items

### Version 1B
- add style trait matching
- add key / mode matching
- add meter matching

### Version 1C
- add extracted feature matching
- add nearest-style fallback if exact matches are missing

---

## 8. Important design rule
Retrieval v1 should be transparent.
For each returned reference, be able to explain:
- why it matched
- what traits it contributed
- how it will bias the other brains

This makes the system teachable and debuggable.
