# Music Corpus and Retrieval Blueprint

## Goal
Build PromptScore as a growing learning music brain that can reference public-domain and open symbolic music, retrieve relevant exemplars, and guide generation using style, era, tonality, phrase behavior, and motif structure.

This is **not** a plan to train one giant black-box model first.
It is a plan to build a structured music intelligence stack.

---

## 1. Product behavior target
When a user prompts something like:
- "Write a late Baroque phrase in D minor with a Bach-like sequence"
- "Give me a Classical antecedent-consequent idea in G major like Mozart"
- "Create a Romantic-style expanding phrase with darker harmony"

The system should:
1. interpret the request
2. retrieve relevant symbolic references
3. extract useful patterns
4. generate several candidates with the existing brains
5. evaluate candidates against the user's intent
6. render the selected result as notation and optionally audio

---

## 2. Core architecture
### Layer A: Corpus layer
Store symbolic music and metadata.

### Layer B: Extraction layer
Derive musical features from the symbolic files.

### Layer C: Retrieval layer
Search for relevant examples by style, era, tonality, motif, rhythm, cadence, or prompt meaning.

### Layer D: Brain-guided generation layer
Use Pitch, Rhythm, Placement, Phrase, Harmony, Motif, and Evaluation brains to generate candidates informed by retrieved references.

### Layer E: Rendering layer
Notation, playback, and explanation.

---

## 3. What data to prioritize
### First priority: symbolic music
Start with:
- MusicXML
- MIDI
- MEI or kern later if useful

Symbolic formats are better than audio for early PromptScore because they are:
- easier to analyze
- easier to index
- easier to reuse for notation generation
- closer to the representation the app already needs

### Later priority: audio
Add audio references later for:
- performance feel
- articulation
- rubato
- instrumentation color

---

## 4. Safe source categories
Use:
- public-domain compositions
- public-domain symbolic scores
- openly licensed symbolic corpora
- public-domain educational collections

Be careful with:
- modern editions
- commercial recordings
- copyrighted engravings
- copyrighted metadata bundles

Rule:
The composition may be public domain, but the edition or recording may not be.

---

## 5. Suggested first corpus buckets
### Baroque
- Bach chorales
- Bach inventions
- Bach keyboard excerpts where symbolic files are available
- Handel keyboard / suite material where available

### Classical
- Mozart piano sonatas and small forms
- Haydn themes and sonata movements where symbolic files are available
- Beethoven early and middle-period short-form excerpts

### Common-practice anchors
- hymn corpora
- folk song corpora
- public-domain etudes / exercises

Start narrow and well-labeled before going broad.

---

## 6. Metadata schema for each piece or excerpt
Store at least:
- source id
- title
- composer
- era / style period
- approximate year or date range
- genre
- instrumentation
- key / mode
- meter
- tempo marking if known
- phrase segmentation
- cadence labels
- motif fingerprints
- interval fingerprints
- rhythmic fingerprints
- harmonic reduction if available
- source license / provenance
- file path / blob path

---

## 7. What to extract from each score
### Pitch / melodic features
- scale collection
- interval profile
- contour profile
- register behavior
- sequence patterns
- tendency-tone behavior

### Rhythm features
- duration vocabulary
- subdivision families
- syncopation profile
- dotted / tuplet usage
- density profile

### Phrase features
- phrase lengths
- cadence locations
- opening / continuation / closing markers
- antecedent / consequent patterns

### Harmony features
- chord function profile
- cadence types
- tonicization behavior
- harmonic rhythm

### Motif features
- repeated cells
- transformed cells
- sequence types
- rhythmic motif families

These extracted features become the searchable memory of the system.

---

## 8. Retrieval behavior
The retrieval layer should support searches like:
- by composer
- by era
- by style words from prompt
- by key / mode
- by meter
- by cadence type
- by motif shape
- by rhythmic profile
- by phrase archetype

Examples:
- "Baroque sequence in minor"
- "Mozart-like antecedent-consequent"
- "triplet motion in compound meter"
- "clear PAC cadence examples"

---

## 9. How retrieval should interact with the brains
### Pitch Brain
Uses retrieved pitch and interval patterns for style-aware note selection.

### Rhythm Brain
Uses retrieved duration and subdivision patterns.

### Placement Brain
Uses retrieved anchored vs syncopated behavior for the target style.

### Phrase Brain
Uses retrieved phrase length and cadence archetypes.

### Harmony Brain
Uses retrieved functional progression tendencies.

### Motif Brain
Uses retrieved motif development strategies.

### Evaluation Brain
Scores candidates partly by similarity to the intended style and partly by internal musical quality.

---

## 10. Training roadmap
### Phase 1: retrieval-first system
Do not train a giant model first.
Build:
- corpus
- extracted features
- search / retrieval
- prompt routing
- brain-guided generation using retrieved examples

### Phase 2: symbolic modeling
Train or fine-tune a model on symbolic sequences and extracted labels.
Possible outputs:
- phrase continuations
- motif transformations
- cadence predictions
- style-conditioned melody suggestions

### Phase 3: ranking / evaluation model
Train a smaller model that chooses the strongest candidate for:
- education
- composer mode
- random exploration

### Phase 4: audio/performance model
Only later add audio-sensitive modeling for:
- performance nuance
- expression
- orchestration feel

---

## 11. Why this is better than "train on everything"
A giant undirected dataset creates noise.
A structured retrieval system gives:
- controllability
- explainability
- legal clarity
- easier debugging
- better fit to notation generation

This matches PromptScore's real purpose better than a pure black-box music model.

---

## 12. Prompt examples for the future system
- "Write a Bach-like sequence in D minor with a strong cadence"
- "Give me a Mozart-style 8 bar phrase in G major"
- "Use hymn-like harmonic pacing but a more modern contour"
- "Generate 3 Classical phrase candidates and rank the strongest"
- "Show me public-domain references with similar rhythmic profile"

---

## 13. Build order recommendation
1. corpus policy and source list
2. metadata schema
3. ingestion pipeline for symbolic files
4. feature extraction pipeline
5. retrieval queries and search index
6. hook retrieval into PromptScore brains
7. candidate generation + evaluation
8. VexFlow notation rendering
9. symbolic model fine-tuning later
10. audio/performance modeling last

---

## 14. Important principle
PromptScore should not just imitate surface style.
It should retrieve references, understand their musical behavior, and apply those ideas through structured brains.
That is how it becomes a true growing learning music brain.
