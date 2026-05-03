export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'

export type SubdivisionFamily =
  | 'whole-pulse'
  | 'duple'
  | 'triplet'
  | 'quad'
  | 'quintuplet'
  | 'sextuplet'
  | 'septuplet'
  | 'custom'

export type RhythmIntent =
  | 'attack'
  | 'rest'
  | 'tie-continuation'

export type PulseGridConfig = {
  timeSignature: TimeSignatureValue
  tempoBpm: number
  pixelsPerPulse?: number
  staffLineCount?: 1 | 2 | 3 | 4 | 5
  customSubdivisions?: number[]
}

export type TimeSignatureParts = {
  top: number
  bottom: number
}

export type SubdivisionSlot = {
  index: number
  family: SubdivisionFamily
  denominator: number
  startTick: number
  endTick: number
  startMs: number
  endMs: number
  x: number
}

export type PulseBox = {
  measure: number
  pulse: number
  startTick: number
  endTick: number
  startMs: number
  endMs: number
  xStart: number
  xEnd: number
  subdivisions: SubdivisionSlot[]
}

export type MeasureGrid = {
  measure: number
  timeSignature: TimeSignatureValue
  tempoBpm: number
  pulseCount: number
  beatUnit: number
  ticksPerPulse: number
  ticksPerMeasure: number
  msPerPulse: number
  msPerMeasure: number
  pixelsPerPulse: number
  width: number
  staffLineCount: 1 | 2 | 3 | 4 | 5
  pulses: PulseBox[]
}

export type RhythmDuration = {
  label: string
  ticks: number
  family: SubdivisionFamily
  notationValue: string
  tupletRatio?: {
    actual: number
    normal: number
  }
}

export type RatioGrid = {
  actualNotes: number
  normalNotes: number
  spanPulses: number
  startPulse: number
  measure?: number
  label?: string
}

export type RatioRhythmEvent = {
  id: string
  measure: number
  pulse: number
  indexInRatio: number
  startTick: number
  durationTicks: number
  endTick: number
  startMs: number
  durationMs: number
  endMs: number
  startX: number
  endX: number
  y: number
  ratioLabel: string
  groupId: string
  beamGroupId: string
  bracketGroupId?: string
  actualNotes: number
  normalNotes: number
  spanPulses: number
}

export type RatioGridResult = {
  measureGrid: MeasureGrid
  ratio: RatioGrid
  events: RatioRhythmEvent[]
  summary: string
}

export type RhythmEventInput = {
  duration: RhythmDuration
  intent?: RhythmIntent
  y?: number
  voice?: string
}

export type RhythmGridEvent = {
  id: string
  measure: number
  pulse: number
  slot: number
  intent: RhythmIntent
  startTick: number
  durationTicks: number
  endTick: number
  startMs: number
  durationMs: number
  endMs: number
  startX: number
  endX: number
  y: number
  voice: string
  notationValue: string
  subdivisionFamily: SubdivisionFamily
  beamGroupId: string
  tupletGroupId?: string
  crossesPulse: boolean
  requiresTie: boolean
  splitFromEventId?: string
}

export type RhythmGridResult = {
  measureGrid: MeasureGrid
  events: RhythmGridEvent[]
  overflow: RhythmEventInput[]
  summary: string
}

const PPQ = 960
const DEFAULT_PIXELS_PER_PULSE = 220
const DEFAULT_TEMPO_BPM = 96

export const RHYTHM_DURATIONS: Record<string, RhythmDuration> = {
  whole: { label: 'whole', ticks: PPQ * 4, family: 'whole-pulse', notationValue: 'Whole' },
  dottedHalf: { label: 'dotted half', ticks: PPQ * 3, family: 'duple', notationValue: 'DottedHalf' },
  half: { label: 'half', ticks: PPQ * 2, family: 'duple', notationValue: 'Half' },
  dottedQuarter: { label: 'dotted quarter', ticks: PPQ * 1.5, family: 'duple', notationValue: 'DottedQuarter' },
  quarter: { label: 'quarter', ticks: PPQ, family: 'whole-pulse', notationValue: 'Quarter' },
  dottedEighth: { label: 'dotted eighth', ticks: PPQ * 0.75, family: 'quad', notationValue: 'DottedEighth' },
  eighth: { label: 'eighth', ticks: PPQ / 2, family: 'duple', notationValue: 'Eighth' },
  tripletEighth: {
    label: 'triplet eighth',
    ticks: PPQ / 3,
    family: 'triplet',
    notationValue: 'TripletEighth',
    tupletRatio: { actual: 3, normal: 2 },
  },
  sixteenth: { label: 'sixteenth', ticks: PPQ / 4, family: 'quad', notationValue: '16th' },
  quintupletSixteenth: {
    label: 'quintuplet sixteenth',
    ticks: PPQ / 5,
    family: 'quintuplet',
    notationValue: '16th',
    tupletRatio: { actual: 5, normal: 4 },
  },
  septupletSixteenth: {
    label: 'septuplet sixteenth',
    ticks: PPQ / 7,
    family: 'septuplet',
    notationValue: '16th',
    tupletRatio: { actual: 7, normal: 4 },
  },
}

export function getTimeSignatureParts(timeSignature: TimeSignatureValue): TimeSignatureParts {
  const [top, bottom] = timeSignature.split('/').map(Number)
  return { top, bottom }
}

export function getPulseCount(timeSignature: TimeSignatureValue): number {
  const { top } = getTimeSignatureParts(timeSignature)

  if (timeSignature === '6/8') return 2
  return top
}

export function getBeatUnit(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return 8
  return getTimeSignatureParts(timeSignature).bottom
}

export function getTicksPerPulse(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return PPQ * 1.5

  const beatUnit = getBeatUnit(timeSignature)
  return PPQ * (4 / beatUnit)
}

export function getMsPerPulse(tempoBpm: number, timeSignature: TimeSignatureValue): number {
  const quarterMs = 60000 / tempoBpm

  if (timeSignature === '6/8') return quarterMs * 1.5

  const beatUnit = getBeatUnit(timeSignature)
  return quarterMs * (4 / beatUnit)
}

function getSubdivisionFamilies(config: PulseGridConfig): { family: SubdivisionFamily; denominator: number }[] {
  const custom = config.customSubdivisions ?? []

  return [
    { family: 'whole-pulse', denominator: 1 },
    { family: 'duple', denominator: 2 },
    { family: 'triplet', denominator: 3 },
    { family: 'quad', denominator: 4 },
    { family: 'quintuplet', denominator: 5 },
    { family: 'sextuplet', denominator: 6 },
    { family: 'septuplet', denominator: 7 },
    ...custom.map((denominator) => ({ family: 'custom' as const, denominator })),
  ]
}

function buildSubdivisionSlots(
  pulseStartTick: number,
  pulseStartMs: number,
  pulseXStart: number,
  ticksPerPulse: number,
  msPerPulse: number,
  pixelsPerPulse: number,
  config: PulseGridConfig,
): SubdivisionSlot[] {
  const slots: SubdivisionSlot[] = []

  getSubdivisionFamilies(config).forEach(({ family, denominator }) => {
    Array.from({ length: denominator }).forEach((_, index) => {
      const slotStartRatio = index / denominator
      const slotEndRatio = (index + 1) / denominator

      slots.push({
        index,
        family,
        denominator,
        startTick: pulseStartTick + ticksPerPulse * slotStartRatio,
        endTick: pulseStartTick + ticksPerPulse * slotEndRatio,
        startMs: pulseStartMs + msPerPulse * slotStartRatio,
        endMs: pulseStartMs + msPerPulse * slotEndRatio,
        x: pulseXStart + pixelsPerPulse * slotStartRatio,
      })
    })
  })

  return slots
}

export function createMeasureGrid(config: PulseGridConfig, measure = 1): MeasureGrid {
  const tempoBpm = config.tempoBpm || DEFAULT_TEMPO_BPM
  const pulseCount = getPulseCount(config.timeSignature)
  const beatUnit = getBeatUnit(config.timeSignature)
  const ticksPerPulse = getTicksPerPulse(config.timeSignature)
  const ticksPerMeasure = ticksPerPulse * pulseCount
  const msPerPulse = getMsPerPulse(tempoBpm, config.timeSignature)
  const msPerMeasure = msPerPulse * pulseCount
  const pixelsPerPulse = config.pixelsPerPulse ?? DEFAULT_PIXELS_PER_PULSE
  const staffLineCount = config.staffLineCount ?? 5

  const pulses: PulseBox[] = Array.from({ length: pulseCount }, (_, pulseIndex) => {
    const startTick = pulseIndex * ticksPerPulse
    const startMs = pulseIndex * msPerPulse
    const xStart = pulseIndex * pixelsPerPulse

    return {
      measure,
      pulse: pulseIndex + 1,
      startTick,
      endTick: startTick + ticksPerPulse,
      startMs,
      endMs: startMs + msPerPulse,
      xStart,
      xEnd: xStart + pixelsPerPulse,
      subdivisions: buildSubdivisionSlots(
        startTick,
        startMs,
        xStart,
        ticksPerPulse,
        msPerPulse,
        pixelsPerPulse,
        config,
      ),
    }
  })

  return {
    measure,
    timeSignature: config.timeSignature,
    tempoBpm,
    pulseCount,
    beatUnit,
    ticksPerPulse,
    ticksPerMeasure,
    msPerPulse,
    msPerMeasure,
    pixelsPerPulse,
    width: pulseCount * pixelsPerPulse,
    staffLineCount,
    pulses,
  }
}

function getPulseFromTick(grid: MeasureGrid, tick: number): PulseBox {
  const pulseIndex = Math.min(grid.pulseCount - 1, Math.max(0, Math.floor(tick / grid.ticksPerPulse)))
  return grid.pulses[pulseIndex]
}

function getSlotIndexFromTick(grid: MeasureGrid, tick: number, duration: RhythmDuration): number {
  const pulse = getPulseFromTick(grid, tick)
  const ticksIntoPulse = tick - pulse.startTick
  const denominator = duration.tupletRatio?.actual ?? (duration.family === 'quad' ? 4 : duration.family === 'triplet' ? 3 : duration.family === 'duple' ? 2 : 1)

  return Math.max(0, Math.floor((ticksIntoPulse / grid.ticksPerPulse) * denominator))
}

function tickToMs(grid: MeasureGrid, tick: number): number {
  return (tick / grid.ticksPerPulse) * grid.msPerPulse
}

function tickToX(grid: MeasureGrid, tick: number): number {
  return (tick / grid.ticksPerPulse) * grid.pixelsPerPulse
}

function getBeamGroupId(grid: MeasureGrid, measure: number, startTick: number): string {
  const pulse = getPulseFromTick(grid, startTick)
  return `m${measure}-p${pulse.pulse}`
}

function getTupletGroupId(measure: number, pulse: number, duration: RhythmDuration, eventIndex: number): string | undefined {
  if (!duration.tupletRatio) return undefined

  const groupIndex = Math.floor(eventIndex / duration.tupletRatio.actual)
  return `m${measure}-p${pulse}-tuplet-${duration.tupletRatio.actual}-${groupIndex}`
}

function shouldSplitAcrossPulse(grid: MeasureGrid, startTick: number, endTick: number): boolean {
  const startPulse = getPulseFromTick(grid, startTick)
  const endPulse = getPulseFromTick(grid, Math.max(startTick, endTick - 0.001))
  return startPulse.pulse !== endPulse.pulse
}

export function createRatioGridEvents(config: PulseGridConfig, ratio: RatioGrid): RatioGridResult {
  const measure = ratio.measure ?? 1
  const measureGrid = createMeasureGrid(config, measure)
  const startPulseIndex = Math.max(0, ratio.startPulse - 1)
  const spanPulses = Math.max(1, ratio.spanPulses)
  const startTick = startPulseIndex * measureGrid.ticksPerPulse
  const spanTicks = spanPulses * measureGrid.ticksPerPulse
  const durationTicks = spanTicks / ratio.actualNotes
  const ratioLabel = ratio.label ?? `${ratio.actualNotes}:${ratio.normalNotes}`
  const groupId = `m${measure}-p${ratio.startPulse}-ratio-${ratio.actualNotes}-${ratio.normalNotes}`
  const bracketGroupId = `${groupId}-bracket`

  const events: RatioRhythmEvent[] = Array.from({ length: ratio.actualNotes }, (_, index) => {
    const eventStartTick = startTick + durationTicks * index
    const eventEndTick = eventStartTick + durationTicks
    const pulse = getPulseFromTick(measureGrid, eventStartTick)

    return {
      id: `${groupId}-e${index}`,
      measure,
      pulse: pulse.pulse,
      indexInRatio: index,
      startTick: eventStartTick,
      durationTicks,
      endTick: eventEndTick,
      startMs: tickToMs(measureGrid, eventStartTick),
      durationMs: tickToMs(measureGrid, durationTicks),
      endMs: tickToMs(measureGrid, eventEndTick),
      startX: tickToX(measureGrid, eventStartTick),
      endX: tickToX(measureGrid, eventEndTick),
      y: 0,
      ratioLabel,
      groupId,
      beamGroupId: groupId,
      bracketGroupId,
      actualNotes: ratio.actualNotes,
      normalNotes: ratio.normalNotes,
      spanPulses,
    }
  })

  return {
    measureGrid,
    ratio,
    events,
    summary: `${ratioLabel} ratio grid: ${ratio.actualNotes} attack(s) across ${spanPulses} pulse(s), starting at pulse ${ratio.startPulse}.`,
  }
}

export function placeRhythmEvents(config: PulseGridConfig, inputs: RhythmEventInput[], measure = 1): RhythmGridResult {
  const measureGrid = createMeasureGrid(config, measure)
  const events: RhythmGridEvent[] = []
  const overflow: RhythmEventInput[] = []
  let cursorTick = 0

  inputs.forEach((input, index) => {
    const durationTicks = input.duration.ticks
    const endTick = cursorTick + durationTicks

    if (endTick > measureGrid.ticksPerMeasure + 0.001) {
      overflow.push(input)
      return
    }

    const pulse = getPulseFromTick(measureGrid, cursorTick)
    const slot = getSlotIndexFromTick(measureGrid, cursorTick, input.duration)
    const crossesPulse = shouldSplitAcrossPulse(measureGrid, cursorTick, endTick)
    const id = `m${measure}-e${events.length}`

    events.push({
      id,
      measure,
      pulse: pulse.pulse,
      slot,
      intent: input.intent ?? 'attack',
      startTick: cursorTick,
      durationTicks,
      endTick,
      startMs: tickToMs(measureGrid, cursorTick),
      durationMs: tickToMs(measureGrid, durationTicks),
      endMs: tickToMs(measureGrid, endTick),
      startX: tickToX(measureGrid, cursorTick),
      endX: tickToX(measureGrid, endTick),
      y: input.y ?? 0,
      voice: input.voice ?? 'default',
      notationValue: input.duration.notationValue,
      subdivisionFamily: input.duration.family,
      beamGroupId: getBeamGroupId(measureGrid, measure, cursorTick),
      tupletGroupId: getTupletGroupId(measure, pulse.pulse, input.duration, index),
      crossesPulse,
      requiresTie: crossesPulse && input.intent !== 'rest',
    })

    cursorTick = endTick
  })

  const dupleCount = events.filter((event) => event.subdivisionFamily === 'duple' || event.subdivisionFamily === 'quad').length
  const tripletCount = events.filter((event) => event.subdivisionFamily === 'triplet').length
  const oddCount = events.filter((event) => ['quintuplet', 'septuplet', 'custom'].includes(event.subdivisionFamily)).length

  return {
    measureGrid,
    events,
    overflow,
    summary: `PulseGrid ${config.timeSignature} at ${measureGrid.tempoBpm} BPM: ${events.length} event(s), ${dupleCount} duple/quad, ${tripletCount} triplet, ${oddCount} odd-group, ${overflow.length} overflow.`,
  }
}

export function describePulseGrid(config: PulseGridConfig): string {
  const grid = createMeasureGrid(config)
  return `${grid.timeSignature} @ ${grid.tempoBpm} BPM = ${grid.pulseCount} pulse box(es), ${grid.ticksPerPulse} ticks/pulse, ${grid.msPerPulse.toFixed(2)} ms/pulse, ${grid.ticksPerMeasure} ticks/measure.`
}

export function rhythmPatternToInputs(durationKeys: string[]): RhythmEventInput[] {
  return durationKeys
    .map((key) => RHYTHM_DURATIONS[key])
    .filter(Boolean)
    .map((duration) => ({ duration }))
}
