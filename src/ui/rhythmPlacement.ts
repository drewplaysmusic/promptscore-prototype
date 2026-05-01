import {
  createRhythmEvents,
  getPulseCount,
  type DurationValue as RhythmMathDurationValue,
  type TimeSignatureValue as RhythmMathTimeSignatureValue,
} from './rhythmMath'

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

export type TimeSignatureValue = RhythmMathTimeSignatureValue

export type RhythmPlacement = {
  duration: DurationValue
  measure: number
  beat: number
  pulse: number
  slot: number
  beamGroupId: string
  tupletGroupId?: string
  crossesPulseBoundary: boolean
}

export function buildRhythmPlacements(
  timeSignature: TimeSignatureValue,
  rhythmPattern: DurationValue[],
  measureCount: number,
): RhythmPlacement[] {
  const placements: RhythmPlacement[] = []
  const pulseCount = getPulseCount(timeSignature)

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    const shiftedPattern = rhythmPattern.map((_, patternIndex) => rhythmPattern[(patternIndex + measureIndex) % rhythmPattern.length])
    const rhythmEvents = createRhythmEvents(timeSignature, shiftedPattern as RhythmMathDurationValue[])

    rhythmEvents.forEach((event) => {
      placements.push({
        duration: event.duration as DurationValue,
        measure: measureIndex + 1,
        beat: event.startPulse,
        pulse: event.startPulse,
        slot: event.startSlot,
        beamGroupId: `m${measureIndex + 1}-${event.beamGroupId}`,
        tupletGroupId: event.tupletGroupId ? `m${measureIndex + 1}-${event.tupletGroupId}` : undefined,
        crossesPulseBoundary: event.crossesPulseBoundary,
      })
    })

    if (rhythmEvents.length === 0) {
      placements.push({
        duration: 'Quarter',
        measure: measureIndex + 1,
        beat: 1,
        pulse: 1,
        slot: 0,
        beamGroupId: `m${measureIndex + 1}-${timeSignature}-pulse-1`,
        crossesPulseBoundary: false,
      })
    }
  }

  return placements.filter((placement) => placement.pulse <= pulseCount)
}

export function describeRhythmPlacements(placements: RhythmPlacement[]): string {
  if (placements.length === 0) return 'No rhythm placements.'

  const measureCount = Math.max(...placements.map((placement) => placement.measure))
  const crossed = placements.filter((placement) => placement.crossesPulseBoundary).length
  const tuplets = placements.filter((placement) => placement.tupletGroupId).length

  return `${placements.length} rhythm placements across ${measureCount} measure(s). ${crossed} cross-pulse event(s), ${tuplets} tuplet event(s).`
}
