import type {
  ExpressionMarking,
  ExpressionPlacement,
} from './ExpressionPaletteEngine'

export type ExpressionAnchorTarget = {
  id: string
  measure: number
  beat?: number
  noteId?: string
  staff?: number
  voice?: string
}

export type AttachedExpressionMarking = {
  id: string
  marking: ExpressionMarking
  anchor: ExpressionAnchorTarget
  placement: ExpressionPlacement
  offsetX: number
  offsetY: number
  playbackInfluence?: {
    velocityScale?: number
    articulationLength?: number
    tempoMultiplier?: number
  }
}

export type ExpressionAttachmentResult = {
  attachedMarkings: AttachedExpressionMarking[]
  byMeasure: Record<number, AttachedExpressionMarking[]>
}

function createPlaybackInfluence(marking: ExpressionMarking) {
  switch (marking.category) {
    case 'dynamic':
      if (marking.id === 'pp') {
        return {
          velocityScale: 0.45,
        }
      }

      if (marking.id === 'mf') {
        return {
          velocityScale: 0.78,
        }
      }

      if (marking.id === 'ff') {
        return {
          velocityScale: 1.15,
        }
      }

      return {
        velocityScale: 0.8,
      }

    case 'articulation':
      if (marking.id === 'staccato') {
        return {
          articulationLength: 0.45,
        }
      }

      if (marking.id === 'accent') {
        return {
          velocityScale: 1.1,
          articulationLength: 0.92,
        }
      }

      return {
        articulationLength: 1,
      }

    case 'tempo':
      if (marking.id === 'allegro') {
        return {
          tempoMultiplier: 1.2,
        }
      }

      if (marking.id === 'andante') {
        return {
          tempoMultiplier: 0.82,
        }
      }

      return {
        tempoMultiplier: 1,
      }

    default:
      return undefined
  }
}

export function attachExpressionMarking({
  marking,
  anchor,
}: {
  marking: ExpressionMarking
  anchor: ExpressionAnchorTarget
}): AttachedExpressionMarking {
  return {
    id: `${marking.id}-${anchor.measure}-${anchor.beat ?? 1}-${anchor.noteId ?? 'measure'}`,
    marking,
    anchor,
    placement: marking.placement,
    offsetX: 0,
    offsetY: marking.placement === 'below-staff' ? 28 : -30,
    playbackInfluence: createPlaybackInfluence(marking),
  }
}

export function buildExpressionAttachmentResult(
  attachedMarkings: AttachedExpressionMarking[],
): ExpressionAttachmentResult {
  const byMeasure: Record<number, AttachedExpressionMarking[]> = {}

  attachedMarkings.forEach((marking) => {
    byMeasure[marking.anchor.measure] = byMeasure[marking.anchor.measure] ?? []
    byMeasure[marking.anchor.measure].push(marking)
  })

  return {
    attachedMarkings,
    byMeasure,
  }
}

export function createMockAttachedExpressions(): AttachedExpressionMarking[] {
  return []
}
