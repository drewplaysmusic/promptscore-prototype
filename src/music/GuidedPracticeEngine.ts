import type { AdaptiveRevealLevel } from './AdaptiveRevealEngine'
import type { MusicBrainId } from './MusicIntelligenceLayer'

export type PracticeLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Professional'

export type PracticeGoal =
  | 'Rhythm Accuracy'
  | 'Pitch Literacy'
  | 'Scale Fluency'
  | 'Technique Builder'
  | 'Harmony Understanding'
  | 'Sight Reading'
  | 'Percussion Timing'
  | 'Ear Training'

export type PracticeTaskType =
  | 'count-aloud'
  | 'play-along'
  | 'identify-note'
  | 'tap-rhythm'
  | 'identify-chord'
  | 'repeat-pattern'
  | 'slow-practice'
  | 'independent-run'

export type GuidedPracticeTask = {
  id: string
  title: string
  type: PracticeTaskType
  instructions: string
  activeBrains: MusicBrainId[]
  revealLevel: AdaptiveRevealLevel
  successCriteria: string[]
}

export type GuidedPracticeSession = {
  id: string
  title: string
  goal: PracticeGoal
  level: PracticeLevel
  activeBrains: MusicBrainId[]
  revealPath: AdaptiveRevealLevel[]
  tasks: GuidedPracticeTask[]
  summary: string
}

function getBrainsForGoal(goal: PracticeGoal): MusicBrainId[] {
  switch (goal) {
    case 'Rhythm Accuracy':
      return ['rhythm', 'game-practice']

    case 'Pitch Literacy':
      return ['pitch-literacy', 'theory', 'game-practice']

    case 'Scale Fluency':
      return ['technique', 'pitch-literacy', 'theory']

    case 'Technique Builder':
      return ['technique', 'expression']

    case 'Harmony Understanding':
      return ['harmony', 'theory']

    case 'Sight Reading':
      return ['rhythm', 'pitch-literacy', 'game-practice']

    case 'Percussion Timing':
      return ['rhythm', 'percussion', 'game-practice']

    case 'Ear Training':
      return ['ear-training', 'pitch-literacy', 'game-practice']

    default:
      return ['rhythm', 'pitch-literacy']
  }
}

function getRevealPathForLevel(level: PracticeLevel): AdaptiveRevealLevel[] {
  switch (level) {
    case 'Beginner':
      return ['guided', 'guided', 'assisted']

    case 'Intermediate':
      return ['guided', 'assisted', 'independent']

    case 'Advanced':
      return ['assisted', 'independent', 'mastery']

    case 'Professional':
      return ['independent', 'mastery', 'mastery']

    default:
      return ['guided', 'assisted', 'independent']
  }
}

function getTaskBlueprints(goal: PracticeGoal): Array<{
  type: PracticeTaskType
  title: string
  instructions: string
  successCriteria: string[]
}> {
  switch (goal) {
    case 'Rhythm Accuracy':
      return [
        {
          type: 'count-aloud',
          title: 'Count the Pulse',
          instructions: 'Count the exercise aloud while following the animated playback cursor.',
          successCriteria: ['Steady tempo', 'Accurate subdivision', 'Consistent counting syllables'],
        },
        {
          type: 'tap-rhythm',
          title: 'Tap the Rhythm',
          instructions: 'Tap or clap the rhythm while the count overlay is visible.',
          successCriteria: ['Correct note spacing', 'Stable pulse', 'Clean entrances'],
        },
        {
          type: 'independent-run',
          title: 'Independent Rhythm Run',
          instructions: 'Perform the rhythm with reduced overlays and no count assistance.',
          successCriteria: ['Independent accuracy', 'Consistent tempo', 'Confident performance'],
        },
      ]

    case 'Pitch Literacy':
      return [
        {
          type: 'identify-note',
          title: 'Name the Notes',
          instructions: 'Identify each visible note name using the current staff-line progression.',
          successCriteria: ['Correct note names', 'Fast recognition', 'No staff-line confusion'],
        },
        {
          type: 'repeat-pattern',
          title: 'Read the Pattern',
          instructions: 'Read the note pattern aloud, then perform it with playback.',
          successCriteria: ['Accurate note order', 'Steady rhythm', 'Contour awareness'],
        },
      ]

    case 'Harmony Understanding':
      return [
        {
          type: 'identify-chord',
          title: 'Identify the Chord Function',
          instructions: 'Use the harmonic mask to identify chord symbols, Roman numerals, and function.',
          successCriteria: ['Correct chord symbol', 'Correct Roman numeral', 'Function recognition'],
        },
        {
          type: 'independent-run',
          title: 'Analyze Without Hints',
          instructions: 'Hide the chord masks and identify the harmonic movement independently.',
          successCriteria: ['Recognizes tonic/dominant motion', 'Identifies cadence tendency'],
        },
      ]

    case 'Percussion Timing':
      return [
        {
          type: 'count-aloud',
          title: 'Count the Grid',
          instructions: 'Count the grid aloud before playing. Focus on subdivision clarity.',
          successCriteria: ['Subdivision clarity', 'Even timing', 'Accurate accents'],
        },
        {
          type: 'play-along',
          title: 'Play Along Slowly',
          instructions: 'Play along at a slow tempo, then increase speed only after consistency.',
          successCriteria: ['Consistent hands', 'Clean timing', 'Relaxed technique'],
        },
      ]

    default:
      return [
        {
          type: 'slow-practice',
          title: 'Slow Practice Pass',
          instructions: 'Practice slowly with full support visible.',
          successCriteria: ['Accuracy first', 'Steady tempo', 'Confident repetition'],
        },
        {
          type: 'independent-run',
          title: 'Independent Pass',
          instructions: 'Repeat the exercise with reduced support.',
          successCriteria: ['Independent execution', 'Stable pulse', 'Musical confidence'],
        },
      ]
  }
}

export function createGuidedPracticeSession({
  goal,
  level,
  title,
}: {
  goal: PracticeGoal
  level: PracticeLevel
  title?: string
}): GuidedPracticeSession {
  const activeBrains = getBrainsForGoal(goal)
  const revealPath = getRevealPathForLevel(level)
  const blueprints = getTaskBlueprints(goal)

  const tasks: GuidedPracticeTask[] = blueprints.map((blueprint, index) => ({
    id: `${goal.toLowerCase().replaceAll(' ', '-')}-task-${index + 1}`,
    title: blueprint.title,
    type: blueprint.type,
    instructions: blueprint.instructions,
    activeBrains,
    revealLevel: revealPath[Math.min(index, revealPath.length - 1)],
    successCriteria: blueprint.successCriteria,
  }))

  return {
    id: `${goal.toLowerCase().replaceAll(' ', '-')}-${level.toLowerCase()}-${Date.now()}`,
    title: title ?? `${level} ${goal} Practice`,
    goal,
    level,
    activeBrains,
    revealPath,
    tasks,
    summary: `${level} guided practice session for ${goal} using ${activeBrains.join(', ')} brain support.`,
  }
}

export function getNextPracticeTask(
  session: GuidedPracticeSession,
  completedTaskIds: string[],
): GuidedPracticeTask | undefined {
  return session.tasks.find((task) => !completedTaskIds.includes(task.id))
}

export function isPracticeSessionComplete(
  session: GuidedPracticeSession,
  completedTaskIds: string[],
): boolean {
  return session.tasks.every((task) => completedTaskIds.includes(task.id))
}
