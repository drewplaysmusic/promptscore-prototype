import { DEFAULT_PROMPT_INTENTS, STANDARDS_CONCEPT_GRAPH, type PromptIntent, type StandardsConcept } from './StandardsConceptGraph'

export type AnticipatedPrompt = {
  id: string
  conceptId: string
  concept: string
  topic: string
  intent: PromptIntent
  gradeMin: number
  gradeMax: number
  text: string
  source: 'standards-derived'
}

const TEMPLATES: Record<PromptIntent, Array<(c: StandardsConcept) => string>> = {
  define: [
    c => `What is ${c.label}?`,
    c => `What does ${c.label} mean in music?`,
    c => `Can you define ${c.label}?`,
    c => `Give me a simple definition of ${c.label}.`,
  ],
  explain: [
    c => `Explain ${c.label} to me.`,
    c => `Can you explain ${c.label} in simple words?`,
    c => `I don't understand ${c.label}. Can you help?`,
    c => `Explain ${c.label} like I'm a beginner.`,
  ],
  identify: [
    c => `How do I identify ${c.label} in music?`,
    c => `How can I recognize ${c.label}?`,
    c => `Can you show me where ${c.label} is in an example?`,
    c => `What should I look for to find ${c.label}?`,
  ],
  compare: [
    c => `What is ${c.label} different from?`,
    c => `Compare ${c.label} with a related music concept.`,
    c => `What do students usually confuse with ${c.label}?`,
    c => `How can I tell ${c.label} apart from something similar?`,
  ],
  why: [
    c => `Why do musicians use ${c.label}?`,
    c => `Why is ${c.label} important?`,
    c => `Why do I need to learn ${c.label}?`,
    c => `Why does ${c.label} work this way?`,
  ],
  how: [
    c => `How does ${c.label} work?`,
    c => `How do I use ${c.label}?`,
    c => `How should I practice ${c.label}?`,
    c => `How can I get better at ${c.label}?`,
  ],
  demonstrate: [
    c => `Show me an example of ${c.label}.`,
    c => `Can I hear an example of ${c.label}?`,
    c => `Show ${c.label} in music notation.`,
    c => `Give me a simple musical example of ${c.label}.`,
  ],
  practice: [
    c => `Give me a practice exercise for ${c.label}.`,
    c => `Make an easy exercise about ${c.label}.`,
    c => `Make a grade-level practice activity for ${c.label}.`,
    c => `Make a challenge exercise for ${c.label}.`,
  ],
  assess: [
    c => `Quiz me on ${c.label}.`,
    c => `Give me an exit ticket about ${c.label}.`,
    c => `Make five questions to check understanding of ${c.label}.`,
    c => `Create an assessment for ${c.label} with an answer key.`,
  ],
  create: [
    c => `Create a lesson about ${c.label}.`,
    c => `Make a worksheet for ${c.label}.`,
    c => `Create a classroom activity that teaches ${c.label}.`,
    c => `Build a warmup using ${c.label}.`,
  ],
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function misconceptionPrompts(c: StandardsConcept): string[] {
  return c.misconceptions.flatMap((m) => [
    `Is it true that ${m}?`,
    `Why might someone think that ${m}?`,
    `My teacher said “${m}” is a misconception. Can you explain?`,
  ])
}

function keywordPrompts(c: StandardsConcept): string[] {
  return c.keywords.slice(0, 5).flatMap((k) => [
    `What does ${k} mean?`,
    `Show me an example of ${k}.`,
  ])
}

export function expandConceptPrompts(concept: StandardsConcept): AnticipatedPrompt[] {
  const intents = concept.intents ?? DEFAULT_PROMPT_INTENTS
  const rows: AnticipatedPrompt[] = []
  intents.forEach((intent) => {
    TEMPLATES[intent].forEach((template, index) => {
      rows.push({
        id: `${concept.id}-${intent}-${index + 1}`,
        conceptId: concept.id,
        concept: concept.label,
        topic: concept.topic,
        intent,
        gradeMin: concept.gradeMin,
        gradeMax: concept.gradeMax,
        text: template(concept),
        source: 'standards-derived',
      })
    })
  })
  misconceptionPrompts(concept).forEach((text, index) => rows.push({
    id: `${concept.id}-misconception-${index + 1}`, conceptId:concept.id, concept:concept.label,
    topic:concept.topic, intent:'explain', gradeMin:concept.gradeMin, gradeMax:concept.gradeMax,
    text, source:'standards-derived',
  }))
  keywordPrompts(concept).forEach((text, index) => rows.push({
    id: `${concept.id}-keyword-${index + 1}-${slug(text).slice(0,24)}`, conceptId:concept.id, concept:concept.label,
    topic:concept.topic, intent:index % 2 ? 'demonstrate' : 'define', gradeMin:concept.gradeMin, gradeMax:concept.gradeMax,
    text, source:'standards-derived',
  }))
  return rows
}

export const ANTICIPATED_PROMPT_BANK: AnticipatedPrompt[] =
  STANDARDS_CONCEPT_GRAPH.flatMap(expandConceptPrompts)

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9#\s/]/g,' ').replace(/\s+/g,' ').trim()
}

function words(text: string) {
  const stop = new Set(['a','an','the','is','are','what','why','how','do','does','can','you','me','my','in','of','to','and','for','music','musical'])
  return new Set(normalize(text).split(' ').filter((w) => w.length > 1 && !stop.has(w)))
}

function jaccard(a: string, b: string) {
  const A = words(a); const B = words(b)
  if (!A.size || !B.size) return 0
  let intersection = 0
  A.forEach((w) => { if (B.has(w)) intersection++ })
  return intersection / new Set([...A,...B]).size
}

export function matchAnticipatedPrompt(query: string) {
  const q = normalize(query)
  let best: { prompt: AnticipatedPrompt; confidence: number } | null = null
  ANTICIPATED_PROMPT_BANK.forEach((prompt) => {
    const p = normalize(prompt.text)
    const exactBoost = q === p ? 1 : q.includes(p) || p.includes(q) ? 0.9 : 0
    const concept = STANDARDS_CONCEPT_GRAPH.find((c) => c.id === prompt.conceptId)
    const keywordBoost = concept?.keywords.some((k) => q.includes(normalize(k))) ? 0.22 : 0
    const score = Math.min(1, Math.max(exactBoost, jaccard(q,p) + keywordBoost))
    if (!best || score > best.confidence) best = { prompt, confidence: score }
  })
  return best && best.confidence >= 0.3 ? best : null
}

export function promptBankStats() {
  return {
    concepts: STANDARDS_CONCEPT_GRAPH.length,
    prompts: ANTICIPATED_PROMPT_BANK.length,
    topics: new Set(STANDARDS_CONCEPT_GRAPH.map((c) => c.topic)).size,
    nationalAnchored: STANDARDS_CONCEPT_GRAPH.filter((c) => c.standards.some((s) => s.framework === 'NCAS/NAfME')).length,
    tennesseeAnchored: STANDARDS_CONCEPT_GRAPH.filter((c) => c.standards.some((s) => s.framework === 'Tennessee')).length,
  }
}
