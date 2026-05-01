export type StyleValue =
  | 'plain'
  | 'baroque'
  | 'classical'
  | 'romantic'
  | 'renaissance'
  | 'jazz'
  | 'rock'
  | 'modern'
  | 'folk'
  | 'country'

export type ScaleSystemValue =
  | 'major'
  | 'natural minor'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'harmonic minor'
  | 'melodic minor'
  | 'whole tone'
  | 'diminished'

export type RomanNumeral =
  | 'I'
  | 'ii'
  | 'iii'
  | 'IV'
  | 'V'
  | 'vi'
  | 'vii°'
  | 'i'
  | 'ii°'
  | 'III'
  | 'iv'
  | 'v'
  | 'VI'
  | 'VII'
  | 'bVII'
  | 'ii7'
  | 'V7'
  | 'Imaj7'
  | 'iim7'
  | 'V7alt'
  | 'Im7'
  | 'IV7'
  | 'vii°7'
  | 'none'

export type HarmonyPlan = {
  label: string
  progression: RomanNumeral[]
  description: string
}

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/[.,;:]/g, ' ')
}

function hasExplicitProgression(prompt: string): boolean {
  return /\b(i|ii|iii|iv|v|vi|vii|bVII|I|II|III|IV|V|VI|VII)\b/.test(prompt)
}

function parseExplicitProgression(promptText: string): HarmonyPlan | null {
  const rawTokens = promptText
    .replace(/[-–—>→]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const accepted = new Set<RomanNumeral>([
    'I',
    'ii',
    'iii',
    'IV',
    'V',
    'vi',
    'vii°',
    'i',
    'ii°',
    'III',
    'iv',
    'v',
    'VI',
    'VII',
    'bVII',
    'ii7',
    'V7',
    'Imaj7',
    'iim7',
    'V7alt',
    'Im7',
    'IV7',
    'vii°7',
  ])

  const progression = rawTokens.filter((token): token is RomanNumeral => accepted.has(token as RomanNumeral))

  if (progression.length === 0) return null

  return {
    label: 'explicit progression',
    progression,
    description: `Using explicit Roman numeral progression: ${progression.join(' → ')}.`,
  }
}

function getModalHarmony(scaleSystem: ScaleSystemValue): HarmonyPlan | null {
  if (scaleSystem === 'dorian') {
    return {
      label: 'dorian vamp',
      progression: ['i', 'IV', 'i', 'VII'],
      description: 'Dorian color: minor tonic with raised sixth energy through IV.',
    }
  }

  if (scaleSystem === 'mixolydian') {
    return {
      label: 'mixolydian rock cadence',
      progression: ['I', 'bVII', 'IV', 'I'],
      description: 'Mixolydian color: major tonic with lowered seventh motion.',
    }
  }

  if (scaleSystem === 'phrygian') {
    return {
      label: 'phrygian color',
      progression: ['i', 'II', 'i', 'VII'] as RomanNumeral[],
      description: 'Phrygian color: dark minor center with flat-second pull.',
    }
  }

  if (scaleSystem === 'lydian') {
    return {
      label: 'lydian lift',
      progression: ['I', 'II', 'I', 'V'] as RomanNumeral[],
      description: 'Lydian color: bright raised-fourth sound with floating tonic pull.',
    }
  }

  if (scaleSystem === 'harmonic minor') {
    return {
      label: 'harmonic minor cadence',
      progression: ['i', 'iv', 'V7', 'i'],
      description: 'Harmonic minor color: minor tonic with strong dominant pull.',
    }
  }

  if (scaleSystem === 'melodic minor') {
    return {
      label: 'melodic minor color',
      progression: ['i', 'IV', 'V7', 'i'],
      description: 'Melodic minor color: minor tonic with brighter upper tendency tones.',
    }
  }

  if (scaleSystem === 'whole tone') {
    return {
      label: 'whole tone color field',
      progression: ['none'],
      description: 'Whole tone sound: ambiguous harmony, best treated as a color field rather than functional chords.',
    }
  }

  if (scaleSystem === 'diminished') {
    return {
      label: 'diminished color field',
      progression: ['vii°7', 'V7', 'vii°7', 'I'],
      description: 'Diminished sound: tension-dominant color, useful for approach and resolution.',
    }
  }

  return null
}

function getStyleHarmony(style: StyleValue, scaleSystem: ScaleSystemValue): HarmonyPlan {
  if (style === 'jazz') {
    return {
      label: 'jazz ii–V–I',
      progression: ['iim7', 'V7', 'Imaj7'],
      description: 'Jazz default: ii–V–I functional motion.',
    }
  }

  if (style === 'rock') {
    return {
      label: 'rock I–bVII–IV',
      progression: ['I', 'bVII', 'IV', 'I'],
      description: 'Rock default: modal major motion using bVII and IV.',
    }
  }

  if (style === 'baroque') {
    return {
      label: 'baroque tonic-dominant',
      progression: ['I', 'IV', 'V', 'I'],
      description: 'Baroque starter: clear tonic, predominant, dominant, tonic motion.',
    }
  }

  if (style === 'classical') {
    return {
      label: 'classical phrase cadence',
      progression: ['I', 'vi', 'IV', 'V', 'I'],
      description: 'Classical starter: balanced phrase with a clear cadence.',
    }
  }

  if (style === 'romantic') {
    return {
      label: 'romantic expansion',
      progression: scaleSystem.includes('minor') ? ['i', 'VI', 'iv', 'V7', 'i'] : ['I', 'vi', 'ii', 'V7', 'I'],
      description: 'Romantic starter: longer, more expressive functional pull.',
    }
  }

  if (style === 'folk' || style === 'country') {
    return {
      label: 'folk-country primary chords',
      progression: ['I', 'IV', 'V', 'I'],
      description: 'Folk/country starter: primary-chord motion built for clear phrasing.',
    }
  }

  return {
    label: 'primary triads',
    progression: scaleSystem.includes('minor') || scaleSystem === 'aeolian' ? ['i', 'iv', 'v', 'i'] : ['I', 'IV', 'V', 'I'],
    description: 'Default starter harmony using tonic, predominant, dominant, and return.',
  }
}

export function generateHarmonyPlan(promptText: string, style: StyleValue, scaleSystem: ScaleSystemValue): HarmonyPlan {
  const normalizedPrompt = normalizePrompt(promptText)

  if (hasExplicitProgression(promptText)) {
    const explicit = parseExplicitProgression(promptText)
    if (explicit) return explicit
  }

  const modalHarmony = getModalHarmony(scaleSystem)
  if (modalHarmony) return modalHarmony

  if (normalizedPrompt.includes('12 bar') || normalizedPrompt.includes('twelve bar')) {
    return {
      label: '12-bar blues shell',
      progression: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
      description: 'Blues starter: 12-bar shell using I, IV, and V.',
    }
  }

  return getStyleHarmony(style, scaleSystem)
}
