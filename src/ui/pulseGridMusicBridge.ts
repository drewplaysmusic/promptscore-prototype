import {
  RHYTHM_DURATIONS,
  createRatioGridEvents,
  placeRhythmEvents,
  type RatioGrid,
  type RhythmEventInput,
  type TimeSignatureValue,
} from './pulseGridEngine'
import type { RhythmAxisEvent, RhythmAxisPlan } from './musicEventAxes'

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

export type RatioPromptPlan = {
  ratio: RatioGrid
  duration: MusicBrainDurationValue
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

function getRatioNotationDuration(actualNotes: number): MusicBrainDurationValue {
  if (actualNotes === 3) return 'TripletEighth'
  return '16th'
}

export function parseRatioPrompt(prompt: string): RatioPromptPlan | null {
  const normalized = prompt.toLowerCase().replace(/[,.;:]/g, ' ')

  const explicitOverMatch = normalized.match(/\b(\d+)\s*(?:over|:)\s*(\d+)(?:\s*(?:beats?|pulses?))?\b/)
  if (explicitOverMatch) {
    const actualNotes = Number(explicitOverMatch[1])
    const normalNotes = Number(explicitOverMatch[2])

    if (Number.isFinite(actualNotes) && Number.isFinite(normalNotes) && actualNotes > 1 && normalNotes > 0) {
      const spanPulses = normalized.includes('measure') ? 4 : Math.max(1, Math.ceil(normalNotes / 4))
      return {
        ratio: {
          actualNotes,
          normalNotes,
          spanPulses,
          startPulse: 1,
          label: `${actualNotes}:${normalNotes}`,
        },
        duration: getRatioNotationDuration(actualNotes),
      }
    }
  }

  const nineletMatch = normalized.match(/\b(?:ninelet|9\s*over\s*8|9\s*over\s*2\s*beats?)\b/)
  if (nineletMatch) {
    return {
      ratio: {
        actualNotes: 9,
        normalNotes: 8,
        spanPulses: 2,
        startPulse: 1,
        label: '9:8',
      },
      duration: '16th',
    }
  }

  if (normalized.includes('quintuplet') || normalized.includes('fivelet')) {
    return {
      ratio: {
        actualNotes: 5,
        normalNotes: 4,
        spanPulses: 1,
        startPulse: 1,
        label: '5:4',
      },
      duration: '16th',
    }
  }

  if (normalized.includes('septuplet') || normalized.includes('sevenlet')) {
    return {
      ratio: {
        actualNotes: 7,
        normalNotes: 4,
        spanPulses: 1,
        startPulse: 1,
        label: '7:4',
      },
      duration: '16th',
    }
  }

  if (normalized.includes('triplet rhythm') || normalized.includes('eighth note triplets')) {
    return {
      ratio: {
        actualNotes: 3,
        normalNotes: 2,
        spanPulses: 1,
        startPulse: 1,
        label: '3:2',
      },
      duration: 'TripletEighth',
    }
  }

  return null
}

function plannedDurationToRhythmAxisEvent(planned: PulseGridPlannedDuration, index: number): RhythmAxisEvent {
  return {
    id: `rhythm-axis-${planned.measureIndex + 1}-${index}`,
    measure: planned.measureIndex + 1,
    pulse: Math.max(1, Math.floor(planned.beatInMeasure)),
    startTick: planned.startTick,
    durationTicks: planned.endTick - planned.startTick,
    endTick: planned.endTick,
    startMs: 0,
    durationMs: 0,
    endMs: 0,
    startX: planned.startX,
    endX: planned.endX,
    beamGroupId: planned.beamGroupId,
    tupletGroupId: planned.tupletGroupId,
    ratioLabel: planned.tupletGroupId?.includes('ratio') ? planned.tupletGroupId : undefined,
    bracketGroupId: planned.tupletGroupId,
    crossesPulse: planned.crossesPulse,
    requiresTie: planned.requiresTie,
  }
}

export function buildRhythmAxisPlan(
  timeSignature: TimeSignatureValue,
  rhythmPattern: MusicBrainDurationValue[],
  measureCount: number,
  tempoBpm = 96,
  prompt = '',
): RhythmAxisPlan {
  const plannedDurations = buildPulseGridPlannedDurations(
    timeSignature,
    rhythmPattern,
    measureCount,
    tempoBpm,
    prompt,
  )

  const events = plannedDurations.map(plannedDurationToRhythmAxisEvent)
  const ratioPlan = parseRatioPrompt(prompt)

  return {
    events,
    summary: ratioPlan
      ? `Rhythm Axis: ${ratioPlan.ratio.label ?? `${ratioPlan.ratio.actualNotes}:${ratioPlan.ratio.normalNotes}`} across ${ratioPlan.ratio.spanPulses} pulse(s).`
      : `Rhythm Axis: ${events.length} event(s) planned on ${timeSignature}.`,
  }
}

export function buildPulseGridPlannedDurations(
  timeSignature: TimeSignatureValue,
  rhythmPattern: MusicBrainDurationValue[],
  measureCount: number,
  tempoBpm = 96,
  prompt = '',
): PulseGridPlannedDuration[] {
  const planned: PulseGridPlannedDuration[] = []
  const ratioPlan = parseRatioPrompt(prompt)

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    if (ratioPlan) {
      const result = createRatioGridEvents(
        {
          timeSignature,
          tempoBpm,
          staffLineCount: 5,
        },
        {
          ...ratioPlan.ratio,
          measure: measureIndex + 1,
        },
      )

      result.events.forEach((event) => {
        planned.push({
          duration: ratioPlan.duration,
          startBeat: event.startTick / result.measureGrid.ticksPerPulse,
          measureIndex,
          beatInMeasure: event.pulse + event.indexInRatio / Math.max(1, event.actualNotes),
          startTick: event.startTick,
          endTick: event.endTick,
          startX: event.startX,
          endX: event.endX,
          beamGroupId: event.beamGroupId,
          tupletGroupId: event.bracketGroupId,
          crossesPulse: event.pulse !== result.measureGrid.pulses[Math.min(result.measureGrid.pulseCount - 1, Math.floor((event.endTick - 0.001) / result.measureGrid.ticksPerPulse))]?.pulse,
          requiresTie: false,
        })
      })

      continue
    }

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
