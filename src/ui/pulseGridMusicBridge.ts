import {
  RHYTHM_DURATIONS,
  placeRhythmEvents,
  type RhythmEventInput,
  type TimeSignatureValue,
} from './pulseGridEngine'

export type MusicBrainDurationValue =
  | 'Whole'
  | 'DottedHalf'
  | 'Half'
  | 'DottedQuarter'
  | 'Quarter'
  | 'DottedEighth'
  | 'Eighth'
  | 'TripletEighth'
  | '16th'

export type PulseGridPlannedDuration = {
  duration: MusicBrainDurationValue
  startBeat: number
  measureIndex: number
  beatInMeasure: number
  startTick: number
  endTick: number
  startX: number
  endX: number
  beamGroupId: string
  tupletGroupId?: string
  crossesPulse: boolean
  requiresTie: boolean
}

const DURATION_KEY_BY_MUSIC_DURATION: Record<MusicBrainDurationValue, string> = {
  Whole: 'whole',
  DottedHalf: 'dottedHalf',
  Half: 'half',
  DottedQuarter: 'dottedQuarter',
  Quarter: 'quarter',
  DottedEighth: 'dottedEighth',
  Eighth: 'eighth',
  TripletEighth: 'tripletEighth',
  '16th': 'sixteenth',
}

export function buildPulseGridPlannedDurations(
  timeSignature: TimeSignatureValue,
  rhythmPattern: MusicBrainDurationValue[],
  measureCount: number,
  tempoBpm = 96,
): PulseGridPlannedDuration[] {
  const planned: PulseGridPlannedDuration[] = []

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    const inputs: RhythmEventInput[] = rhythmPattern
      .map((duration) => RHYTHM_DURATIONS[DURATION_KEY_BY_MUSIC_DURATION[duration]])
      .filter(Boolean)
      .map((duration) => ({ duration }))

    const result = placeRhythmEvents(
      {
        timeSignature,
        tempoBpm,
        staffLineCount: 5,
      },
      inputs,
      measureIndex + 1,
    )

    result.events.forEach((event) => {
      planned.push({
        duration: event.notationValue as MusicBrainDurationValue,
        startBeat: event.startTick / result.measureGrid.ticksPerPulse,
        measureIndex,
        beatInMeasure: event.pulse + event.slot / Math.max(1, event.subdivisionFamily === 'triplet' ? 3 : event.subdivisionFamily === 'quad' ? 4 : event.subdivisionFamily === 'duple' ? 2 : 1),
        startTick: event.startTick,
        endTick: event.endTick,
        startX: event.startX,
        endX: event.endX,
        beamGroupId: event.beamGroupId,
        tupletGroupId: event.tupletGroupId,
        crossesPulse: event.crossesPulse,
        requiresTie: event.requiresTie,
      })
    })
  }

  return planned
}
