import type { Stave } from 'vexflow'

export type MeasureFrame = {
  measure: number
  leftX: number
  rightX: number
  width: number
  headerStartX: number
  headerEndX: number
  rhythmStartX: number
  rhythmEndX: number
  rhythmWidth: number
}

const MIN_RHYTHM_WIDTH = 48
const RIGHT_PADDING = 10
const FALLBACK_FIRST_MEASURE_HEADER = 150
const FALLBACK_SYSTEM_HEADER = 54
const FALLBACK_MEASURE_HEADER = 10

function getFallbackHeaderWidth(measureIndex: number, isFirstMeasureOfSystem: boolean): number {
  if (measureIndex === 0) return FALLBACK_FIRST_MEASURE_HEADER
  if (isFirstMeasureOfSystem) return FALLBACK_SYSTEM_HEADER
  return FALLBACK_MEASURE_HEADER
}

function getDynamicNoteStartX(stave: Stave): number | null {
  const candidate = typeof (stave as any).getNoteStartX === 'function'
    ? Number((stave as any).getNoteStartX())
    : NaN

  return Number.isFinite(candidate) ? candidate : null
}

export function createMeasureFrame({
  stave,
  measureIndex,
  isFirstMeasureOfSystem,
  x,
  staveWidth,
}: {
  stave: Stave
  measureIndex: number
  isFirstMeasureOfSystem: boolean
  x: number
  staveWidth: number
}): MeasureFrame {
  const leftX = x
  const rightX = x + staveWidth
  const dynamicNoteStartX = getDynamicNoteStartX(stave)
  const fallbackHeaderEndX = x + getFallbackHeaderWidth(measureIndex, isFirstMeasureOfSystem)
  const rhythmStartX = Math.max(x, dynamicNoteStartX ?? fallbackHeaderEndX)
  const rhythmEndX = Math.max(rhythmStartX + MIN_RHYTHM_WIDTH, rightX - RIGHT_PADDING)

  return {
    measure: measureIndex + 1,
    leftX,
    rightX,
    width: staveWidth,
    headerStartX: leftX,
    headerEndX: rhythmStartX,
    rhythmStartX,
    rhythmEndX,
    rhythmWidth: rhythmEndX - rhythmStartX,
  }
}

export function rhythmRatioToX(frame: MeasureFrame, ratio: number): number {
  const clampedRatio = Math.max(0, Math.min(1, ratio))
  return frame.rhythmStartX + clampedRatio * frame.rhythmWidth
}
