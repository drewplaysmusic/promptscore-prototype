import type { AttachedExpressionMarking } from './ExpressionAttachmentEngine'
import type { PhraseArc } from './PhraseArcEngine'
import type { TimelineNode } from './PlaybackTimelineGraph'
import type { OrchestrationInstrumentTrack } from './OrchestrationPlaybackEngine'

export type ExpressivePlaybackInstruction = {
  id: string
  measure: number
  beat: number
  velocityScale: number
  durationScale: number
  timingOffsetMs: number
  tempoMultiplier: number
  articulation: string
  phraseIntensity: number
  explanation: string[]
}

export type ExpressivePlaybackPlan = {
  id: string
  instructions: ExpressivePlaybackInstruction[]
  summary: string
}

function getPhraseIntensity(phrase: PhraseArc | undefined, beatIndex = 0): number {
  if (!phrase) return 0.5
  const curve = phrase.tensionCurve.length > 0 ? phrase.tensionCurve : [0.5]
  return curve[Math.min(beatIndex, curve.length - 1)] ?? curve[curve.length - 1] ?? 0.5
}

function getPhraseTimingOffset(phrase: PhraseArc | undefined, beat: number): number {
  if (!phrase) return 0

  if (phrase.punctuation === 'period' && beat >= 4) return 18
  if (phrase.punctuation === 'comma' && beat >= 4) return 8
  if (phrase.function === 'climax') return -6

  return 0
}

function getTrackPerformanceBias(track?: OrchestrationInstrumentTrack) {
  if (!track) {
    return {
      velocityBias: 1,
      durationBias: 1,
      timingBias: 0,
    }
  }

  if (track.family === 'percussion') {
    return {
      velocityBias: 1.06,
      durationBias: 0.92,
      timingBias: 0,
    }
  }

  if (track.family === 'strings') {
    return {
      velocityBias: 0.94,
      durationBias: 1.06,
      timingBias: 4,
    }
  }

  if (track.family === 'brass') {
    return {
      velocityBias: 1.03,
      durationBias: 0.98,
      timingBias: 2,
    }
  }

  if (track.family === 'woodwinds') {
    return {
      velocityBias: 0.96,
      durationBias: 1.02,
      timingBias: 3,
    }
  }

  return {
    velocityBias: 1,
    durationBias: 1,
    timingBias: 0,
  }
}

function getExpressionInfluence(expressions: AttachedExpressionMarking[]) {
  return expressions.reduce(
    (acc, expression) => {
      const influence = expression.playbackInfluence
      if (!influence) return acc

      return {
        velocityScale: acc.velocityScale * (influence.velocityScale ?? 1),
        durationScale: acc.durationScale * (influence.articulationLength ?? 1),
        tempoMultiplier: acc.tempoMultiplier * (influence.tempoMultiplier ?? 1),
        articulation: expression.marking.category === 'articulation'
          ? expression.marking.id
          : acc.articulation,
      }
    },
    {
      velocityScale: 1,
      durationScale: 1,
      tempoMultiplier: 1,
      articulation: 'normal',
    },
  )
}

function getExpressionsForNode({
  node,
  expressions,
}: {
  node: TimelineNode
  expressions: AttachedExpressionMarking[]
}) {
  return expressions.filter((expression) => {
    if (expression.anchor.measure !== node.measure) return false
    if (expression.anchor.beat === undefined) return true
    return expression.anchor.beat === node.beat
  })
}

export function createExpressivePlaybackPlan({
  timelineNodes,
  attachedExpressions = [],
  trackByNodeId = {},
}: {
  timelineNodes: TimelineNode[]
  attachedExpressions?: AttachedExpressionMarking[]
  trackByNodeId?: Record<string, OrchestrationInstrumentTrack | undefined>
}): ExpressivePlaybackPlan {
  const instructions = timelineNodes.map((node, index) => {
    const phraseIntensity = getPhraseIntensity(node.phrase, (node.beat ?? 1) - 1)
    const phraseVelocity = 0.82 + phraseIntensity * 0.34
    const phraseTimingOffset = getPhraseTimingOffset(node.phrase, node.beat)
    const nodeExpressions = getExpressionsForNode({
      node,
      expressions: attachedExpressions,
    })
    const expressionInfluence = getExpressionInfluence(nodeExpressions)
    const trackBias = getTrackPerformanceBias(trackByNodeId[node.id])

    const velocityScale = Number((phraseVelocity * expressionInfluence.velocityScale * trackBias.velocityBias).toFixed(3))
    const durationScale = Number((expressionInfluence.durationScale * trackBias.durationBias).toFixed(3))
    const timingOffsetMs = Math.round(phraseTimingOffset + trackBias.timingBias)
    const tempoMultiplier = Number(expressionInfluence.tempoMultiplier.toFixed(3))

    return {
      id: `expr-playback-${node.id}`,
      measure: node.measure,
      beat: node.beat,
      velocityScale,
      durationScale,
      timingOffsetMs,
      tempoMultiplier,
      articulation: expressionInfluence.articulation,
      phraseIntensity,
      explanation: [
        `Phrase intensity ${phraseIntensity.toFixed(2)} shaped velocity.`,
        node.phrase ? node.phrase.dynamicSuggestion : 'No phrase arc available.',
        nodeExpressions.length > 0 ? `${nodeExpressions.length} expression marking(s) applied.` : 'No expression markings applied.',
        trackByNodeId[node.id] ? `Instrument bias: ${trackByNodeId[node.id]?.instrumentName}.` : 'No instrument bias applied.',
      ],
    } satisfies ExpressivePlaybackInstruction
  })

  return {
    id: `expressive-playback-${Date.now()}`,
    instructions,
    summary: `${instructions.length} expressive playback instruction(s) generated from phrase, expression, and orchestration context.`,
  }
}

export function getInstructionForPosition({
  plan,
  measure,
  beat,
}: {
  plan: ExpressivePlaybackPlan
  measure: number
  beat: number
}): ExpressivePlaybackInstruction | undefined {
  return plan.instructions.find((instruction) => instruction.measure === measure && instruction.beat === beat)
}
