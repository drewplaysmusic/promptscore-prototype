export type CollisionLayerType =
  | 'notation'
  | 'dynamics'
  | 'articulations'
  | 'phrase-arcs'
  | 'harmony-mask'
  | 'educational-overlay'
  | 'time-signature'
  | 'key-signature'
  | 'tempo-marking'
  | 'tuplet-bracket'

export type CollisionPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'

export type CollisionAnchor = {
  measure: number
  beat?: number
  staff?: number
}

export type CollisionObject = {
  id: string
  type: CollisionLayerType
  anchor: CollisionAnchor
  x: number
  y: number
  width: number
  height: number
  priority: CollisionPriority
  lane?: number
  locked?: boolean
}

export type CollisionResolution = {
  objectId: string
  originalX: number
  originalY: number
  resolvedX: number
  resolvedY: number
  lane: number
  reason: string
}

export type MeasureCollisionResult = {
  resolutions: CollisionResolution[]
  adjustedObjects: CollisionObject[]
  summary: string
}

export type ScoreStructuralEvent = {
  id: string
  type: 'time-signature-change' | 'key-signature-change'
  measure: number
  value: string
  spacingImpact: number
}

function getPriorityWeight(priority: CollisionPriority): number {
  switch (priority) {
    case 'critical':
      return 100
    case 'high':
      return 75
    case 'medium':
      return 50
    case 'low':
      return 25
    default:
      return 50
  }
}

function getDefaultLane(type: CollisionLayerType): number {
  switch (type) {
    case 'tempo-marking':
      return 0
    case 'phrase-arcs':
      return 1
    case 'dynamics':
      return 2
    case 'articulations':
      return 3
    case 'harmony-mask':
      return 4
    case 'educational-overlay':
      return 5
    case 'time-signature':
      return 0
    case 'key-signature':
      return 0
    default:
      return 3
  }
}

function intersects(a: CollisionObject, b: CollisionObject): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function shiftObjectForLane(object: CollisionObject, lane: number): CollisionObject {
  const laneHeight = 28

  return {
    ...object,
    lane,
    y: object.y + lane * laneHeight,
  }
}

export function resolveMeasureCollisions({
  objects,
}: {
  objects: CollisionObject[]
}): MeasureCollisionResult {
  const sorted = [...objects].sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority))

  const adjustedObjects: CollisionObject[] = []
  const resolutions: CollisionResolution[] = []

  sorted.forEach((object) => {
    let candidate = {
      ...object,
      lane: object.lane ?? getDefaultLane(object.type),
    }

    candidate = shiftObjectForLane(candidate, candidate.lane ?? 0)

    let attempts = 0

    while (
      adjustedObjects.some((existing) => intersects(candidate, existing))
      && attempts < 12
    ) {
      const nextLane = (candidate.lane ?? 0) + 1
      candidate = shiftObjectForLane({
        ...candidate,
        y: object.y,
      }, nextLane)

      attempts += 1
    }

    adjustedObjects.push(candidate)

    resolutions.push({
      objectId: object.id,
      originalX: object.x,
      originalY: object.y,
      resolvedX: candidate.x,
      resolvedY: candidate.y,
      lane: candidate.lane ?? 0,
      reason: attempts > 0
        ? `Moved to lane ${candidate.lane} to avoid collision.`
        : 'No collision detected.',
    })
  })

  return {
    resolutions,
    adjustedObjects,
    summary: `${resolutions.length} notation object(s) processed for collision resolution.`,
  }
}

export function createTimeSignatureChange({
  measure,
  value,
}: {
  measure: number
  value: string
}): ScoreStructuralEvent {
  return {
    id: `time-signature-${measure}-${value}`,
    type: 'time-signature-change',
    measure,
    value,
    spacingImpact: 92,
  }
}

export function createKeySignatureChange({
  measure,
  value,
}: {
  measure: number
  value: string
}): ScoreStructuralEvent {
  return {
    id: `key-signature-${measure}-${value}`,
    type: 'key-signature-change',
    measure,
    value,
    spacingImpact: 76,
  }
}

export function applyStructuralEventSpacing({
  objects,
  events,
}: {
  objects: CollisionObject[]
  events: ScoreStructuralEvent[]
}): CollisionObject[] {
  return objects.map((object) => {
    const spacingShift = events
      .filter((event) => event.measure <= object.anchor.measure)
      .reduce((sum, event) => sum + event.spacingImpact, 0)

    return {
      ...object,
      x: object.x + spacingShift,
    }
  })
}
