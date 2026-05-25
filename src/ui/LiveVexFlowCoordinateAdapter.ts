import {
  buildCoordinateMap,
  createNoteCoordinate,
  type CoordinateMap,
  type RenderCoordinate,
} from './VexFlowCoordinateBridge'

export type VexFlowRenderableNote = {
  id?: string
  measure: number
  beat: number
  pitch?: string
  staff?: number
  voice?: string
  vexflowNote?: {
    getAbsoluteX?: () => number
    getYs?: () => number[]
    getStemDirection?: () => number
    getBoundingBox?: () => {
      getW: () => number
      getH: () => number
    }
  }
}

export type LiveCoordinateExtractionResult = {
  coordinates: RenderCoordinate[]
  coordinateMap: CoordinateMap
  extractionWarnings: string[]
}

function safeGetX(note: VexFlowRenderableNote): number {
  return note.vexflowNote?.getAbsoluteX?.() ?? 0
}

function safeGetY(note: VexFlowRenderableNote): number {
  const ys = note.vexflowNote?.getYs?.()

  if (!ys?.length) {
    return 0
  }

  return ys.reduce((sum, value) => sum + value, 0) / ys.length
}

function safeGetWidth(note: VexFlowRenderableNote): number {
  return note.vexflowNote?.getBoundingBox?.()?.getW?.() ?? 18
}

function safeGetHeight(note: VexFlowRenderableNote): number {
  return note.vexflowNote?.getBoundingBox?.()?.getH?.() ?? 24
}

export function extractLiveVexFlowCoordinates(
  notes: VexFlowRenderableNote[],
): LiveCoordinateExtractionResult {
  const extractionWarnings: string[] = []

  const coordinates = notes.map((note, index) => {
    const x = safeGetX(note)
    const y = safeGetY(note)
    const width = safeGetWidth(note)
    const height = safeGetHeight(note)

    if (x === 0 || y === 0) {
      extractionWarnings.push(
        `Note ${note.id ?? index} returned fallback coordinates.`,
      )
    }

    return createNoteCoordinate({
      id: note.id ?? `vf-note-${index}`,
      measure: note.measure,
      beat: note.beat,
      staff: note.staff ?? 1,
      voice: note.voice ?? 'default',
      x,
      y,
      width,
      height,
    })
  })

  const coordinateMap = buildCoordinateMap(coordinates)

  return {
    coordinates,
    coordinateMap,
    extractionWarnings,
  }
}

export function createMockVexFlowNote({
  x,
  y,
  width = 18,
  height = 24,
}: {
  x: number
  y: number
  width?: number
  height?: number
}) {
  return {
    getAbsoluteX: () => x,
    getYs: () => [y],
    getBoundingBox: () => ({
      getW: () => width,
      getH: () => height,
    }),
  }
}
