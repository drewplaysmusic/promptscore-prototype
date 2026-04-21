import React, { useMemo, useState } from 'react'

type TimeSignature = { numerator: number; denominator: number }
type TheoryContext = {
  keySignature: string
  tonic: string
  scale: string[]
  accidentals: Record<string, string>
}
type MelodyContour = 'ascending' | 'descending' | 'arch' | 'wave' | 'static'
type MelodyMotion = 'stepwise' | 'balanced' | 'leapy'
type RhythmDensity = 'sparse' | 'balanced' | 'busy'
type PhraseSection = 'opening' | 'middle' | 'cadence'
type MelodyPlan = {
  contour: MelodyContour
  motion: MelodyMotion
  targetLength: number
  pitches: string[]
}
type RhythmPlan = {
  density: RhythmDensity
  values: string[]
}
type PhrasePlan = {
  sections: PhraseSection[]
  cadenceTone: string
  repetitionSpan: number
}
type CompositionPlan = {
  theory: TheoryContext
  melody: MelodyPlan
  rhythm: RhythmPlan
  phrase: PhrasePlan
}
type ScoreEvent = {
  pitch: string | null
  duration: string
  isRest: boolean
}
type MeasureModel = {
  events: ScoreEvent[]
  phraseSection: PhraseSection
}

type ScoreModel = {
  keySignature: string
  timeSignature: TimeSignature
  measures: MeasureModel[]
}

const NOTE_RANGE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
const DURATION_BEATS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
}
const CONTOUR_PATTERNS: Record<MelodyContour, number[]> = {
  ascending: [0, 1, 2, 3, 4, 5, 6, 5],
  descending: [6, 5, 4, 3, 2, 1, 0, 1],
  arch: [0, 1, 2, 4, 5, 4, 2, 1],
  wave: [0, 2, 1, 3, 2, 4, 3, 1],
  static: [0, 0, 1, 0, 0, 1, 0, 0],
}
const KEY_SIGNATURE_LIBRARY: Record<string, string[]> = {
  'c major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  'g major': ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
  'd major': ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'],
  'f major': ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'],
  'bb major': ['Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4'],
  'a minor': ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
  'e minor': ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
}
const KEY_SIGNATURE_ACCIDENTALS: Record<string, Record<string, string>> = {
  'c major': {},
  'g major': { F: '#' },
  'd major': { F: '#', C: '#' },
  'f major': { B: 'b' },
  'bb major': { B: 'b', E: 'b' },
  'a minor': {},
  'e minor': { F: '#' },
}
const PITCH_PRESETS: Record<string, string[]> = {
  none: [],
  fourNoteCell: ['C4', 'D4', 'E4', 'F4'],
  cMajorAscending: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  cMajorArpeggio: ['C4', 'E4', 'G4', 'C5'],
}
const RHYTHM_PRESETS: Record<string, string[]> = {
  none: [],
  quarterStraight: ['quarter', 'quarter', 'quarter', 'quarter'],
  eighthStraight: Array.from({ length: 8 }, () => 'eighth'),
  sixteenthStraight: Array.from({ length: 16 }, () => 'sixteenth'),
}

function tokenize(text: string): string[] {
  return String(text || '')
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function inferTimeSignature(prompt: string): TimeSignature {
  const tokens = tokenize(prompt.toLowerCase())
  for (const token of tokens) {
    const match = token.match(/^(\d+)\/(\d+)$/)
    if (match) return { numerator: Number(match[1]), denominator: Number(match[2]) }
  }
  if (prompt.toLowerCase().includes('waltz')) return { numerator: 3, denominator: 4 }
  return { numerator: 4, denominator: 4 }
}

function inferRhythm(prompt: string): string {
  const text = prompt.toLowerCase()
  if (text.includes('sixteenth') || text.includes('16th')) return 'sixteenth'
  if (text.includes('eighth') || text.includes('8th')) return 'eighth'
  if (text.includes('half')) return 'half'
  if (text.includes('whole')) return 'whole'
  return 'quarter'
}

function parseKeySignature(prompt: string): string {
  const text = prompt.toLowerCase()
  return Object.keys(KEY_SIGNATURE_LIBRARY).find((key) => text.includes(key)) || ''
}

function parseContour(prompt: string): MelodyContour {
  const text = prompt.toLowerCase()
  if (text.includes('descending') || text.includes('falling')) return 'descending'
  if (text.includes('arch')) return 'arch'
  if (text.includes('wave')) return 'wave'
  if (text.includes('static') || text.includes('repeated')) return 'static'
  return 'ascending'
}

function parseMotion(prompt: string): MelodyMotion {
  const text = prompt.toLowerCase()
  if (text.includes('stepwise') || text.includes('smooth')) return 'stepwise'
  if (text.includes('leap') || text.includes('angular')) return 'leapy'
  return 'balanced'
}

function parseMelodicPitches(prompt: string): string[] {
  return tokenize(prompt)
    .filter((token) => /^[A-Ga-g][#b]?\d$/.test(token))
    .map((token) => {
      const letter = token[0].toUpperCase()
      const accidental = token.length === 3 ? token[1].replace('B', 'b') : ''
      const octave = token[token.length - 1]
      return `${letter}${accidental}${octave}`
    })
}

function getMeasureBeatCount(timeSignature: TimeSignature): number {
  return timeSignature.numerator * (4 / timeSignature.denominator)
}

function getBeatsForDuration(duration: string): number {
  return DURATION_BEATS[duration] || 1
}

function buildTheoryContext(prompt: string): TheoryContext {
  const keySignature = parseKeySignature(prompt)
  const scale = KEY_SIGNATURE_LIBRARY[keySignature] || KEY_SIGNATURE_LIBRARY['c major']
  return {
    keySignature,
    tonic: (scale[0] || 'C4')[0],
    scale,
    accidentals: KEY_SIGNATURE_ACCIDENTALS[keySignature] || {},
  }
}

function buildMelodyBrain(args: {
  prompt: string
  theory: TheoryContext
  targetLength: number
  explicitPitches: string[]
  generatedPitchPreset: string[]
  selectedPitchPreset: string
}): MelodyPlan {
  const { prompt, theory, targetLength, explicitPitches, generatedPitchPreset, selectedPitchPreset } = args
  if (generatedPitchPreset.length) {
    return { contour: 'ascending', motion: 'balanced', targetLength, pitches: generatedPitchPreset }
  }
  if (selectedPitchPreset !== 'none' && PITCH_PRESETS[selectedPitchPreset]) {
    return { contour: 'ascending', motion: 'balanced', targetLength, pitches: PITCH_PRESETS[selectedPitchPreset] }
  }
  if (explicitPitches.length) {
    return { contour: 'static', motion: 'balanced', targetLength, pitches: explicitPitches }
  }
  const contour = parseContour(prompt)
  const motion = parseMotion(prompt)
  const pattern = CONTOUR_PATTERNS[contour]
  const pitches = Array.from({ length: Math.max(4, targetLength) }, (_, index) => {
    let degree = pattern[index % pattern.length]
    if (motion === 'stepwise' && index > 0) {
      const prev = pattern[(index - 1) % pattern.length]
      if (Math.abs(degree - prev) > 2) degree = prev + Math.sign(degree - prev) * 2
    }
    if (motion === 'leapy' && index % 3 === 2) degree = Math.min(6, degree + 2)
    return theory.scale[Math.max(0, Math.min(theory.scale.length - 1, degree))] || theory.scale[0] || 'C4'
  })
  return { contour, motion, targetLength, pitches }
}

function buildRhythmBrain(args: {
  prompt: string
  measureBeats: number
  generatedRhythmPreset: string[]
  selectedRhythmPreset: string
}): RhythmPlan {
  const { prompt, measureBeats, generatedRhythmPreset, selectedRhythmPreset } = args
  if (generatedRhythmPreset.length) {
    return { density: 'balanced', values: generatedRhythmPreset }
  }
  if (selectedRhythmPreset !== 'none' && RHYTHM_PRESETS[selectedRhythmPreset]) {
    return { density: 'balanced', values: RHYTHM_PRESETS[selectedRhythmPreset] }
  }
  const inferred = inferRhythm(prompt)
  if (prompt.toLowerCase().includes('syncopated')) {
    return { density: 'balanced', values: ['eighth', 'quarter', 'eighth', 'quarter'] }
  }
  if (inferred === 'sixteenth') {
    return { density: 'busy', values: Array.from({ length: Math.max(1, Math.round(measureBeats * 2)) }, () => 'eighth') }
  }
  if (inferred === 'half' || inferred === 'whole') {
    return { density: 'sparse', values: measureBeats >= 4 ? ['half', 'half'] : ['half'] }
  }
  return { density: 'balanced', values: Array.from({ length: Math.max(1, Math.round(measureBeats)) }, () => 'quarter') }
}

function buildPhraseBrain(args: { bars: number; theory: TheoryContext; prompt: string }): PhrasePlan {
  const { bars, theory, prompt } = args
  const sections: PhraseSection[] = Array.from({ length: Math.max(1, bars) }, (_, index) => {
    if (bars === 1) return 'cadence'
    if (index === 0) return 'opening'
    if (index === bars - 1) return 'cadence'
    return 'middle'
  })
  const cadenceTone = theory.scale[0] || `${theory.tonic}4`
  const repetitionSpan = prompt.toLowerCase().includes('variation') ? 1 : Math.min(2, Math.max(1, bars - 1))
  return { sections, cadenceTone, repetitionSpan }
}

function assembleCompositionPlan(args: {
  prompt: string
  timeSignature: TimeSignature
  bars: number
  selectedPitchPreset: string
  selectedRhythmPreset: string
  generatedPitchPreset: string[]
  generatedRhythmPreset: string[]
}): CompositionPlan {
  const theory = buildTheoryContext(args.prompt)
  const melody = buildMelodyBrain({
    prompt: args.prompt,
    theory,
    targetLength: Math.max(4, args.bars * 4),
    explicitPitches: parseMelodicPitches(args.prompt),
    generatedPitchPreset: args.generatedPitchPreset,
    selectedPitchPreset: args.selectedPitchPreset,
  })
  const rhythm = buildRhythmBrain({
    prompt: args.prompt,
    measureBeats: getMeasureBeatCount(args.timeSignature),
    generatedRhythmPreset: args.generatedRhythmPreset,
    selectedRhythmPreset: args.selectedRhythmPreset,
  })
  const phrase = buildPhraseBrain({ bars: args.bars, theory, prompt: args.prompt })
  return { theory, melody, rhythm, phrase }
}

function applyPhraseToMeasure(args: {
  section: PhraseSection
  sourceEvents: ScoreEvent[]
  theory: TheoryContext
  cadenceTone: string
  repetitionSource?: ScoreEvent[]
}): ScoreEvent[] {
  const { section, sourceEvents, theory, cadenceTone, repetitionSource } = args
  const events = sourceEvents.map((event) => ({ ...event }))
  if (section === 'opening') {
    if (events[0]) events[0].pitch = theory.scale[0] || events[0].pitch
    return events
  }
  if (section === 'middle') {
    if (repetitionSource && repetitionSource.length === events.length) {
      return repetitionSource.map((event, index) => {
        if (index % 2 === 0) return { ...event }
        const current = theory.scale.indexOf(event.pitch || '')
        const nextIndex = current >= 0 ? Math.min(theory.scale.length - 1, current + 1) : 1
        return { ...event, pitch: theory.scale[nextIndex] || event.pitch }
      })
    }
    return events
  }
  if (events.length > 0) {
    events[events.length - 1] = { ...events[events.length - 1], pitch: cadenceTone }
    if (events.length > 1) {
      const penultimate = theory.scale[4] || theory.scale[1] || cadenceTone
      events[events.length - 2] = { ...events[events.length - 2], pitch: penultimate }
    }
  }
  return events
}

function compositionPlanToScore(plan: CompositionPlan, timeSignature: TimeSignature, bars: number): ScoreModel {
  const beatsPerBar = getMeasureBeatCount(timeSignature)
  const baseMeasures: MeasureModel[] = []
  let pitchIndex = 0
  let rhythmIndex = 0
  for (let bar = 0; bar < Math.max(1, bars); bar += 1) {
    let used = 0
    const events: ScoreEvent[] = []
    while (used < beatsPerBar - 1e-9) {
      const duration = plan.rhythm.values[rhythmIndex % plan.rhythm.values.length] || 'quarter'
      const beats = getBeatsForDuration(duration)
      if (used + beats > beatsPerBar + 1e-9) break
      const pitch = plan.melody.pitches[pitchIndex % plan.melody.pitches.length] || 'C4'
      events.push({ pitch, duration, isRest: false })
      used += beats
      pitchIndex += 1
      rhythmIndex += 1
    }
    baseMeasures.push({ events, phraseSection: plan.phrase.sections[bar] || 'middle' })
  }

  const measures = baseMeasures.map((measure, index) => {
    const repetitionSource = index >= plan.phrase.repetitionSpan ? baseMeasures[index - plan.phrase.repetitionSpan]?.events : undefined
    return {
      phraseSection: measure.phraseSection,
      events: applyPhraseToMeasure({
        section: measure.phraseSection,
        sourceEvents: measure.events,
        theory: plan.theory,
        cadenceTone: plan.phrase.cadenceTone,
        repetitionSource,
      }),
    }
  })

  return { keySignature: plan.theory.keySignature, timeSignature, measures }
}

function runPrototypeTests() {
  const results: Array<{ name: string; passed: boolean }> = []
  const expect = (name: string, condition: boolean) => results.push({ name, passed: Boolean(condition) })

  expect('parseKeySignature finds G major', parseKeySignature('write a melody in G major') === 'g major')
  expect('measure beat count for 4/4 is 4', getMeasureBeatCount({ numerator: 4, denominator: 4 }) === 4)
  expect('theory brain finds tonic', buildTheoryContext('Write a melody in G major').tonic === 'G')
  expect('pitch parser reads notes', parseMelodicPitches('C4 D4 E4').join(',') === 'C4,D4,E4')
  expect('simple pitch generator length is correct', buildSimpleGeneratedPitchPreset({ startNote: 'C4', direction: 'up', length: 4, rangeMode: 'small', allowRepeats: true }).length === 4)
  expect('simple rhythm generator length is correct', buildSimpleGeneratedRhythmPreset({ rhythmMode: 'eighths', measureLength: 4 }).length === 8)

  const phrasePlan = buildPhraseBrain({ bars: 3, theory: buildTheoryContext('Write a melody in G major'), prompt: 'Write a phrase in G major' })
  expect('phrase brain marks opening first', phrasePlan.sections[0] === 'opening')
  expect('phrase brain marks cadence last', phrasePlan.sections[2] === 'cadence')

  const score = compositionPlanToScore(
    assembleCompositionPlan({
      prompt: 'Write an arch stepwise melody in G major with quarter notes in 4/4',
      timeSignature: { numerator: 4, denominator: 4 },
      bars: 2,
      selectedPitchPreset: 'none',
      selectedRhythmPreset: 'none',
      generatedPitchPreset: [],
      generatedRhythmPreset: [],
    }),
    { numerator: 4, denominator: 4 },
    2,
  )
  expect('score builds two measures', score.measures.length === 2)
  expect('score fills measure with quarter notes', score.measures[0].events.length === 4)
  expect('cadence measure ends on tonic', score.measures[1].events[score.measures[1].events.length - 1].pitch === 'G4')

  return results
}

function buildSimpleGeneratedPitchPreset(args: { startNote: string; direction: string; length: number; rangeMode: string; allowRepeats: boolean }): string[] {
  const { startNote, direction, length, rangeMode, allowRepeats } = args
  const startIndex = Math.max(0, NOTE_RANGE.indexOf(startNote))
  let pool = NOTE_RANGE.slice(startIndex)
  if (direction === 'down') pool = NOTE_RANGE.slice(0, startIndex + 1).reverse()
  if (direction === 'static') pool = NOTE_RANGE.slice(startIndex, startIndex + 1)
  if (rangeMode === 'small') pool = pool.slice(0, 5)
  if (rangeMode === 'medium') pool = pool.slice(0, 8)
  if (!allowRepeats) pool = [...new Set(pool)]
  return Array.from({ length: Math.max(2, length) }, (_, index) => pool[index % Math.max(pool.length, 1)] || startNote)
}

function buildSimpleGeneratedRhythmPreset(args: { rhythmMode: string; measureLength: number }): string[] {
  const { rhythmMode, measureLength } = args
  if (rhythmMode === 'sixteenths') return Array.from({ length: Math.max(1, Math.round(measureLength * 4)) }, () => 'sixteenth')
  if (rhythmMode === 'eighths') return Array.from({ length: Math.max(1, Math.round(measureLength * 2)) }, () => 'eighth')
  return Array.from({ length: Math.max(1, Math.round(measureLength)) }, () => 'quarter')
}

function SectionCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 16, padding: 20, background: '#fff', color: '#111' }}>
      <h2 style={{ marginTop: 0 }}>{props.title}</h2>
      <div style={{ display: 'grid', gap: 12 }}>{props.children}</div>
    </div>
  )
}

export default function App() {
  const [prompt, setPrompt] = useState('Write an arch stepwise melody in G major with quarter notes in 4/4')
  const [bars, setBars] = useState(2)
  const [tempo, setTempo] = useState(92)
  const [selectedPitchPreset, setSelectedPitchPreset] = useState('none')
  const [selectedRhythmPreset, setSelectedRhythmPreset] = useState('quarterStraight')
  const [generatorStartNote, setGeneratorStartNote] = useState('C4')
  const [generatorDirection, setGeneratorDirection] = useState('up')
  const [generatorLength, setGeneratorLength] = useState(4)
  const [generatorRangeMode, setGeneratorRangeMode] = useState('small')
  const [generatorRhythmMode, setGeneratorRhythmMode] = useState('quarters')
  const [generatorAllowRepeats, setGeneratorAllowRepeats] = useState(true)
  const [generatedPitchPreset, setGeneratedPitchPreset] = useState<string[]>([])
  const [generatedRhythmPreset, setGeneratedRhythmPreset] = useState<string[]>([])

  const timeSignature = useMemo(() => inferTimeSignature(prompt), [prompt])
  const compositionPlan = useMemo(
    () => assembleCompositionPlan({ prompt, timeSignature, bars, selectedPitchPreset, selectedRhythmPreset, generatedPitchPreset, generatedRhythmPreset }),
    [prompt, timeSignature, bars, selectedPitchPreset, selectedRhythmPreset, generatedPitchPreset, generatedRhythmPreset],
  )
  const musicModel = useMemo(() => compositionPlanToScore(compositionPlan, timeSignature, bars), [compositionPlan, timeSignature, bars])
  const tests = useMemo(() => runPrototypeTests(), [])
  const passedTests = tests.filter((test) => test.passed).length

  function handleGenerate() {
    setGeneratedPitchPreset(
      buildSimpleGeneratedPitchPreset({
        startNote: generatorStartNote,
        direction: generatorDirection,
        length: generatorLength,
        rangeMode: generatorRangeMode,
        allowRepeats: generatorAllowRepeats,
      }),
    )
    setGeneratedRhythmPreset(buildSimpleGeneratedRhythmPreset({ rhythmMode: generatorRhythmMode, measureLength: getMeasureBeatCount(timeSignature) }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', color: '#111', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 24 }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <SectionCard title="PromptScore Prototype">
            <div>Tempo: {tempo} BPM</div>
            <div>Meter: {timeSignature.numerator}/{timeSignature.denominator}</div>
            <div>Key: {compositionPlan.theory.keySignature || 'c major fallback'}</div>
            <div>Contour: {compositionPlan.melody.contour}</div>
            <div>Motion: {compositionPlan.melody.motion}</div>
            <div>Density: {compositionPlan.rhythm.density}</div>
            <div>Phrase cadence tone: {compositionPlan.phrase.cadenceTone}</div>
          </SectionCard>

          <SectionCard title="Prompt Input">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 12, border: '1px solid #ccc' }}
            />
            <label>
              Bars: {bars}
              <input type="range" min="1" max="8" value={bars} onChange={(e) => setBars(Number(e.target.value))} style={{ width: '100%' }} />
            </label>
            <label>
              Tempo: {tempo}
              <input type="range" min="40" max="180" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} style={{ width: '100%' }} />
            </label>
          </SectionCard>

          <SectionCard title="Generated Exercise Preview">
            <div style={{ display: 'grid', gap: 12 }}>
              {musicModel.measures.map((measure, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fafafa' }}>
                  <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>
                    Measure {index + 1} · {measure.phraseSection}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {measure.events.map((event, eventIndex) => (
                      <div key={eventIndex} style={{ minWidth: 88, padding: 12, borderRadius: 12, border: '1px solid #ccc', background: '#fff' }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{event.isRest ? 'Rest' : 'Note'}</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{event.pitch || 'Rest'}</div>
                        <div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>{event.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <SectionCard title="Generator Controls">
            <label>
              Start Note
              <select value={generatorStartNote} onChange={(e) => setGeneratorStartNote(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                {NOTE_RANGE.map((note) => <option key={note} value={note}>{note}</option>)}
              </select>
            </label>
            <label>
              Direction
              <select value={generatorDirection} onChange={(e) => setGeneratorDirection(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="static">Static</option>
              </select>
            </label>
            <label>
              Length: {generatorLength}
              <input type="range" min="2" max="8" value={generatorLength} onChange={(e) => setGeneratorLength(Number(e.target.value))} style={{ width: '100%' }} />
            </label>
            <label>
              Range
              <select value={generatorRangeMode} onChange={(e) => setGeneratorRangeMode(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="full">Full</option>
              </select>
            </label>
            <label>
              Rhythm
              <select value={generatorRhythmMode} onChange={(e) => setGeneratorRhythmMode(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                <option value="quarters">Quarters</option>
                <option value="eighths">Eighths</option>
                <option value="sixteenths">Sixteenths</option>
              </select>
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={generatorAllowRepeats} onChange={(e) => setGeneratorAllowRepeats(e.target.checked)} />
              Allow repeats
            </label>
            <label>
              Pitch Preset
              <select value={selectedPitchPreset} onChange={(e) => setSelectedPitchPreset(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                {Object.keys(PITCH_PRESETS).map((preset) => <option key={preset} value={preset}>{preset}</option>)}
              </select>
            </label>
            <label>
              Rhythm Preset
              <select value={selectedRhythmPreset} onChange={(e) => setSelectedRhythmPreset(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>
                {Object.keys(RHYTHM_PRESETS).map((preset) => <option key={preset} value={preset}>{preset}</option>)}
              </select>
            </label>
            <button onClick={handleGenerate} style={{ padding: 12, borderRadius: 12, border: 'none', background: '#111', color: '#fff', fontWeight: 700 }}>
              Generate
            </button>
          </SectionCard>

          <SectionCard title="Brain Snapshot">
            <div>Theory tonic: {compositionPlan.theory.tonic}</div>
            <div>Scale: {compositionPlan.theory.scale.join(' · ')}</div>
            <div>Melody contour: {compositionPlan.melody.contour}</div>
            <div>Melody motion: {compositionPlan.melody.motion}</div>
            <div>Rhythm density: {compositionPlan.rhythm.density}</div>
            <div>Rhythm values: {compositionPlan.rhythm.values.join(' · ')}</div>
            <div>Phrase sections: {compositionPlan.phrase.sections.join(' · ')}</div>
            <div>Cadence tone: {compositionPlan.phrase.cadenceTone}</div>
            <div>Repetition span: {compositionPlan.phrase.repetitionSpan}</div>
          </SectionCard>

          <SectionCard title="Prototype Checks">
            <div>{passedTests}/{tests.length} checks passing</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {tests.map((test) => (
                <div key={test.name} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                  <span>{test.name}</span>
                  <span style={{ color: test.passed ? 'green' : 'crimson' }}>{test.passed ? 'Pass' : 'Fail'}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
