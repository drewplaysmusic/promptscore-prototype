export type FormSectionType =
  | 'intro'
  | 'A'
  | 'B'
  | 'C'
  | 'transition'
  | 'development'
  | 'recapitulation'
  | 'verse'
  | 'chorus'
  | 'bridge'
  | 'solo'
  | 'coda'
  | 'outro'

export type MusicalFormType =
  | 'binary'
  | 'ternary'
  | 'rondo'
  | 'verse-chorus'
  | 'twelve-bar-blues'
  | 'through-composed'
  | 'theme-and-variations'
  | 'sonata-inspired'
  | 'loop-based'
  | 'custom'

export type NavigationSymbolType =
  | 'repeat-start'
  | 'repeat-end'
  | 'first-ending'
  | 'second-ending'
  | 'segno'
  | 'coda'
  | 'fine'
  | 'dc-al-fine'
  | 'ds-al-coda'
  | 'to-coda'

export type FormSection = {
  id: string
  label: string
  type: FormSectionType
  startMeasure: number
  endMeasure: number
  function: string
  teachingDescription: string
}

export type NavigationSymbol = {
  id: string
  type: NavigationSymbolType
  measure: number
  targetMeasure?: number
  endingNumber?: number
  repeatCount?: number
  teachingDescription: string
}

export type PlaybackNavigationStep = {
  order: number
  measure: number
  reason: string
}

export type FormAndNavigationPlan = {
  id: string
  formType: MusicalFormType
  title: string
  sections: FormSection[]
  navigationSymbols: NavigationSymbol[]
  playbackPath: PlaybackNavigationStep[]
  summary: string
}

function makeSection({
  label,
  type,
  startMeasure,
  endMeasure,
  musicalFunction,
}: {
  label: string
  type: FormSectionType
  startMeasure: number
  endMeasure: number
  musicalFunction: string
}): FormSection {
  return {
    id: `section-${label}-${startMeasure}-${endMeasure}`,
    label,
    type,
    startMeasure,
    endMeasure,
    function: musicalFunction,
    teachingDescription: `${label} section: measures ${startMeasure}-${endMeasure}. ${musicalFunction}`,
  }
}

function makeNavigationSymbol({
  type,
  measure,
  targetMeasure,
  endingNumber,
  repeatCount,
}: {
  type: NavigationSymbolType
  measure: number
  targetMeasure?: number
  endingNumber?: number
  repeatCount?: number
}): NavigationSymbol {
  const label = type.replaceAll('-', ' ')

  return {
    id: `${type}-${measure}-${targetMeasure ?? 'none'}-${endingNumber ?? 'none'}`,
    type,
    measure,
    targetMeasure,
    endingNumber,
    repeatCount,
    teachingDescription: `${label} at measure ${measure}${targetMeasure ? `, targeting measure ${targetMeasure}` : ''}.`,
  }
}

function linearPlaybackPath(measureCount: number): PlaybackNavigationStep[] {
  return Array.from({ length: measureCount }, (_, index) => ({
    order: index + 1,
    measure: index + 1,
    reason: 'linear playback',
  }))
}

export function createFormTemplate({
  formType,
  measureCount,
}: {
  formType: MusicalFormType
  measureCount: number
}): FormAndNavigationPlan {
  const safeMeasureCount = Math.max(1, measureCount)
  const half = Math.max(1, Math.floor(safeMeasureCount / 2))
  const third = Math.max(1, Math.floor(safeMeasureCount / 3))

  if (formType === 'binary') {
    const sections = [
      makeSection({ label: 'A', type: 'A', startMeasure: 1, endMeasure: half, musicalFunction: 'Opening musical idea.' }),
      makeSection({ label: 'B', type: 'B', startMeasure: half + 1, endMeasure: safeMeasureCount, musicalFunction: 'Contrasting or answering musical idea.' }),
    ]

    return {
      id: `form-binary-${safeMeasureCount}`,
      formType,
      title: 'Binary Form',
      sections,
      navigationSymbols: [],
      playbackPath: linearPlaybackPath(safeMeasureCount),
      summary: 'Binary form divides the music into two main sections: A and B.',
    }
  }

  if (formType === 'ternary') {
    const sections = [
      makeSection({ label: 'A', type: 'A', startMeasure: 1, endMeasure: third, musicalFunction: 'Opening idea.' }),
      makeSection({ label: 'B', type: 'B', startMeasure: third + 1, endMeasure: third * 2, musicalFunction: 'Contrasting middle section.' }),
      makeSection({ label: 'A', type: 'A', startMeasure: third * 2 + 1, endMeasure: safeMeasureCount, musicalFunction: 'Return of opening idea.' }),
    ]

    return {
      id: `form-ternary-${safeMeasureCount}`,
      formType,
      title: 'Ternary Form',
      sections,
      navigationSymbols: [],
      playbackPath: linearPlaybackPath(safeMeasureCount),
      summary: 'Ternary form presents A, contrast B, then returns to A.',
    }
  }

  if (formType === 'twelve-bar-blues') {
    const sections = [
      makeSection({ label: 'A1', type: 'A', startMeasure: 1, endMeasure: 4, musicalFunction: 'Opening tonic statement.' }),
      makeSection({ label: 'A2', type: 'A', startMeasure: 5, endMeasure: 8, musicalFunction: 'Subdominant response and return.' }),
      makeSection({ label: 'Turnaround', type: 'transition', startMeasure: 9, endMeasure: 12, musicalFunction: 'Dominant turnaround back to the top.' }),
    ]

    return {
      id: 'form-twelve-bar-blues',
      formType,
      title: '12-Bar Blues',
      sections,
      navigationSymbols: [
        makeNavigationSymbol({ type: 'repeat-start', measure: 1 }),
        makeNavigationSymbol({ type: 'repeat-end', measure: 12, targetMeasure: 1, repeatCount: 2 }),
      ],
      playbackPath: [...linearPlaybackPath(12), ...linearPlaybackPath(12).map((step, index) => ({ ...step, order: 13 + index, reason: 'repeat 12-bar blues form' }))],
      summary: '12-bar blues uses a repeating harmonic/form pattern over twelve measures.',
    }
  }

  if (formType === 'verse-chorus') {
    const sections = [
      makeSection({ label: 'Verse', type: 'verse', startMeasure: 1, endMeasure: half, musicalFunction: 'Narrative or setup material.' }),
      makeSection({ label: 'Chorus', type: 'chorus', startMeasure: half + 1, endMeasure: safeMeasureCount, musicalFunction: 'Main hook or repeated central idea.' }),
    ]

    return {
      id: `form-verse-chorus-${safeMeasureCount}`,
      formType,
      title: 'Verse / Chorus Form',
      sections,
      navigationSymbols: [],
      playbackPath: linearPlaybackPath(safeMeasureCount),
      summary: 'Verse/chorus form alternates narrative material with a recurring hook section.',
    }
  }

  return {
    id: `form-custom-${safeMeasureCount}`,
    formType,
    title: 'Custom Form',
    sections: [
      makeSection({ label: 'Section 1', type: 'A', startMeasure: 1, endMeasure: safeMeasureCount, musicalFunction: 'Custom musical section.' }),
    ],
    navigationSymbols: [],
    playbackPath: linearPlaybackPath(safeMeasureCount),
    summary: 'Custom form with linear playback until more sections are added.',
  }
}

export function getSectionForMeasure(
  plan: FormAndNavigationPlan,
  measure: number,
): FormSection | undefined {
  return plan.sections.find((section) => measure >= section.startMeasure && measure <= section.endMeasure)
}

export function getNavigationSymbolsForMeasure(
  plan: FormAndNavigationPlan,
  measure: number,
): NavigationSymbol[] {
  return plan.navigationSymbols.filter((symbol) => symbol.measure === measure)
}

export function describePlaybackPath(plan: FormAndNavigationPlan): string {
  return plan.playbackPath
    .map((step) => `M${step.measure}`)
    .join(' → ')
}
