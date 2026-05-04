export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null

export type RhythmAxisEvent = {
  id: string
  measure: number
  pulse: number
  startTick: number
  durationTicks: number
  endTick: number
  startMs: number
  durationMs: number
  endMs: number
  startX: number
  endX: number
  beamGroupId: string
  tupletGroupId?: string
  ratioLabel?: string
  bracketGroupId?: string
  crossesPulse: boolean
  requiresTie: boolean
}

export type PitchAxisEvent = {
  pitch: PitchValue
  accidental: AccidentalValue
  octave: number
  y: number
  staffLine?: number
  voice?: string
}

export type MusicGridEvent = RhythmAxisEvent & PitchAxisEvent

export type RhythmAxisPlan = {
  events: RhythmAxisEvent[]
  summary: string
}

export type PitchAxisPlan = {
  events: PitchAxisEvent[]
  tonalCenter?: PitchValue
  scaleName?: string
  summary: string
}

export function combineRhythmAndPitchAxes(
  rhythmEvents: RhythmAxisEvent[],
  pitchEvents: PitchAxisEvent[],
): MusicGridEvent[] {
  if (rhythmEvents.length === 0) return []

  return rhythmEvents.map((rhythmEvent, index) => {
    const pitchEvent = pitchEvents[index % Math.max(1, pitchEvents.length)] ?? {
      pitch: 'C' as PitchValue,
      accidental: null,
      octave: 4,
      y: 0,
      voice: 'default',
    }

    return {
      ...rhythmEvent,
      ...pitchEvent,
    }
  })
}
