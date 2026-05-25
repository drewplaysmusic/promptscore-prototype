export type MeasureLayoutDensity =
  | 'spacious'
  | 'balanced'
  | 'compact'
  | 'professional'

export type MeasureOperationType =
  | 'add-after'
  | 'insert-before'
  | 'insert-after'
  | 'duplicate-range'
  | 'extend-section'

export type MeasureTimelineUnit = {
  id: string
  measureNumber: number
  timeSignature: string
  phraseId?: string
  sectionId?: string
  repeatGroupId?: string
  layout: {
    systemIndex: number
    measureInSystem: number
    x: number
    y: number
    width: number
    density: MeasureLayoutDensity
  }
}

export type MeasureTimeline = {
  id: string
  measures: MeasureTimelineUnit[]
  measuresPerSystem: number
  systemHeight: number
  pageWidth: number
  summary: string
}

export type MeasureOperation = {
  type: MeasureOperationType
  count?: number
  targetMeasure?: number
  startMeasure?: number
  endMeasure?: number
  sectionId?: string
}

function createMeasureId(measureNumber: number) {
  return `measure-${measureNumber}-${Math.random().toString(36).slice(2, 8)}`
}

function getMeasureWidth(density: MeasureLayoutDensity): number {
  switch (density) {
    case 'spacious':
      return 440

    case 'balanced':
      return 372

    case 'compact':
      return 310

    case 'professional':
      return 280

    default:
      return 372
  }
}

function getMeasuresPerSystem(density: MeasureLayoutDensity): number {
  switch (density) {
    case 'spacious':
      return 2

    case 'balanced':
      return 3

    case 'compact':
      return 4

    case 'professional':
      return 4

    default:
      return 3
  }
}

export function createMeasureTimeline({
  measureCount,
  timeSignature = '4/4',
  density = 'balanced',
  pageWidth = 1180,
  startX = 36,
  startY = 64,
  systemHeight = 132,
}: {
  measureCount: number
  timeSignature?: string
  density?: MeasureLayoutDensity
  pageWidth?: number
  startX?: number
  startY?: number
  systemHeight?: number
}): MeasureTimeline {
  const safeCount = Math.max(1, measureCount)
  const measuresPerSystem = getMeasuresPerSystem(density)
  const measureWidth = getMeasureWidth(density)

  const measures: MeasureTimelineUnit[] = Array.from({ length: safeCount }, (_, index) => {
    const measureNumber = index + 1
    const systemIndex = Math.floor(index / measuresPerSystem)
    const measureInSystem = index % measuresPerSystem

    return {
      id: createMeasureId(measureNumber),
      measureNumber,
      timeSignature,
      layout: {
        systemIndex,
        measureInSystem,
        x: startX + measureInSystem * measureWidth,
        y: startY + systemIndex * systemHeight,
        width: measureWidth,
        density,
      },
    }
  })

  return {
    id: `timeline-${safeCount}-${density}`,
    measures,
    measuresPerSystem,
    systemHeight,
    pageWidth,
    summary: `${safeCount} measure(s) laid out with ${density} density across ${Math.ceil(safeCount / measuresPerSystem)} system(s).`,
  }
}

function relayoutMeasures(
  measures: MeasureTimelineUnit[],
  density: MeasureLayoutDensity,
  systemHeight: number,
  startX = 36,
  startY = 64,
): MeasureTimelineUnit[] {
  const measuresPerSystem = getMeasuresPerSystem(density)
  const measureWidth = getMeasureWidth(density)

  return measures.map((measure, index) => {
    const measureNumber = index + 1
    const systemIndex = Math.floor(index / measuresPerSystem)
    const measureInSystem = index % measuresPerSystem

    return {
      ...measure,
      measureNumber,
      layout: {
        ...measure.layout,
        systemIndex,
        measureInSystem,
        x: startX + measureInSystem * measureWidth,
        y: startY + systemIndex * systemHeight,
        width: measureWidth,
        density,
      },
    }
  })
}

function createBlankMeasures({
  count,
  timeSignature,
  density,
}: {
  count: number
  timeSignature: string
  density: MeasureLayoutDensity
}): MeasureTimelineUnit[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: createMeasureId(index + 1),
    measureNumber: index + 1,
    timeSignature,
    layout: {
      systemIndex: 0,
      measureInSystem: 0,
      x: 0,
      y: 0,
      width: getMeasureWidth(density),
      density,
    },
  }))
}

export function applyMeasureOperation({
  timeline,
  operation,
}: {
  timeline: MeasureTimeline
  operation: MeasureOperation
}): MeasureTimeline {
  const density = timeline.measures[0]?.layout.density ?? 'balanced'
  const timeSignature = timeline.measures[0]?.timeSignature ?? '4/4'
  const count = Math.max(1, operation.count ?? 1)
  let nextMeasures = timeline.measures.slice()

  if (operation.type === 'add-after') {
    nextMeasures = [
      ...nextMeasures,
      ...createBlankMeasures({ count, timeSignature, density }),
    ]
  }

  if (operation.type === 'insert-before' || operation.type === 'insert-after') {
    const target = Math.max(1, operation.targetMeasure ?? nextMeasures.length)
    const index = operation.type === 'insert-before' ? target - 1 : target
    nextMeasures = [
      ...nextMeasures.slice(0, index),
      ...createBlankMeasures({ count, timeSignature, density }),
      ...nextMeasures.slice(index),
    ]
  }

  if (operation.type === 'duplicate-range') {
    const start = Math.max(1, operation.startMeasure ?? 1)
    const end = Math.min(nextMeasures.length, operation.endMeasure ?? start)
    const duplicate = nextMeasures.slice(start - 1, end).map((measure) => ({
      ...measure,
      id: createMeasureId(measure.measureNumber),
    }))
    nextMeasures = [
      ...nextMeasures.slice(0, end),
      ...duplicate,
      ...nextMeasures.slice(end),
    ]
  }

  if (operation.type === 'extend-section') {
    const sectionMeasures = nextMeasures.filter((measure) => measure.sectionId === operation.sectionId)
    const insertIndex = sectionMeasures.length > 0
      ? Math.max(...sectionMeasures.map((measure) => measure.measureNumber))
      : nextMeasures.length

    nextMeasures = [
      ...nextMeasures.slice(0, insertIndex),
      ...createBlankMeasures({ count, timeSignature, density }).map((measure) => ({
        ...measure,
        sectionId: operation.sectionId,
      })),
      ...nextMeasures.slice(insertIndex),
    ]
  }

  const relaid = relayoutMeasures(nextMeasures, density, timeline.systemHeight)

  return {
    ...timeline,
    id: `${timeline.id}-updated-${Date.now()}`,
    measures: relaid,
    measuresPerSystem: getMeasuresPerSystem(density),
    summary: `${relaid.length} measure(s) after ${operation.type} operation.`,
  }
}

export function getQuickAddMeasureOperations(): MeasureOperation[] {
  return [1, 2, 4, 8, 16].map((count) => ({
    type: 'add-after',
    count,
  }))
}

export function getMeasureByNumber(
  timeline: MeasureTimeline,
  measureNumber: number,
): MeasureTimelineUnit | undefined {
  return timeline.measures.find((measure) => measure.measureNumber === measureNumber)
}
