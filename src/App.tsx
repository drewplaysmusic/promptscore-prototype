import React, { useMemo, useState } from 'react'

type TimeSignature = { numerator: number; denominator: number }
type TheoryContext = {
  keySignature: string
  tonic: string
  scale: string[]
  accidentals: Record<string, string>
  chromaticPool: string[]
  diatonicPool: string[]
}
type MelodyContour = 'ascending' | 'descending' | 'arch' | 'wave' | 'static'
type MelodyMotion = 'stepwise' | 'balanced' | 'leapy'
type RhythmDensity = 'sparse' | 'balanced' | 'busy'
type RhythmFamily = 'duple' | 'dotted' | 'tuplet'
type PhraseSection = 'opening' | 'middle' | 'cadence'
type HarmonyFunction = 'tonic' | 'predominant' | 'dominant' | 'cadential'
type MelodyPlan = {
  contour: MelodyContour
  motion: MelodyMotion
  targetLength: number
  pitches: string[]
}
type RhythmPlan = {
  density: RhythmDensity
  family: RhythmFamily
  allowedDurations: string[]
  values: string[]
}
type PhrasePlan = {
  sections: PhraseSection[]
  cadenceTone: string
  repetitionSpan: number
}
type HarmonyPlan = {
  functions: HarmonyFunction[]
  tonicTargets: string[]
  predominantTargets: string[]
  dominantTargets: string[]
  cadenceTargets: string[]
}
type CompositionPlan = {
  theory: TheoryContext
  melody: MelodyPlan
  rhythm: RhythmPlan
  phrase: PhrasePlan
  harmony: HarmonyPlan
}
type ScoreEvent = {
  pitch: string | null
  duration: string
  isRest: boolean
}
type MeasureModel = {
  events: ScoreEvent[]
  phraseSection: PhraseSection
  harmonyFunction: HarmonyFunction
}

type ScoreModel = {
  keySignature: string
  timeSignature: TimeSignature
  measures: MeasureModel[]
}

const NOTE_RANGE = ['C1', 'C2', 'C3', 'C4', 'C5']
const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const DURATION_BEATS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  'thirty-second': 0.125,
  'dotted-half': 3,
  'dotted-quarter': 1.5,
  'dotted-eighth': 0.75,
  'dotted-sixteenth': 0.375,
  'quarter-triplet': 2 / 3,
  'eighth-triplet': 1 / 3,
  'sixteenth-triplet': 1 / 6,
}
const RHYTHM_FAMILY_DURATIONS: Record<RhythmFamily, string[]> = {
  duple: ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirty-second'],
  dotted: ['dotted-half', 'dotted-quarter', 'dotted-eighth', 'dotted-sixteenth', 'quarter', 'eighth'],
  tuplet: ['quarter-triplet', 'eighth-triplet', 'sixteenth-triplet', 'quarter', 'eighth'],
}
const CONTOUR_PATTERNS: Record<MelodyContour, number[]> = {
  ascending: [0, 1, 2, 3, 4, 5, 6, 5],
  descending: [6, 5, 4, 3, 2, 1, 0, 1],
  arch: [0, 1, 2, 4, 5, 4, 2, 1],
  wave: [0, 2, 1, 3, 2, 4, 3, 1],
  static: [0, 0, 1, 0, 0, 1, 0, 0],
}
const KEY_SIGNATURE_LIBRARY: Record<string, string[]> = {
  'c major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'g major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'd major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'f major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  'a minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  'e minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
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
  cMajorAscending: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
  cMajorArpeggio: ['C3', 'E3', 'G3', 'C4'],
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

function inferRhythmFamily(prompt: string): RhythmFamily {
  const text = prompt.toLowerCase()
  if (text.includes('triplet') || text.includes('tuplet')) return 'tuplet'
  if (text.includes('dotted')) return 'dotted'
  return 'duple'
}

function parseRequestedDurations(prompt: string, family: RhythmFamily): string[] {
  const text = prompt.toLowerCase()
  const allowed = RHYTHM_FAMILY_DURATIONS[family]
  const requested: string[] = []
  if (family === 'duple') {
    if (text.includes('whole')) requested.push('whole')
    if (text.includes('half')) requested.push('half')
    if (text.includes('quarter')) requested.push('quarter')
    if (text.includes('eighth') || text.includes('8th')) requested.push('eighth')
    if (text.includes('sixteenth') || text.includes('16th')) requested.push('sixteenth')
    if (text.includes('thirty-second') || text.includes('32nd')) requested.push('thirty-second')
  }
  if (family === 'dotted') {
    if (text.includes('dotted half')) requested.push('dotted-half')
    if (text.includes('dotted quarter')) requested.push('dotted-quarter')
    if (text.includes('dotted eighth')) requested.push('dotted-eighth')
    if (text.includes('dotted sixteenth')) requested.push('dotted-sixteenth')
  }
  if (family === 'tuplet') {
    if (text.includes('quarter triplet')) requested.push('quarter-triplet')
    if (text.includes('eighth triplet') || text.includes('triplet')) requested.push('eighth-triplet')
    if (text.includes('sixteenth triplet')) requested.push('sixteenth-triplet')
  }
  return requested.length ? requested.filter((value) => allowed.includes(value)) : [...allowed]
}

function inferRhythmDensity(prompt: string): RhythmDensity {
  const text = prompt.toLowerCase()
  if (text.includes('busy') || text.includes('fast') || text.includes('sixteenth') || text.includes('32nd')) return 'busy'
  if (text.includes('sparse') || text.includes('slow') || text.includes('whole') || text.includes('half')) return 'sparse'
  return 'balanced'
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

function getPitchClass(pitch: string): string {
  return pitch.slice(0, -1)
}

function getOctave(pitch: string): number {
  return Number(pitch.slice(-1))
}

function createChromaticPool(minOctave = 1, maxOctave = 5): string[] {
  const pool: string[] = []
  for (let octave = minOctave; octave <= maxOctave; octave += 1) {
    for (const pitchClass of CHROMATIC_SHARPS) pool.push(`${pitchClass}${octave}`)
  }
  return pool
}

function normalizeEnharmonic(pitchClass: string): string {
  if (pitchClass === 'Bb') return 'A#'
  if (pitchClass === 'Eb') return 'D#'
  return pitchClass
}

function buildDiatonicPool(scalePitchClasses: string[], minOctave = 1, maxOctave = 5): string[] {
  const normalizedSet = new Set(scalePitchClasses.map(normalizeEnharmonic))
  return createChromaticPool(minOctave, maxOctave).filter((pitch) => normalizedSet.has(getPitchClass(pitch)))
}

function buildTheoryContext(prompt: string): TheoryContext {
  const keySignature = parseKeySignature(prompt)
  const scale = KEY_SIGNATURE_LIBRARY[keySignature] || KEY_SIGNATURE_LIBRARY['c major']
  const chromaticPool = createChromaticPool(1, 5)
  const diatonicPool = buildDiatonicPool(scale, 1, 5)
  return { keySignature, tonic: scale[0] || 'C', scale, accidentals: KEY_SIGNATURE_ACCIDENTALS[keySignature] || {}, chromaticPool, diatonicPool }
}

function spreadScaleAcrossOctaves(scale: string[], minOctave = 1, maxOctave = 5): string[] {
  const pitches: string[] = []
  for (let octave = minOctave; octave <= maxOctave; octave += 1) {
    for (const pitchClass of scale) pitches.push(`${pitchClass}${octave}`)
  }
  return pitches
}

function buildMelodyBrain(args: { prompt: string; theory: TheoryContext; targetLength: number; explicitPitches: string[]; generatedPitchPreset: string[]; selectedPitchPreset: string }): MelodyPlan {
  const { prompt, theory, targetLength, explicitPitches, generatedPitchPreset, selectedPitchPreset } = args
  if (generatedPitchPreset.length) return { contour: 'ascending', motion: 'balanced', targetLength, pitches: generatedPitchPreset }
  if (selectedPitchPreset !== 'none' && PITCH_PRESETS[selectedPitchPreset]) return { contour: 'ascending', motion: 'balanced', targetLength, pitches: PITCH_PRESETS[selectedPitchPreset] }
  if (explicitPitches.length) return { contour: 'static', motion: 'balanced', targetLength, pitches: explicitPitches }
  const contour = parseContour(prompt)
  const motion = parseMotion(prompt)
  const expandedScale = spreadScaleAcrossOctaves(theory.scale, 1, 5)
  const registerCenter = prompt.toLowerCase().includes('low') ? 2 : prompt.toLowerCase().includes('high') ? 4 : 3
  const filteredScale = expandedScale.filter((pitch) => Math.abs(getOctave(pitch) - registerCenter) <= 2)
  const melodicPool = filteredScale.length ? filteredScale : expandedScale
  const pattern = CONTOUR_PATTERNS[contour]
  const tonicClass = normalizeEnharmonic(theory.tonic)
  const startIndex = Math.max(0, melodicPool.findIndex((pitch) => normalizeEnharmonic(getPitchClass(pitch)) === tonicClass))
  const pitches = Array.from({ length: Math.max(4, targetLength) }, (_, index) => {
    let degree = pattern[index % pattern.length]
    if (motion === 'stepwise' && index > 0) {
      const prev = pattern[(index - 1) % pattern.length]
      if (Math.abs(degree - prev) > 2) degree = prev + Math.sign(degree - prev) * 2
    }
    if (motion === 'leapy' && index % 3 === 2) degree += 3
    const poolIndex = Math.max(0, Math.min(melodicPool.length - 1, startIndex + degree))
    return melodicPool[poolIndex] || melodicPool[0] || 'C3'
  })
  return { contour, motion, targetLength, pitches }
}

function fillMeasureWithDurations(measureBeats: number, durations: string[]): string[] {
  const values: string[] = []
  let used = 0
  let index = 0
  while (used < measureBeats - 1e-9 && index < 128) {
    const duration = durations[index % Math.max(durations.length, 1)] || 'quarter'
    const beats = getBeatsForDuration(duration)
    if (used + beats <= measureBeats + 1e-9) {
      values.push(duration)
      used += beats
    }
    index += 1
    if (durations.length === 0) break
  }
  return values.length ? values : ['quarter']
}

function buildRhythmBrain(args: { prompt: string; measureBeats: number; generatedRhythmPreset: string[]; selectedRhythmPreset: string }): RhythmPlan {
  const { prompt, measureBeats, generatedRhythmPreset, selectedRhythmPreset } = args
  if (generatedRhythmPreset.length) return { density: 'balanced', family: 'duple', allowedDurations: [...new Set(generatedRhythmPreset)], values: generatedRhythmPreset }
  if (selectedRhythmPreset !== 'none' && RHYTHM_PRESETS[selectedRhythmPreset]) return { density: 'balanced', family: 'duple', allowedDurations: [...new Set(RHYTHM_PRESETS[selectedRhythmPreset])], values: RHYTHM_PRESETS[selectedRhythmPreset] }
  const family = inferRhythmFamily(prompt)
  const density = inferRhythmDensity(prompt)
  const allowedDurations = parseRequestedDurations(prompt, family)
  let orderedDurations = [...allowedDurations]
  if (density === 'sparse') orderedDurations = [...orderedDurations].sort((a, b) => getBeatsForDuration(b) - getBeatsForDuration(a))
  if (density === 'busy') orderedDurations = [...orderedDurations].sort((a, b) => getBeatsForDuration(a) - getBeatsForDuration(b))
  const values = fillMeasureWithDurations(measureBeats, orderedDurations)
  return { density, family, allowedDurations, values }
}

function buildPhraseBrain(args: { bars: number; theory: TheoryContext; prompt: string }): PhrasePlan {
  const { bars, theory, prompt } = args
  const sections: PhraseSection[] = Array.from({ length: Math.max(1, bars) }, (_, index) => (bars === 1 ? 'cadence' : index === 0 ? 'opening' : index === bars - 1 ? 'cadence' : 'middle'))
  const cadenceTone = `${theory.scale[0] || theory.tonic}3`
  const repetitionSpan = prompt.toLowerCase().includes('variation') ? 1 : Math.min(2, Math.max(1, bars - 1))
  return { sections, cadenceTone, repetitionSpan }
}

function buildHarmonyTargetPool(theory: TheoryContext, degrees: number[], minOctave = 1, maxOctave = 5): string[] {
  const pitchClasses = degrees.map((degree) => theory.scale[((degree % 7) + 7) % 7]).filter(Boolean)
  return buildDiatonicPool(pitchClasses, minOctave, maxOctave)
}

function buildHarmonyBrain(args: { theory: TheoryContext; phrase: PhrasePlan; bars: number }): HarmonyPlan {
  const { theory, phrase, bars } = args
  const tonicTargets = buildHarmonyTargetPool(theory, [0, 2, 4], 1, 5)
  const predominantTargets = buildHarmonyTargetPool(theory, [1, 3, 5], 1, 5)
  const dominantTargets = buildHarmonyTargetPool(theory, [4, 6, 1], 1, 5)
  const cadenceTargets = buildHarmonyTargetPool(theory, [4, 6, 0], 1, 5)
  const functions: HarmonyFunction[] = Array.from({ length: Math.max(1, bars) }, (_, index) => {
    const section = phrase.sections[index] || 'middle'
    if (section === 'opening') return 'tonic'
    if (section === 'cadence') return 'cadential'
    return index % 2 === 0 ? 'predominant' : 'dominant'
  })
  return { functions, tonicTargets, predominantTargets, dominantTargets, cadenceTargets }
}

function assembleCompositionPlan(args: { prompt: string; timeSignature: TimeSignature; bars: number; selectedPitchPreset: string; selectedRhythmPreset: string; generatedPitchPreset: string[]; generatedRhythmPreset: string[] }): CompositionPlan {
  const theory = buildTheoryContext(args.prompt)
  const melody = buildMelodyBrain({ prompt: args.prompt, theory, targetLength: Math.max(4, args.bars * 4), explicitPitches: parseMelodicPitches(args.prompt), generatedPitchPreset: args.generatedPitchPreset, selectedPitchPreset: args.selectedPitchPreset })
  const rhythm = buildRhythmBrain({ prompt: args.prompt, measureBeats: getMeasureBeatCount(args.timeSignature), generatedRhythmPreset: args.generatedRhythmPreset, selectedRhythmPreset: args.selectedRhythmPreset })
  const phrase = buildPhraseBrain({ bars: args.bars, theory, prompt: args.prompt })
  const harmony = buildHarmonyBrain({ theory, phrase, bars: args.bars })
  return { theory, melody, rhythm, phrase, harmony }
}

function getHarmonyTargets(plan: HarmonyPlan, harmonyFunction: HarmonyFunction): string[] {
  if (harmonyFunction === 'tonic') return plan.tonicTargets
  if (harmonyFunction === 'predominant') return plan.predominantTargets
  if (harmonyFunction === 'dominant') return plan.dominantTargets
  return plan.cadenceTargets
}

function nearestPitchFromPool(targetPitch: string | null, pool: string[]): string {
  if (!targetPitch || !pool.length) return pool[0] || 'C3'
  const targetOctave = getOctave(targetPitch)
  const targetClass = normalizeEnharmonic(getPitchClass(targetPitch))
  const sameClass = pool.filter((pitch) => normalizeEnharmonic(getPitchClass(pitch)) === targetClass)
  const candidates = sameClass.length ? sameClass : pool
  return candidates.reduce((best, current) => (Math.abs(getOctave(current) - targetOctave) < Math.abs(getOctave(best) - targetOctave) ? current : best), candidates[0])
}

function alignEventsToHarmony(args: { events: ScoreEvent[]; harmonyTargets: string[]; cadenceTone: string; section: PhraseSection }): ScoreEvent[] {
  const { events, harmonyTargets, cadenceTone, section } = args
  return events.map((event, index) => {
    if (event.isRest) return event
    const target = harmonyTargets[index % Math.max(harmonyTargets.length, 1)] || event.pitch || 'C3'
    const nextPitch = nearestPitchFromPool(event.pitch, harmonyTargets.length ? harmonyTargets : [target])
    if (section === 'cadence' && index === events.length - 1) return { ...event, pitch: cadenceTone }
    return { ...event, pitch: nextPitch || target }
  })
}

function applyPhraseToMeasure(args: { section: PhraseSection; sourceEvents: ScoreEvent[]; theory: TheoryContext; cadenceTone: string; repetitionSource?: ScoreEvent[] }): ScoreEvent[] {
  const { section, sourceEvents, theory, cadenceTone, repetitionSource } = args
  const events = sourceEvents.map((event) => ({ ...event }))
  if (section === 'opening') {
    if (events[0]) events[0].pitch = nearestPitchFromPool(`${theory.scale[0]}3`, theory.diatonicPool)
    return events
  }
  if (section === 'middle') {
    if (repetitionSource && repetitionSource.length === events.length) {
      return repetitionSource.map((event, index) => {
        if (index % 2 === 0) return { ...event }
        const currentIndex = theory.diatonicPool.indexOf(event.pitch || '')
        const nextIndex = currentIndex >= 0 ? Math.min(theory.diatonicPool.length - 1, currentIndex + 1) : Math.min(1, theory.diatonicPool.length - 1)
        return { ...event, pitch: theory.diatonicPool[nextIndex] || event.pitch }
      })
    }
    return events
  }
  if (events.length > 0) {
    events[events.length - 1] = { ...events[events.length - 1], pitch: cadenceTone }
    if (events.length > 1) {
      const dominantClass = theory.scale[4] || theory.scale[1] || theory.scale[0]
      events[events.length - 2] = { ...events[events.length - 2], pitch: nearestPitchFromPool(`${dominantClass}3`, theory.diatonicPool) }
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
      const pitch = plan.melody.pitches[pitchIndex % plan.melody.pitches.length] || 'C3'
      events.push({ pitch, duration, isRest: false })
      used += beats
      pitchIndex += 1
      rhythmIndex += 1
    }
    baseMeasures.push({ events, phraseSection: plan.phrase.sections[bar] || 'middle', harmonyFunction: plan.harmony.functions[bar] || 'tonic' })
  }
  const measures = baseMeasures.map((measure, index) => {
    const repetitionSource = index >= plan.phrase.repetitionSpan ? baseMeasures[index - plan.phrase.repetitionSpan]?.events : undefined
    const phraseEvents = applyPhraseToMeasure({ section: measure.phraseSection, sourceEvents: measure.events, theory: plan.theory, cadenceTone: plan.phrase.cadenceTone, repetitionSource })
    return { phraseSection: measure.phraseSection, harmonyFunction: measure.harmonyFunction, events: alignEventsToHarmony({ events: phraseEvents, harmonyTargets: getHarmonyTargets(plan.harmony, measure.harmonyFunction), cadenceTone: plan.phrase.cadenceTone, section: measure.phraseSection }) }
  })
  return { keySignature: plan.theory.keySignature, timeSignature, measures }
}

function runPrototypeTests() {
  const results: Array<{ name: string; passed: boolean }> = []
  const expect = (name: string, condition: boolean) => results.push({ name, passed: Boolean(condition) })
  const theory = buildTheoryContext('Write in C major')
  expect('chromatic pool spans octaves 1 to 5', theory.chromaticPool.includes('C1') && theory.chromaticPool.includes('B5'))
  expect('duple family inferred by default', inferRhythmFamily('Write quarter notes') === 'duple')
  expect('dotted family inferred from prompt', inferRhythmFamily('Write dotted quarter rhythms') === 'dotted')
  expect('tuplet family inferred from prompt', inferRhythmFamily('Write triplet rhythms') === 'tuplet')
  expect('duple durations include thirty-second', RHYTHM_FAMILY_DURATIONS.duple.includes('thirty-second'))
  const dottedPlan = buildRhythmBrain({ prompt: 'Write dotted quarter and dotted eighth rhythms', measureBeats: 4, generatedRhythmPreset: [], selectedRhythmPreset: 'none' })
  expect('dotted plan uses dotted family', dottedPlan.family === 'dotted')
  expect('dotted plan includes dotted quarter', dottedPlan.allowedDurations.includes('dotted-quarter'))
  const tripletPlan = buildRhythmBrain({ prompt: 'Write eighth triplet rhythms', measureBeats: 4, generatedRhythmPreset: [], selectedRhythmPreset: 'none' })
  expect('triplet plan uses tuplet family', tripletPlan.family === 'tuplet')
  expect('triplet plan includes eighth triplet', tripletPlan.allowedDurations.includes('eighth-triplet'))
  return results
}

function buildSimpleGeneratedPitchPreset(args: { startNote: string; direction: string; length: number; rangeMode: string; allowRepeats: boolean }): string[] {
  const { startNote, direction, length, rangeMode, allowRepeats } = args
  const startIndex = Math.max(0, NOTE_RANGE.indexOf(startNote))
  let pool = NOTE_RANGE.slice(startIndex)
  if (direction === 'down') pool = NOTE_RANGE.slice(0, startIndex + 1).reverse()
  if (direction === 'static') pool = NOTE_RANGE.slice(startIndex, startIndex + 1)
  if (rangeMode === 'small') pool = pool.slice(0, 3)
  if (rangeMode === 'medium') pool = pool.slice(0, 4)
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
  return <div style={{ border: '1px solid #ddd', borderRadius: 16, padding: 20, background: '#fff', color: '#111' }}><h2 style={{ marginTop: 0 }}>{props.title}</h2><div style={{ display: 'grid', gap: 12 }}>{props.children}</div></div>
}

export default function App() {
  const [prompt, setPrompt] = useState('Write an arch stepwise melody in G major with quarter notes in 4/4')
  const [bars, setBars] = useState(3)
  const [tempo, setTempo] = useState(92)
  const [selectedPitchPreset, setSelectedPitchPreset] = useState('none')
  const [selectedRhythmPreset, setSelectedRhythmPreset] = useState('none')
  const [generatorStartNote, setGeneratorStartNote] = useState('C3')
  const [generatorDirection, setGeneratorDirection] = useState('up')
  const [generatorLength, setGeneratorLength] = useState(4)
  const [generatorRangeMode, setGeneratorRangeMode] = useState('medium')
  const [generatorRhythmMode, setGeneratorRhythmMode] = useState('quarters')
  const [generatorAllowRepeats, setGeneratorAllowRepeats] = useState(true)
  const [generatedPitchPreset, setGeneratedPitchPreset] = useState<string[]>([])
  const [generatedRhythmPreset, setGeneratedRhythmPreset] = useState<string[]>([])

  const timeSignature = useMemo(() => inferTimeSignature(prompt), [prompt])
  const compositionPlan = useMemo(() => assembleCompositionPlan({ prompt, timeSignature, bars, selectedPitchPreset, selectedRhythmPreset, generatedPitchPreset, generatedRhythmPreset }), [prompt, timeSignature, bars, selectedPitchPreset, selectedRhythmPreset, generatedPitchPreset, generatedRhythmPreset])
  const musicModel = useMemo(() => compositionPlanToScore(compositionPlan, timeSignature, bars), [compositionPlan, timeSignature, bars])
  const tests = useMemo(() => runPrototypeTests(), [])
  const passedTests = tests.filter((test) => test.passed).length

  function handleGenerate() {
    setGeneratedPitchPreset(buildSimpleGeneratedPitchPreset({ startNote: generatorStartNote, direction: generatorDirection, length: generatorLength, rangeMode: generatorRangeMode, allowRepeats: generatorAllowRepeats }))
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
            <div>Rhythm family: {compositionPlan.rhythm.family}</div>
            <div>Rhythm density: {compositionPlan.rhythm.density}</div>
          </SectionCard>
          <SectionCard title="Prompt Input">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 12, border: '1px solid #ccc' }} />
            <label>Bars: {bars}<input type="range" min="1" max="8" value={bars} onChange={(e) => setBars(Number(e.target.value))} style={{ width: '100%' }} /></label>
            <label>Tempo: {tempo}<input type="range" min="40" max="180" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} style={{ width: '100%' }} /></label>
          </SectionCard>
          <SectionCard title="Generated Exercise Preview">
            <div style={{ display: 'grid', gap: 12 }}>{musicModel.measures.map((measure, index) => <div key={index} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fafafa' }}><div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>Measure {index + 1} · {measure.phraseSection} · {measure.harmonyFunction}</div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{measure.events.map((event, eventIndex) => <div key={eventIndex} style={{ minWidth: 88, padding: 12, borderRadius: 12, border: '1px solid #ccc', background: '#fff' }}><div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{event.isRest ? 'Rest' : 'Note'}</div><div style={{ fontSize: 22, fontWeight: 700 }}>{event.pitch || 'Rest'}</div><div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>{event.duration}</div></div>)}</div></div>)}</div>
          </SectionCard>
        </div>
        <div style={{ display: 'grid', gap: 24 }}>
          <SectionCard title="Generator Controls">
            <label>Start Note<select value={generatorStartNote} onChange={(e) => setGeneratorStartNote(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>{NOTE_RANGE.map((note) => <option key={note} value={note}>{note}</option>)}</select></label>
            <label>Direction<select value={generatorDirection} onChange={(e) => setGeneratorDirection(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}><option value="up">Up</option><option value="down">Down</option><option value="static">Static</option></select></label>
            <label>Length: {generatorLength}<input type="range" min="2" max="8" value={generatorLength} onChange={(e) => setGeneratorLength(Number(e.target.value))} style={{ width: '100%' }} /></label>
            <label>Range<select value={generatorRangeMode} onChange={(e) => setGeneratorRangeMode(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}><option value="small">Small</option><option value="medium">Medium</option><option value="full">Full</option></select></label>
            <label>Rhythm<select value={generatorRhythmMode} onChange={(e) => setGeneratorRhythmMode(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}><option value="quarters">Quarters</option><option value="eighths">Eighths</option><option value="sixteenths">Sixteenths</option></select></label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={generatorAllowRepeats} onChange={(e) => setGeneratorAllowRepeats(e.target.checked)} />Allow repeats</label>
            <label>Pitch Preset<select value={selectedPitchPreset} onChange={(e) => setSelectedPitchPreset(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>{Object.keys(PITCH_PRESETS).map((preset) => <option key={preset} value={preset}>{preset}</option>)}</select></label>
            <label>Rhythm Preset<select value={selectedRhythmPreset} onChange={(e) => setSelectedRhythmPreset(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }}>{Object.keys(RHYTHM_PRESETS).map((preset) => <option key={preset} value={preset}>{preset}</option>)}</select></label>
            <button onClick={handleGenerate} style={{ padding: 12, borderRadius: 12, border: 'none', background: '#111', color: '#fff', fontWeight: 700 }}>Generate</button>
          </SectionCard>
          <SectionCard title="Brain Snapshot">
            <div>Theory tonic: {compositionPlan.theory.tonic}</div>
            <div>Scale classes: {compositionPlan.theory.scale.join(' · ')}</div>
            <div>Rhythm family: {compositionPlan.rhythm.family}</div>
            <div>Rhythm density: {compositionPlan.rhythm.density}</div>
            <div>Allowed durations: {compositionPlan.rhythm.allowedDurations.join(' · ')}</div>
            <div>Generated rhythm values: {compositionPlan.rhythm.values.join(' · ')}</div>
            <div>Phrase sections: {compositionPlan.phrase.sections.join(' · ')}</div>
            <div>Harmony functions: {compositionPlan.harmony.functions.join(' · ')}</div>
          </SectionCard>
          <SectionCard title="Prototype Checks">
            <div>{passedTests}/{tests.length} checks passing</div>
            <div style={{ display: 'grid', gap: 8 }}>{tests.map((test) => <div key={test.name} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}><span>{test.name}</span><span style={{ color: test.passed ? 'green' : 'crimson' }}>{test.passed ? 'Pass' : 'Fail'}</span></div>)}</div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
