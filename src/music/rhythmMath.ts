export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
export type DurationValue =
  | 'Whole'
  | 'DottedHalf'
  | 'Half'
  | 'DottedQuarter'
  | 'Quarter'
  | 'DottedEighth'
  | 'Eighth'
  | 'TripletEighth'
  | '16th'

export type RhythmEvent = {
  duration: DurationValue
  startPulse: number
  startSlot: number
  endPulse: number
  endSlot: number
  startsAtPulseBoundary: boolean
  crossesPulseBoundary: boolean
  beamGroupId: string
  tupletGroupId?: string
}

export type PulseSlot = {
  index: number
  absoluteTick: number
  occupied: boolean
  eventIndex?: number
}

export type PulseBox = {
  index: number
  startTick: number
  endTick: number
  ticksPerPulse: number
  slots: PulseSlot[]
}

export type MeasureGrid = {
  timeSignature: TimeSignatureValue
  pulseCount: number
  beatUnit: number
  ticksPerPulse: number
  totalTicks: number
  pulses: PulseBox[]
}

const PPQ = 96

export function getTimeSignatureParts(timeSignature: TimeSignatureValue): { top: number; bottom: number } {
  const [top, bottom] = timeSignature.split('/').map(Number)
  return { top, bottom }
}

export function getPulseCount(timeSignature: TimeSignatureValue): number {
  const { top, bottom } = getTimeSignatureParts(timeSignature)

  if (timeSignature === '6/8') return 2
  return top
}

export function getBeatUnit(timeSignature: TimeSignatureValue): number {
  const { bottom } = getTimeSignatureParts(timeSignature)
  return bottom
}

export function getTicksPerPulse(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return PPQ * 3 / 2

  const beatUnit = getBeatUnit(timeSignature)
  return PPQ * (4 / beatUnit)
}

export function getDurationTicks(duration: DurationValue, timeSignature?: TimeSignatureValue): number {
  if (duration === 'Whole') return PPQ * 4
  if (duration === 'DottedHalf') return PPQ * 3
  if (duration === 'Half') return PPQ * 2
  if (duration === 'DottedQuarter') return PPQ * 1.5
  if (duration === 'Quarter') return PPQ
  if (duration === 'DottedEighth') return PPQ * 0.75
  if (duration === 'Eighth') return PPQ * 0.5
  if (duration === 'TripletEighth') return PPQ / 3
  return PPQ * 0.25
}

export function getSubdivisionSlotsForPulse(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return 6
  return 12
}

export function createMeasureGrid(timeSignature: TimeSignatureValue): MeasureGrid {
  const pulseCount = getPulseCount(timeSignature)
  const beatUnit = getBeatUnit(timeSignature)
  const ticksPerPulse = getTicksPerPulse(timeSignature)
  const totalTicks = pulseCount * ticksPerPulse
  const slotsPerPulse = getSubdivisionSlotsForPulse(timeSignature)
  const ticksPerSlot = ticksPerPulse / slotsPerPulse

  const pulses: PulseBox[] = Array.from({ length: pulseCount }, (_, pulseIndex) => {
    const startTick = pulseIndex * ticksPerPulse
    const endTick = startTick + ticksPerPulse

    return {
      index: pulseIndex + 1,
      startTick,
      endTick,
      ticksPerPulse,
      slots: Array.from({ length: slotsPerPulse }, (_, slotIndex) => ({
        index: slotIndex,
        absoluteTick: startTick + slotIndex * ticksPerSlot,
        occupied: false,
      })),
    }
  })

  return {
    timeSignature,
    pulseCount,
    beatUnit,
    ticksPerPulse,
    totalTicks,
    pulses,
  }
}

function getPulseAndSlot(grid: MeasureGrid, tick: number): { pulse: number; slot: number } {
  const clampedTick = Math.max(0, Math.min(tick, grid.totalTicks))
  const pulseIndex = Math.min(grid.pulseCount - 1, Math.floor(clampedTick / grid.ticksPerPulse))
  const pulse = grid.pulses[pulseIndex]
  const slotsPerPulse = pulse.slots.length
  const ticksIntoPulse = clampedTick - pulse.startTick
  const slot = Math.min(slotsPerPulse - 1, Math.floor((ticksIntoPulse / grid.ticksPerPulse) * slotsPerPulse))

  return { pulse: pulse.index, slot }
}

export function durationFitsInMeasure(grid: MeasureGrid, startTick: number, duration: DurationValue): boolean {
  return startTick + getDurationTicks(duration, grid.timeSignature) <= grid.totalTicks + 0.001
}

export function createRhythmEvents(timeSignature: TimeSignatureValue, durations: DurationValue[]): RhythmEvent[] {
  const grid = createMeasureGrid(timeSignature)
  const events: RhythmEvent[] = []
  let cursorTick = 0

  durations.forEach((duration, index) => {
    const durationTicks = getDurationTicks(duration, timeSignature)

    if (cursorTick + durationTicks > grid.totalTicks + 0.001) return

    const start = getPulseAndSlot(grid, cursorTick)
    const end = getPulseAndSlot(grid, Math.max(0, cursorTick + durationTicks - 0.001))
    const startsAtPulseBoundary = Math.abs(cursorTick % grid.ticksPerPulse) < 0.001
    const crossesPulseBoundary = start.pulse !== end.pulse
    const beamGroupId = `${timeSignature}-pulse-${start.pulse}`
    const tupletGroupId = duration === 'TripletEighth' ? `${timeSignature}-triplet-${Math.floor(index / 3)}` : undefined

    events.push({
      duration,
      startPulse: start.pulse,
      startSlot: start.slot,
      endPulse: end.pulse,
      endSlot: end.slot,
      startsAtPulseBoundary,
      crossesPulseBoundary,
      beamGroupId,
      tupletGroupId,
    })

    cursorTick += durationTicks
  })

  return events
}

export function getBeamGroupIdsForMeasure(timeSignature: TimeSignatureValue): string[] {
  const grid = createMeasureGrid(timeSignature)
  return grid.pulses.map((pulse) => `${timeSignature}-pulse-${pulse.index}`)
}

export function describeMeasureGrid(timeSignature: TimeSignatureValue): string {
  const grid = createMeasureGrid(timeSignature)
  const pulseLabel = timeSignature === '6/8' ? 'compound dotted-quarter pulses' : 'beat pulses'
  return `${timeSignature}: ${grid.pulseCount} ${pulseLabel}, ${grid.ticksPerPulse} ticks per pulse, ${grid.totalTicks} ticks per measure.`
}
