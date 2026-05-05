import { getTicksPerPulse, getPulseCount, type TimeSignatureValue } from './pulseGridEngine'

export type GridRatio = {
  actual: number
  normal: number
}

export type XGridSpan = {
  measure: number
  startTick: number
  endTick: number
  durationTicks: number
  startXRatio: number
  endXRatio: number
  label: string
  ratio?: GridRatio
}

export type YGridRow = {
  pitch: string
  octave: number
  staffStep: number
  requiresLedgerLine: boolean
  yIndex: number
}

export type MusicXYEvent = {
  id: string
  measure: number
  x: XGridSpan
  y: YGridRow
  attack: boolean
  isRest: boolean
  beamGroupId?: string
  tupletGroupId?: string
  bracketGroupId?: string
  ratioLabel?: string
}

export type MusicXYMeasureGrid = {
  measure: number
  timeSignature: TimeSignatureValue
  pulseCount: number
  ticksPerPulse: number
  ticksPerMeasure: number
  xColumns: XGridSpan[]
}

const DEFAULT_FINE_DIVISIONS = [2, 3, 4, 5, 6, 7, 8, 9, 12, 16]
const PITCH_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y) {
    const next = x % y
    x = y
    y = next
  }

  return x || 1
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function getLeastCommonRhythmDivision(divisions = DEFAULT_FINE_DIVISIONS): number {
  return divisions.reduce((acc, value) => lcm(acc, value), 1)
}

export function createMusicXYMeasureGrid(
  timeSignature: TimeSignatureValue,
  measure = 1,
  fineDivisions = DEFAULT_FINE_DIVISIONS,
): MusicXYMeasureGrid {
  const pulseCount = getPulseCount(timeSignature)
  const ticksPerPulse = getTicksPerPulse(timeSignature)
  const ticksPerMeasure = pulseCount * ticksPerPulse
  const leastCommonDivision = getLeastCommonRhythmDivision(fineDivisions)
  const columnTicks = ticksPerPulse / leastCommonDivision
  const columnCount = pulseCount * leastCommonDivision

  const xColumns: XGridSpan[] = Array.from({ length: columnCount }, (_, index) => {
    const startTick = index * columnTicks
    const endTick = startTick + columnTicks

    return {
      measure,
      startTick,
      endTick,
      durationTicks: columnTicks,
      startXRatio: startTick / ticksPerMeasure,
      endXRatio: endTick / ticksPerMeasure,
      label: `m${measure}-x${index}`,
    }
  })

  return {
    measure,
    timeSignature,
    pulseCount,
    ticksPerPulse,
    ticksPerMeasure,
    xColumns,
  }
}

export function createRatioSpans(
  grid: MusicXYMeasureGrid,
  actual: number,
  normal: number,
  startPulse = 1,
  spanPulses = 1,
): XGridSpan[] {
  const safeActual = Math.max(1, actual)
  const safeNormal = Math.max(1, normal)
  const safeStartPulse = Math.max(1, startPulse)
  const safeSpanPulses = Math.max(1, spanPulses)
  const startTick = (safeStartPulse - 1) * grid.ticksPerPulse
  const spanTicks = safeSpanPulses * grid.ticksPerPulse
  const eventTicks = spanTicks / safeActual

  return Array.from({ length: safeActual }, (_, index) => {
    const eventStartTick = startTick + index * eventTicks
    const eventEndTick = eventStartTick + eventTicks

    return {
      measure: grid.measure,
      startTick: eventStartTick,
      endTick: eventEndTick,
      durationTicks: eventTicks,
      startXRatio: eventStartTick / grid.ticksPerMeasure,
      endXRatio: eventEndTick / grid.ticksPerMeasure,
      label: `${safeActual}:${safeNormal}-${index + 1}`,
      ratio: {
        actual: safeActual,
        normal: safeNormal,
      },
    }
  })
}

export function subdivideSpanIntoRatio(parent: XGridSpan, actual: number, normal = actual): XGridSpan[] {
  const safeActual = Math.max(1, actual)
  const safeNormal = Math.max(1, normal)
  const childTicks = parent.durationTicks / safeActual

  return Array.from({ length: safeActual }, (_, index) => {
    const startTick = parent.startTick + childTicks * index
    const endTick = startTick + childTicks

    return {
      measure: parent.measure,
      startTick,
      endTick,
      durationTicks: childTicks,
      startXRatio: parent.startXRatio + (parent.endXRatio - parent.startXRatio) * (index / safeActual),
      endXRatio: parent.startXRatio + (parent.endXRatio - parent.startXRatio) * ((index + 1) / safeActual),
      label: `${parent.label}/sub-${safeActual}:${safeNormal}-${index + 1}`,
      ratio: {
        actual: safeActual,
        normal: safeNormal,
      },
    }
  })
}

export function createNestedRatioSpans(
  grid: MusicXYMeasureGrid,
  parentActual: number,
  parentNormal: number,
  childActual: number,
  childNormal: number,
  startPulse = 1,
  spanPulses = 2,
): XGridSpan[] {
  const parentSpans = createRatioSpans(grid, parentActual, parentNormal, startPulse, spanPulses)
  return parentSpans.flatMap((parentSpan) => subdivideSpanIntoRatio(parentSpan, childActual, childNormal))
}

export function createPitchRow(pitch: string, octave = 4, staffMiddlePitch = 'B', staffMiddleOctave = 4): YGridRow {
  const pitchIndex = PITCH_ORDER.indexOf(pitch.toUpperCase())
  const middleIndex = PITCH_ORDER.indexOf(staffMiddlePitch.toUpperCase())
  const safePitchIndex = pitchIndex >= 0 ? pitchIndex : 0
  const safeMiddleIndex = middleIndex >= 0 ? middleIndex : 6
  const yIndex = (octave - staffMiddleOctave) * 7 + (safePitchIndex - safeMiddleIndex)
  const staffStep = yIndex

  return {
    pitch: pitch.toUpperCase(),
    octave,
    staffStep,
    requiresLedgerLine: Math.abs(staffStep) > 4,
    yIndex,
  }
}

export function createMusicXYEventsFromSpans(spans: XGridSpan[], pitch = 'C', octave = 4): MusicXYEvent[] {
  const y = createPitchRow(pitch, octave)
  const groupLabel = spans[0]?.ratio ? `${spans[0].ratio.actual}:${spans[0].ratio.normal}` : undefined

  return spans.map((span, index) => ({
    id: `xy-m${span.measure}-${span.label}`,
    measure: span.measure,
    x: span,
    y,
    attack: true,
    isRest: false,
    beamGroupId: `xy-m${span.measure}-${groupLabel ?? 'beam'}`,
    tupletGroupId: groupLabel ? `xy-m${span.measure}-tuplet-${groupLabel}` : undefined,
    bracketGroupId: groupLabel ? `xy-m${span.measure}-bracket-${groupLabel}` : undefined,
    ratioLabel: groupLabel,
  }))
}

export function describeNestedRhythmExample(timeSignature: TimeSignatureValue): string {
  const grid = createMusicXYMeasureGrid(timeSignature)
  const quarterNoteTriplets = createRatioSpans(grid, 3, 2, 1, 2)
  const nineletCells = quarterNoteTriplets.flatMap((triplet) => subdivideSpanIntoRatio(triplet, 3, 1))

  return `${timeSignature}: quarter-note triplets across 2 pulses create ${quarterNoteTriplets.length} parent cells; subdividing each by 3 creates ${nineletCells.length} ninelet attack cells with exact x-ratios.`
}
