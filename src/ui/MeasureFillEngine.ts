import type { DurationValue, TimeSignatureValue } from './musicBrain'

export type MeasureFillEvent = {
  duration: DurationValue
  beat: number
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

export function getDurationBeats(duration: DurationValue): number {
  if (duration === 'Whole') return 4
  if (duration === 'DottedHalf') return 3
  if (duration === 'Half') return 2
  if (duration === 'DottedQuarter') return 1.5
  if (duration === 'Quarter') return 1
  if (duration === 'DottedEighth') return 0.75
  if (duration === 'Eighth') return 0.5
  if (duration === 'TripletEighth') return 1 / 3
  return 0.25
}

function getLargestDurationThatFits(remainingBeats: number): DurationValue {
  if (remainingBeats >= 4) return 'Whole'
  if (remainingBeats >= 3) return 'DottedHalf'
  if (remainingBeats >= 2) return 'Half'
  if (remainingBeats >= 1.5) return 'DottedQuarter'
  if (remainingBeats >= 1) return 'Quarter'
  if (remainingBeats >= 0.75) return 'DottedEighth'
  if (remainingBeats >= 0.5) return 'Eighth'
  return '16th'
}

function isCloseEnough(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.0001
}

export function fillMeasureWithPattern(
  rhythmPattern: DurationValue[],
  timeSignature: TimeSignatureValue,
  patternOffset = 0,
): { events: MeasureFillEvent[]; nextPatternOffset: number; totalBeats: number } {
  const measureBeats = getMeasureBeats(timeSignature)
  const safePattern = rhythmPattern.length > 0 ? rhythmPattern : ['Quarter']
  const events: MeasureFillEvent[] = []
  let beat = 1
  let usedBeats = 0
  let patternIndex = patternOffset

  while (usedBeats < measureBeats && !isCloseEnough(usedBeats, measureBeats)) {
    const remainingBeats = measureBeats - usedBeats
    const requestedDuration = safePattern[patternIndex % safePattern.length]
    const requestedBeats = getDurationBeats(requestedDuration)
    const duration = requestedBeats <= remainingBeats + 0.0001
      ? requestedDuration
      : getLargestDurationThatFits(remainingBeats)
    const durationBeats = getDurationBeats(duration)

    events.push({ duration, beat })

    beat += durationBeats
    usedBeats += durationBeats
    patternIndex += 1
  }

  return {
    events,
    nextPatternOffset: patternIndex,
    totalBeats: usedBeats,
  }
}

export function fillMeasuresWithPattern(
  measureCount: number,
  rhythmPattern: DurationValue[],
  timeSignature: TimeSignatureValue,
): MeasureFillEvent[][] {
  const measures: MeasureFillEvent[][] = []
  let patternOffset = 0

  for (let measure = 0; measure < measureCount; measure += 1) {
    const result = fillMeasureWithPattern(rhythmPattern, timeSignature, patternOffset)
    measures.push(result.events)
    patternOffset = result.nextPatternOffset
  }

  return measures
}
