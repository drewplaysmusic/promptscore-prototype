export type CursorDurationValue =
  | 'Whole'
  | 'DottedHalf'
  | 'Half'
  | 'DottedQuarter'
  | 'Quarter'
  | 'DottedEighth'
  | 'Eighth'
  | 'TripletEighth'
  | '16th'

export type CursorTimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'

export type MusicCursor = {
  measure: number
  beat: number
  tick: number
  voice: number
  timeSignature: CursorTimeSignatureValue
  ticksPerQuarter: number
  ticksPerMeasure: number
}

export type CursorPlacedEvent = {
  measure: number
  beat: number
  startTick: number
  endTick: number
  durationTicks: number
  duration: CursorDurationValue
  voice: number
}

const DEFAULT_TICKS_PER_QUARTER = 480

export function getBeatsPerMeasure(timeSignature: CursorTimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

export function getTicksPerMeasure(
  timeSignature: CursorTimeSignatureValue,
  ticksPerQuarter = DEFAULT_TICKS_PER_QUARTER,
): number {
  return getBeatsPerMeasure(timeSignature) * ticksPerQuarter
}

export function getDurationTicks(
  duration: CursorDurationValue,
  ticksPerQuarter = DEFAULT_TICKS_PER_QUARTER,
): number {
  if (duration === 'Whole') return ticksPerQuarter * 4
  if (duration === 'DottedHalf') return ticksPerQuarter * 3
  if (duration === 'Half') return ticksPerQuarter * 2
  if (duration === 'DottedQuarter') return ticksPerQuarter * 1.5
  if (duration === 'Quarter') return ticksPerQuarter
  if (duration === 'DottedEighth') return ticksPerQuarter * 0.75
  if (duration === 'Eighth') return ticksPerQuarter * 0.5
  if (duration === 'TripletEighth') return ticksPerQuarter / 3
  return ticksPerQuarter * 0.25
}

export function createMusicCursor({
  timeSignature = '4/4',
  measure = 1,
  beat = 1,
  voice = 1,
  ticksPerQuarter = DEFAULT_TICKS_PER_QUARTER,
}: {
  timeSignature?: CursorTimeSignatureValue
  measure?: number
  beat?: number
  voice?: number
  ticksPerQuarter?: number
} = {}): MusicCursor {
  const ticksPerMeasure = getTicksPerMeasure(timeSignature, ticksPerQuarter)
  const tick = Math.round((Math.max(1, beat) - 1) * ticksPerQuarter)

  return {
    measure: Math.max(1, measure),
    beat: Math.max(1, beat),
    tick,
    voice: Math.max(1, voice),
    timeSignature,
    ticksPerQuarter,
    ticksPerMeasure,
  }
}

export function getCursorBeat(cursor: MusicCursor): number {
  return 1 + cursor.tick / cursor.ticksPerQuarter
}

export function cloneCursor(cursor: MusicCursor): MusicCursor {
  return { ...cursor }
}

export function placeDurationAtCursor(
  cursor: MusicCursor,
  duration: CursorDurationValue,
): { event: CursorPlacedEvent; nextCursor: MusicCursor } {
  const durationTicks = getDurationTicks(duration, cursor.ticksPerQuarter)
  let measure = cursor.measure
  let startTick = cursor.tick

  if (startTick + durationTicks > cursor.ticksPerMeasure + 0.001) {
    measure += 1
    startTick = 0
  }

  const endTick = startTick + durationTicks
  const event: CursorPlacedEvent = {
    measure,
    beat: 1 + startTick / cursor.ticksPerQuarter,
    startTick,
    endTick,
    durationTicks,
    duration,
    voice: cursor.voice,
  }

  let nextMeasure = measure
  let nextTick = endTick

  if (nextTick >= cursor.ticksPerMeasure - 0.001) {
    nextMeasure += 1
    nextTick = 0
  }

  const nextCursor: MusicCursor = {
    ...cursor,
    measure: nextMeasure,
    tick: nextTick,
    beat: 1 + nextTick / cursor.ticksPerQuarter,
  }

  return { event, nextCursor }
}

export function placeDurationsFromCursor(
  cursor: MusicCursor,
  durations: CursorDurationValue[],
): { events: CursorPlacedEvent[]; nextCursor: MusicCursor } {
  const events: CursorPlacedEvent[] = []
  let activeCursor = cloneCursor(cursor)

  durations.forEach((duration) => {
    const placed = placeDurationAtCursor(activeCursor, duration)
    events.push(placed.event)
    activeCursor = placed.nextCursor
  })

  return {
    events,
    nextCursor: activeCursor,
  }
}

export function moveCursorToMeasure(cursor: MusicCursor, measure: number): MusicCursor {
  return {
    ...cursor,
    measure: Math.max(1, measure),
    beat: 1,
    tick: 0,
  }
}

export function moveCursorByTicks(cursor: MusicCursor, tickDelta: number): MusicCursor {
  const absoluteTicks = (cursor.measure - 1) * cursor.ticksPerMeasure + cursor.tick + tickDelta
  const safeAbsoluteTicks = Math.max(0, absoluteTicks)
  const measure = Math.floor(safeAbsoluteTicks / cursor.ticksPerMeasure) + 1
  const tick = safeAbsoluteTicks % cursor.ticksPerMeasure

  return {
    ...cursor,
    measure,
    tick,
    beat: 1 + tick / cursor.ticksPerQuarter,
  }
}

export function describeCursor(cursor: MusicCursor): string {
  return `m${cursor.measure} beat ${getCursorBeat(cursor).toFixed(3)} tick ${cursor.tick}/${cursor.ticksPerMeasure} voice ${cursor.voice}`
}
