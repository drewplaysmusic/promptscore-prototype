export type PhraseArcShape =
  | 'rise'
  | 'fall'
  | 'arch'
  | 'valley'
  | 'static'
  | 'question-answer'

export type PhraseFunction =
  | 'opening'
  | 'continuation'
  | 'cadence'
  | 'answer'
  | 'transition'
  | 'climax'

export type PhrasePunctuation =
  | 'comma'
  | 'semicolon'
  | 'period'
  | 'question-mark'
  | 'exclamation'
  | 'none'

export type PhraseArc = {
  id: string
  startMeasure: number
  endMeasure: number
  shape: PhraseArcShape
  function: PhraseFunction
  punctuation: PhrasePunctuation
  tensionCurve: number[]
  dynamicSuggestion: string
  timingSuggestion: string
  teachingDescription: string
}

export type PhraseGrammarAnalysis = {
  phrases: PhraseArc[]
  summary: string
  suggestedBreathingPoints: Array<{
    measure: number
    reason: string
  }>
}

function inferPhraseShape(index: number, total: number): PhraseArcShape {
  if (total === 1) return 'arch'
  if (index === 0) return 'question-answer'
  if (index === total - 1) return 'fall'
  return index % 2 === 0 ? 'rise' : 'arch'
}

function inferPhraseFunction(index: number, total: number): PhraseFunction {
  if (index === 0) return 'opening'
  if (index === total - 1) return 'cadence'
  if (index === Math.floor(total / 2)) return 'climax'
  return 'continuation'
}

function inferPunctuation(phraseFunction: PhraseFunction): PhrasePunctuation {
  switch (phraseFunction) {
    case 'opening':
      return 'comma'

    case 'continuation':
      return 'semicolon'

    case 'answer':
      return 'period'

    case 'cadence':
      return 'period'

    case 'climax':
      return 'exclamation'

    default:
      return 'none'
  }
}

function buildTensionCurve(shape: PhraseArcShape): number[] {
  switch (shape) {
    case 'rise':
      return [0.2, 0.4, 0.65, 0.85]

    case 'fall':
      return [0.8, 0.65, 0.35, 0.15]

    case 'arch':
      return [0.25, 0.65, 0.85, 0.35]

    case 'valley':
      return [0.75, 0.35, 0.28, 0.7]

    case 'question-answer':
      return [0.3, 0.65, 0.45, 0.2]

    case 'static':
      return [0.45, 0.45, 0.45, 0.45]

    default:
      return [0.3, 0.5, 0.5, 0.3]
  }
}

function getDynamicSuggestion(shape: PhraseArcShape): string {
  switch (shape) {
    case 'rise':
      return 'crescendo through the phrase'

    case 'fall':
      return 'decrescendo into release'

    case 'arch':
      return 'grow to the middle, relax at the end'

    case 'valley':
      return 'begin strong, soften, then return with energy'

    case 'question-answer':
      return 'shape the first half as a question and the second as an answer'

    default:
      return 'maintain an even dynamic shape'
  }
}

function getTimingSuggestion(punctuation: PhrasePunctuation): string {
  switch (punctuation) {
    case 'comma':
      return 'slight lift without stopping'

    case 'semicolon':
      return 'small breath with forward motion'

    case 'period':
      return 'release and settle the phrase ending'

    case 'question-mark':
      return 'leave the phrase slightly open'

    case 'exclamation':
      return 'energize the arrival point'

    default:
      return 'keep timing steady'
  }
}

function getTeachingDescription({
  shape,
  punctuation,
  phraseFunction,
}: {
  shape: PhraseArcShape
  punctuation: PhrasePunctuation
  phraseFunction: PhraseFunction
}): string {
  return `This phrase functions as ${phraseFunction}. Shape: ${shape}. Musical punctuation: ${punctuation}.`
}

export function analyzePhraseGrammar({
  measureCount,
  phraseLength = 4,
}: {
  measureCount: number
  phraseLength?: number
}): PhraseGrammarAnalysis {
  const phraseTotal = Math.max(1, Math.ceil(measureCount / phraseLength))
  const phrases: PhraseArc[] = []
  const suggestedBreathingPoints: PhraseGrammarAnalysis['suggestedBreathingPoints'] = []

  for (let index = 0; index < phraseTotal; index += 1) {
    const startMeasure = index * phraseLength + 1
    const endMeasure = Math.min(measureCount, startMeasure + phraseLength - 1)
    const shape = inferPhraseShape(index, phraseTotal)
    const phraseFunction = inferPhraseFunction(index, phraseTotal)
    const punctuation = inferPunctuation(phraseFunction)

    phrases.push({
      id: `phrase-${index + 1}`,
      startMeasure,
      endMeasure,
      shape,
      function: phraseFunction,
      punctuation,
      tensionCurve: buildTensionCurve(shape),
      dynamicSuggestion: getDynamicSuggestion(shape),
      timingSuggestion: getTimingSuggestion(punctuation),
      teachingDescription: getTeachingDescription({
        shape,
        punctuation,
        phraseFunction,
      }),
    })

    if (endMeasure < measureCount) {
      suggestedBreathingPoints.push({
        measure: endMeasure,
        reason: getTimingSuggestion(punctuation),
      })
    }
  }

  return {
    phrases,
    suggestedBreathingPoints,
    summary: `${phrases.length} phrase(s) analyzed as musical grammar across ${measureCount} measure(s).`,
  }
}

export function getPhraseArcForMeasure(
  analysis: PhraseGrammarAnalysis,
  measure: number,
): PhraseArc | undefined {
  return analysis.phrases.find((phrase) => measure >= phrase.startMeasure && measure <= phrase.endMeasure)
}
