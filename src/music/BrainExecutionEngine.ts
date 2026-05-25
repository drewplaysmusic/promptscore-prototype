import {
  MUSIC_BRAINS,
  createMaskOutput,
  type MusicBrainDefinition,
  type MusicMaskOutput,
} from './MusicIntelligenceLayer'

import {
  analyzeMusic,
  type MusicAnalysisResult,
} from './MusicAnalysisEngine'

export type BrainExecutionRequest = {
  notes: any[]
  enabledBrainIds?: string[]
}

export type BrainExecutionResult = {
  analysis: MusicAnalysisResult
  activeBrains: MusicBrainDefinition[]
  outputs: MusicMaskOutput[]
}

function buildRhythmOutputs(notes: any[], analysis: MusicAnalysisResult): MusicMaskOutput[] {
  return notes.slice(0, 8).map((note, index) => createMaskOutput({
    brainId: 'rhythm',
    type: 'text-overlay',
    label: 'Count',
    value: `${(index % 4) + 1}`,
    anchor: {
      measure: note.measure ?? 1,
      beat: note.beat ?? index + 1,
    },
    priority: 1,
    visibleByDefault: true,
  }))
}

function buildPitchOutputs(notes: any[]): MusicMaskOutput[] {
  return notes.slice(0, 12).map((note) => createMaskOutput({
    brainId: 'pitch-literacy',
    type: 'text-overlay',
    label: 'Pitch',
    value: `${note.pitch ?? 'C'}${note.octave ?? ''}`,
    anchor: {
      measure: note.measure ?? 1,
      beat: note.beat ?? 1,
    },
    priority: 2,
    visibleByDefault: true,
  }))
}

function buildTheoryOutputs(notes: any[], analysis: MusicAnalysisResult): MusicMaskOutput[] {
  return [
    createMaskOutput({
      brainId: 'theory',
      type: 'analysis-label',
      label: 'Key Center',
      value: analysis.estimatedKeyCenter,
      anchor: {
        measure: 1,
      },
      priority: 1,
      visibleByDefault: true,
    }),
    createMaskOutput({
      brainId: 'theory',
      type: 'analysis-label',
      label: 'Contour',
      value: analysis.contour,
      anchor: {
        measure: 1,
      },
      priority: 1,
      visibleByDefault: true,
    }),
  ]
}

function buildTechniqueOutputs(analysis: MusicAnalysisResult): MusicMaskOutput[] {
  return [
    createMaskOutput({
      brainId: 'technique',
      type: 'practice-prompt',
      label: 'Difficulty',
      value: analysis.estimatedDifficulty,
      anchor: {
        measure: 1,
      },
      priority: 1,
      visibleByDefault: true,
    }),
  ]
}

export function executeBrains(request: BrainExecutionRequest): BrainExecutionResult {
  const analysis = analyzeMusic(request.notes)

  const activeBrains = MUSIC_BRAINS.filter((brain) => {
    if (!request.enabledBrainIds?.length) {
      return brain.defaultEnabled
    }

    return request.enabledBrainIds.includes(brain.id)
  })

  const outputs: MusicMaskOutput[] = []

  activeBrains.forEach((brain) => {
    switch (brain.id) {
      case 'rhythm':
        outputs.push(...buildRhythmOutputs(request.notes, analysis))
        break

      case 'pitch-literacy':
        outputs.push(...buildPitchOutputs(request.notes))
        break

      case 'theory':
        outputs.push(...buildTheoryOutputs(request.notes, analysis))
        break

      case 'technique':
        outputs.push(...buildTechniqueOutputs(analysis))
        break

      default:
        break
    }
  })

  return {
    analysis,
    activeBrains,
    outputs,
  }
}
