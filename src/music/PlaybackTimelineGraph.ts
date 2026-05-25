import type {
  FormAndNavigationPlan,
  FormSection,
  NavigationSymbol,
  PlaybackNavigationStep,
} from './FormAndNavigationEngine'

import {
  getNavigationSymbolsForMeasure,
  getSectionForMeasure,
} from './FormAndNavigationEngine'

import type {
  PhraseArc,
  PhraseGrammarAnalysis,
} from './PhraseArcEngine'

import {
  getPhraseArcForMeasure,
} from './PhraseArcEngine'

export type TimelineLoopRegion = {
  id: string
  startMeasure: number
  endMeasure: number
  enabled: boolean
  repeatCount?: number
}

export type TimelinePlaybackMode =
  | 'linear'
  | 'form-aware'
  | 'loop-region'
  | 'practice-task'

export type TimelineNode = {
  id: string
  order: number
  measure: number
  beat: number
  section?: FormSection
  phrase?: PhraseArc
  navigationSymbols: NavigationSymbol[]
  reason: string
}

export type TimelineRuntimeState = {
  mode: TimelinePlaybackMode
  currentIndex: number
  currentNode?: TimelineNode
  activeMeasure: number
  activeBeat: number
  activeSection?: FormSection
  activePhrase?: PhraseArc
  activeNavigationSymbols: NavigationSymbol[]
  isComplete: boolean
}

export type PlaybackTimelineGraph = {
  id: string
  mode: TimelinePlaybackMode
  nodes: TimelineNode[]
  loopRegion?: TimelineLoopRegion
  summary: string
}

function createTimelineNode({
  step,
  beat,
  section,
  phrase,
  navigationSymbols,
}: {
  step: PlaybackNavigationStep
  beat: number
  section?: FormSection
  phrase?: PhraseArc
  navigationSymbols: NavigationSymbol[]
}): TimelineNode {
  return {
    id: `timeline-${step.order}-m${step.measure}-b${beat}`,
    order: step.order,
    measure: step.measure,
    beat,
    section,
    phrase,
    navigationSymbols,
    reason: step.reason,
  }
}

function getBeatCount(timeSignature: string): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 6
  return 4
}

function expandStepsToBeatNodes({
  steps,
  formPlan,
  phraseAnalysis,
  timeSignature,
}: {
  steps: PlaybackNavigationStep[]
  formPlan?: FormAndNavigationPlan
  phraseAnalysis?: PhraseGrammarAnalysis
  timeSignature: string
}): TimelineNode[] {
  const beatCount = getBeatCount(timeSignature)
  const nodes: TimelineNode[] = []

  steps.forEach((step) => {
    for (let beat = 1; beat <= beatCount; beat += 1) {
      nodes.push(createTimelineNode({
        step: {
          ...step,
          order: nodes.length + 1,
        },
        beat,
        section: formPlan ? getSectionForMeasure(formPlan, step.measure) : undefined,
        phrase: phraseAnalysis ? getPhraseArcForMeasure(phraseAnalysis, step.measure) : undefined,
        navigationSymbols: formPlan ? getNavigationSymbolsForMeasure(formPlan, step.measure) : [],
      }))
    }
  })

  return nodes
}

export function createPlaybackTimelineGraph({
  formPlan,
  phraseAnalysis,
  timeSignature = '4/4',
  mode = 'form-aware',
  loopRegion,
}: {
  formPlan: FormAndNavigationPlan
  phraseAnalysis?: PhraseGrammarAnalysis
  timeSignature?: string
  mode?: TimelinePlaybackMode
  loopRegion?: TimelineLoopRegion
}): PlaybackTimelineGraph {
  const steps = loopRegion?.enabled
    ? formPlan.playbackPath.filter((step) => step.measure >= loopRegion.startMeasure && step.measure <= loopRegion.endMeasure)
    : formPlan.playbackPath

  const repeatCount = loopRegion?.enabled ? Math.max(1, loopRegion.repeatCount ?? 1) : 1
  const expandedSteps = Array.from({ length: repeatCount }).flatMap((_, loopIndex) => steps.map((step, stepIndex) => ({
    ...step,
    order: loopIndex * steps.length + stepIndex + 1,
    reason: loopRegion?.enabled ? `loop ${loopIndex + 1}: ${step.reason}` : step.reason,
  })))

  const nodes = expandStepsToBeatNodes({
    steps: expandedSteps,
    formPlan,
    phraseAnalysis,
    timeSignature,
  })

  return {
    id: `timeline-${formPlan.id}-${mode}`,
    mode: loopRegion?.enabled ? 'loop-region' : mode,
    nodes,
    loopRegion,
    summary: `${nodes.length} timeline node(s) created from ${expandedSteps.length} measure step(s).`,
  }
}

export function getTimelineRuntimeState({
  graph,
  currentIndex,
}: {
  graph: PlaybackTimelineGraph
  currentIndex: number
}): TimelineRuntimeState {
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, graph.nodes.length - 1)))
  const currentNode = graph.nodes[safeIndex]

  return {
    mode: graph.mode,
    currentIndex: safeIndex,
    currentNode,
    activeMeasure: currentNode?.measure ?? 1,
    activeBeat: currentNode?.beat ?? 1,
    activeSection: currentNode?.section,
    activePhrase: currentNode?.phrase,
    activeNavigationSymbols: currentNode?.navigationSymbols ?? [],
    isComplete: graph.nodes.length > 0 && safeIndex >= graph.nodes.length - 1,
  }
}

export function advanceTimeline({
  graph,
  currentIndex,
}: {
  graph: PlaybackTimelineGraph
  currentIndex: number
}): TimelineRuntimeState {
  return getTimelineRuntimeState({
    graph,
    currentIndex: Math.min(currentIndex + 1, Math.max(0, graph.nodes.length - 1)),
  })
}

export function rewindTimeline(graph: PlaybackTimelineGraph): TimelineRuntimeState {
  return getTimelineRuntimeState({
    graph,
    currentIndex: 0,
  })
}

export function describeTimelineNode(node: TimelineNode): string {
  const section = node.section ? `Section ${node.section.label}` : 'No section'
  const phrase = node.phrase ? `Phrase ${node.phrase.id}` : 'No phrase'
  const nav = node.navigationSymbols.length > 0
    ? node.navigationSymbols.map((symbol) => symbol.type).join(', ')
    : 'No navigation symbols'

  return `M${node.measure} B${node.beat} · ${section} · ${phrase} · ${nav}`
}
