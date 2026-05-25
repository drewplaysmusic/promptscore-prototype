export type CoordinateAnchorType =
  | 'note'
  | 'measure'
  | 'beat'
  | 'staff'
  | 'system'

export type RenderCoordinate = {
  id: string
  type: CoordinateAnchorType
  measure: number
  beat?: number
  staff?: number
  voice?: string
  x: number
  y: number
  width: number
  height: number
}

export type CoordinateMap = {
  coordinates: RenderCoordinate[]
  byMeasure: Record<number, RenderCoordinate[]>
  byId: Record<string, RenderCoordinate>
}

export type NoteCoordinateInput = {
  id?: string
  measure: number
  beat: number
  staff?: number
  voice?: string
  x: number
  y: number
  width?: number
  height?: number
}

export function createNoteCoordinate(input: NoteCoordinateInput): RenderCoordinate {
  return {
    id: input.id ?? `note-${input.measure}-${input.beat}-${input.staff ?? 1}-${input.voice ?? 'default'}`,
    type: 'note',
    measure: input.measure,
    beat: input.beat,
    staff: input.staff ?? 1,
    voice: input.voice ?? 'default',
    x: input.x,
    y: input.y,
    width: input.width ?? 18,
    height: input.height ?? 24,
  }
}

export function createMeasureCoordinate({
  measure,
  staff = 1,
  x,
  y,
  width,
  height,
}: {
  measure: number
  staff?: number
  x: number
  y: number
  width: number
  height: number
}): RenderCoordinate {
  return {
    id: `measure-${measure}-staff-${staff}`,
    type: 'measure',
    measure,
    staff,
    x,
    y,
    width,
    height,
  }
}

export function buildCoordinateMap(coordinates: RenderCoordinate[]): CoordinateMap {
  const byMeasure: Record<number, RenderCoordinate[]> = {}
  const byId: Record<string, RenderCoordinate> = {}

  coordinates.forEach((coordinate) => {
    byMeasure[coordinate.measure] = byMeasure[coordinate.measure] ?? []
    byMeasure[coordinate.measure].push(coordinate)
    byId[coordinate.id] = coordinate
  })

  return {
    coordinates,
    byMeasure,
    byId,
  }
}

export function findClosestCoordinate({
  coordinates,
  measure,
  beat,
  type,
}: {
  coordinates: RenderCoordinate[]
  measure: number
  beat?: number
  type?: CoordinateAnchorType
}): RenderCoordinate | undefined {
  const candidates = coordinates.filter((coordinate) => {
    if (coordinate.measure !== measure) return false
    if (type && coordinate.type !== type) return false
    return true
  })

  if (!candidates.length) return undefined
  if (beat === undefined) return candidates[0]

  return candidates
    .slice()
    .sort((a, b) => Math.abs((a.beat ?? 1) - beat) - Math.abs((b.beat ?? 1) - beat))[0]
}

export function getMaskOverlayPosition({
  coordinate,
  verticalOffset = -28,
}: {
  coordinate: RenderCoordinate
  verticalOffset?: number
}) {
  return {
    left: coordinate.x + coordinate.width / 2,
    top: coordinate.y + verticalOffset,
  }
}

export function createFallbackMeasureCoordinates({
  measureCount,
  measuresPerSystem = 3,
  startX = 36,
  startY = 64,
  measureWidth = 372,
  systemHeight = 132,
}: {
  measureCount: number
  measuresPerSystem?: number
  startX?: number
  startY?: number
  measureWidth?: number
  systemHeight?: number
}): RenderCoordinate[] {
  return Array.from({ length: measureCount }, (_, index) => {
    const measure = index + 1
    const systemIndex = Math.floor(index / measuresPerSystem)
    const measureInSystem = index % measuresPerSystem

    return createMeasureCoordinate({
      measure,
      staff: 1,
      x: startX + measureInSystem * measureWidth,
      y: startY + systemIndex * systemHeight,
      width: measureWidth,
      height: 92,
    })
  })
}

export function createFallbackBeatCoordinates({
  measureCount,
  beatsPerMeasure = 4,
  measuresPerSystem = 3,
  startX = 36,
  startY = 64,
  measureWidth = 372,
  systemHeight = 132,
}: {
  measureCount: number
  beatsPerMeasure?: number
  measuresPerSystem?: number
  startX?: number
  startY?: number
  measureWidth?: number
  systemHeight?: number
}): RenderCoordinate[] {
  const coordinates: RenderCoordinate[] = []

  for (let measure = 1; measure <= measureCount; measure += 1) {
    const systemIndex = Math.floor((measure - 1) / measuresPerSystem)
    const measureInSystem = (measure - 1) % measuresPerSystem
    const baseX = startX + measureInSystem * measureWidth
    const baseY = startY + systemIndex * systemHeight

    for (let beat = 1; beat <= beatsPerMeasure; beat += 1) {
      coordinates.push({
        id: `beat-${measure}-${beat}`,
        type: 'beat',
        measure,
        beat,
        staff: 1,
        x: baseX + 36 + ((beat - 1) / beatsPerMeasure) * (measureWidth - 72),
        y: baseY + 44,
        width: 12,
        height: 24,
      })
    }
  }

  return coordinates
}
