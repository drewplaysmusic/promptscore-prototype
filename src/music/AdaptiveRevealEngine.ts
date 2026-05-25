import type { MusicMaskOutput } from './MusicIntelligenceLayer'

export type AdaptiveRevealLevel =
  | 'guided'
  | 'assisted'
  | 'independent'
  | 'mastery'

export type AdaptiveRevealDecision = {
  outputId: string
  visible: boolean
  opacity: number
  reason: string
}

export type AdaptiveRevealResult = {
  level: AdaptiveRevealLevel
  visibleOutputs: MusicMaskOutput[]
  hiddenOutputs: MusicMaskOutput[]
  decisions: AdaptiveRevealDecision[]
}

function shouldShowOutput({
  output,
  level,
}: {
  output: MusicMaskOutput
  level: AdaptiveRevealLevel
}): AdaptiveRevealDecision {
  switch (level) {
    case 'guided':
      return {
        outputId: output.id,
        visible: true,
        opacity: 1,
        reason: 'Guided mode reveals all learning support layers.',
      }

    case 'assisted':
      if (output.brainId === 'rhythm' || output.brainId === 'pitch-literacy') {
        return {
          outputId: output.id,
          visible: true,
          opacity: 0.92,
          reason: 'Core literacy support remains visible.',
        }
      }

      return {
        outputId: output.id,
        visible: false,
        opacity: 0,
        reason: 'Secondary cognition masks hidden in assisted mode.',
      }

    case 'independent':
      if (output.type === 'analysis-label') {
        return {
          outputId: output.id,
          visible: true,
          opacity: 0.55,
          reason: 'Minimal conceptual support remains visible.',
        }
      }

      return {
        outputId: output.id,
        visible: false,
        opacity: 0,
        reason: 'Independent mode suppresses most overlays.',
      }

    case 'mastery':
      return {
        outputId: output.id,
        visible: false,
        opacity: 0,
        reason: 'Mastery mode removes educational support layers.',
      }

    default:
      return {
        outputId: output.id,
        visible: true,
        opacity: 1,
        reason: 'Fallback visibility applied.',
      }
  }
}

export function executeAdaptiveReveal({
  outputs,
  level,
}: {
  outputs: MusicMaskOutput[]
  level: AdaptiveRevealLevel
}): AdaptiveRevealResult {
  const decisions = outputs.map((output) => shouldShowOutput({
    output,
    level,
  }))

  const visibleOutputs = outputs.filter((output) => {
    return decisions.find((decision) => decision.outputId === output.id)?.visible
  })

  const hiddenOutputs = outputs.filter((output) => {
    return !decisions.find((decision) => decision.outputId === output.id)?.visible
  })

  return {
    level,
    visibleOutputs,
    hiddenOutputs,
    decisions,
  }
}

export function getAdaptiveRevealDescription(level: AdaptiveRevealLevel): string {
  switch (level) {
    case 'guided':
      return 'Full educational guidance and visible cognition masks.'

    case 'assisted':
      return 'Core literacy assistance with reduced support density.'

    case 'independent':
      return 'Minimal conceptual support for self-guided performance.'

    case 'mastery':
      return 'Performance-focused mode with hidden educational overlays.'

    default:
      return 'Adaptive reveal description unavailable.'
  }
}
