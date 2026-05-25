import type { AdaptiveRevealLevel } from '../music/AdaptiveRevealEngine'
import type { MusicBrainId, MusicMaskOutput } from '../music/MusicIntelligenceLayer'

export type NotationInteractionMode =
  | 'inspect'
  | 'practice'
  | 'edit'
  | 'game'
  | 'playback'

export type NotationTarget = {
  coordinateId?: string
  noteId?: string
  measure: number
  beat?: number
  staff?: number
  voice?: string
}

export type PlaybackCursorState = {
  isPlaying: boolean
  measure: number
  beat: number
  bpm: number
}

export type NotationInteractionState = {
  mode: NotationInteractionMode
  hoveredTarget: NotationTarget | null
  selectedTarget: NotationTarget | null
  activeMeasure: number
  activeBeat: number
  playback: PlaybackCursorState
  adaptiveRevealLevel: AdaptiveRevealLevel
  focusedBrainIds: MusicBrainId[]
  revealedMaskIds: string[]
  pinnedMaskIds: string[]
}

export type NotationInteractionAction =
  | { type: 'set-mode'; mode: NotationInteractionMode }
  | { type: 'hover-target'; target: NotationTarget | null }
  | { type: 'select-target'; target: NotationTarget | null }
  | { type: 'set-active-position'; measure: number; beat: number }
  | { type: 'set-playback'; playback: Partial<PlaybackCursorState> }
  | { type: 'set-adaptive-reveal-level'; level: AdaptiveRevealLevel }
  | { type: 'focus-brain'; brainId: MusicBrainId }
  | { type: 'unfocus-brain'; brainId: MusicBrainId }
  | { type: 'toggle-brain-focus'; brainId: MusicBrainId }
  | { type: 'reveal-mask'; maskId: string }
  | { type: 'hide-mask'; maskId: string }
  | { type: 'pin-mask'; maskId: string }
  | { type: 'unpin-mask'; maskId: string }
  | { type: 'reset-interaction' }

export const DEFAULT_NOTATION_INTERACTION_STATE: NotationInteractionState = {
  mode: 'inspect',
  hoveredTarget: null,
  selectedTarget: null,
  activeMeasure: 1,
  activeBeat: 1,
  playback: {
    isPlaying: false,
    measure: 1,
    beat: 1,
    bpm: 90,
  },
  adaptiveRevealLevel: 'guided',
  focusedBrainIds: ['rhythm', 'pitch-literacy'],
  revealedMaskIds: [],
  pinnedMaskIds: [],
}

function uniquePush(list: string[], value: string): string[] {
  return list.includes(value) ? list : [...list, value]
}

function uniqueBrainPush(list: MusicBrainId[], value: MusicBrainId): MusicBrainId[] {
  return list.includes(value) ? list : [...list, value]
}

export function notationInteractionReducer(
  state: NotationInteractionState,
  action: NotationInteractionAction,
): NotationInteractionState {
  switch (action.type) {
    case 'set-mode':
      return {
        ...state,
        mode: action.mode,
      }

    case 'hover-target':
      return {
        ...state,
        hoveredTarget: action.target,
      }

    case 'select-target':
      return {
        ...state,
        selectedTarget: action.target,
        activeMeasure: action.target?.measure ?? state.activeMeasure,
        activeBeat: action.target?.beat ?? state.activeBeat,
      }

    case 'set-active-position':
      return {
        ...state,
        activeMeasure: action.measure,
        activeBeat: action.beat,
      }

    case 'set-playback':
      return {
        ...state,
        playback: {
          ...state.playback,
          ...action.playback,
        },
      }

    case 'set-adaptive-reveal-level':
      return {
        ...state,
        adaptiveRevealLevel: action.level,
      }

    case 'focus-brain':
      return {
        ...state,
        focusedBrainIds: uniqueBrainPush(state.focusedBrainIds, action.brainId),
      }

    case 'unfocus-brain':
      return {
        ...state,
        focusedBrainIds: state.focusedBrainIds.filter((brainId) => brainId !== action.brainId),
      }

    case 'toggle-brain-focus':
      return state.focusedBrainIds.includes(action.brainId)
        ? notationInteractionReducer(state, { type: 'unfocus-brain', brainId: action.brainId })
        : notationInteractionReducer(state, { type: 'focus-brain', brainId: action.brainId })

    case 'reveal-mask':
      return {
        ...state,
        revealedMaskIds: uniquePush(state.revealedMaskIds, action.maskId),
      }

    case 'hide-mask':
      return {
        ...state,
        revealedMaskIds: state.revealedMaskIds.filter((maskId) => maskId !== action.maskId),
      }

    case 'pin-mask':
      return {
        ...state,
        pinnedMaskIds: uniquePush(state.pinnedMaskIds, action.maskId),
        revealedMaskIds: uniquePush(state.revealedMaskIds, action.maskId),
      }

    case 'unpin-mask':
      return {
        ...state,
        pinnedMaskIds: state.pinnedMaskIds.filter((maskId) => maskId !== action.maskId),
      }

    case 'reset-interaction':
      return DEFAULT_NOTATION_INTERACTION_STATE

    default:
      return state
  }
}

export function getTargetLabel(target: NotationTarget | null): string {
  if (!target) return 'No target selected'

  return `Measure ${target.measure}${target.beat ? ` · Beat ${target.beat}` : ''}${target.staff ? ` · Staff ${target.staff}` : ''}`
}

export function isMaskVisibleForInteraction({
  output,
  state,
}: {
  output: MusicMaskOutput
  state: NotationInteractionState
}): boolean {
  if (state.pinnedMaskIds.includes(output.id)) return true
  if (state.revealedMaskIds.includes(output.id)) return true
  if (!state.focusedBrainIds.includes(output.brainId)) return false
  return output.visibleByDefault
}

export function getVisibleMasksForInteraction({
  outputs,
  state,
}: {
  outputs: MusicMaskOutput[]
  state: NotationInteractionState
}): MusicMaskOutput[] {
  return outputs.filter((output) => isMaskVisibleForInteraction({ output, state }))
}
