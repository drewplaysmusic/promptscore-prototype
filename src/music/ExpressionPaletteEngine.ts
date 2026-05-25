export type ExpressionCategory =
  | 'dynamic'
  | 'articulation'
  | 'tempo'
  | 'expression-text'
  | 'phrasing'

export type ExpressionPlacement =
  | 'above-staff'
  | 'below-staff'
  | 'inline'
  | 'spanning'

export type ExpressionTranslation = {
  languageCode: string
  languageName: string
  translatedText: string
  educationalMeaning: string
}

export type ExpressionMarking = {
  id: string
  symbol: string
  category: ExpressionCategory
  displayName: string
  originLanguage?: string
  educationalDefinition: string
  placement: ExpressionPlacement
  translations: ExpressionTranslation[]
}

export type ExpressionPaletteGroup = {
  id: string
  title: string
  category: ExpressionCategory
  markings: ExpressionMarking[]
}

function buildTranslation(
  languageCode: string,
  languageName: string,
  translatedText: string,
  educationalMeaning: string,
): ExpressionTranslation {
  return {
    languageCode,
    languageName,
    translatedText,
    educationalMeaning,
  }
}

export const DYNAMIC_MARKINGS: ExpressionMarking[] = [
  {
    id: 'pp',
    symbol: 'pp',
    category: 'dynamic',
    displayName: 'Pianissimo',
    originLanguage: 'Italian',
    educationalDefinition: 'Very soft dynamic level.',
    placement: 'below-staff',
    translations: [
      buildTranslation('en', 'English', 'very soft', 'Perform with delicate, restrained volume.'),
      buildTranslation('it', 'Italian', 'pianissimo', 'Traditional Italian dynamic marking meaning very soft.'),
      buildTranslation('es', 'Spanish', 'muy suave', 'Tocar con un volumen muy suave.'),
    ],
  },
  {
    id: 'mf',
    symbol: 'mf',
    category: 'dynamic',
    displayName: 'Mezzo Forte',
    originLanguage: 'Italian',
    educationalDefinition: 'Moderately loud dynamic level.',
    placement: 'below-staff',
    translations: [
      buildTranslation('en', 'English', 'moderately loud', 'Balanced and controlled performance volume.'),
      buildTranslation('it', 'Italian', 'mezzo forte', 'Traditional Italian marking for moderately loud.'),
      buildTranslation('fr', 'French', 'modérément fort', 'Jouer avec une intensité modérée.'),
    ],
  },
  {
    id: 'ff',
    symbol: 'ff',
    category: 'dynamic',
    displayName: 'Fortissimo',
    originLanguage: 'Italian',
    educationalDefinition: 'Very loud dynamic level.',
    placement: 'below-staff',
    translations: [
      buildTranslation('en', 'English', 'very loud', 'Perform with strong projection and intensity.'),
      buildTranslation('it', 'Italian', 'fortissimo', 'Traditional Italian dynamic marking meaning very loud.'),
      buildTranslation('de', 'German', 'sehr laut', 'Mit großer Lautstärke und Energie spielen.'),
    ],
  },
]

export const ARTICULATION_MARKINGS: ExpressionMarking[] = [
  {
    id: 'staccato',
    symbol: '•',
    category: 'articulation',
    displayName: 'Staccato',
    originLanguage: 'Italian',
    educationalDefinition: 'Short, detached articulation.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'detached', 'Separate the notes clearly and lightly.'),
      buildTranslation('it', 'Italian', 'staccato', 'Detached style of articulation.'),
    ],
  },
  {
    id: 'accent',
    symbol: '>',
    category: 'articulation',
    displayName: 'Accent',
    originLanguage: 'Italian',
    educationalDefinition: 'Emphasize the beginning of the note.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'accented', 'Give extra weight or emphasis to the note.'),
      buildTranslation('es', 'Spanish', 'acentuado', 'Dar énfasis adicional al sonido.'),
    ],
  },
]

export const TEMPO_MARKINGS: ExpressionMarking[] = [
  {
    id: 'andante',
    symbol: 'Andante',
    category: 'tempo',
    displayName: 'Andante',
    originLanguage: 'Italian',
    educationalDefinition: 'Walking pace tempo.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'walking pace', 'Comfortable flowing tempo.'),
      buildTranslation('it', 'Italian', 'andante', 'Traditional tempo marking meaning walking pace.'),
    ],
  },
  {
    id: 'allegro',
    symbol: 'Allegro',
    category: 'tempo',
    displayName: 'Allegro',
    originLanguage: 'Italian',
    educationalDefinition: 'Fast and lively tempo.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'fast and lively', 'Energetic forward-moving tempo.'),
      buildTranslation('it', 'Italian', 'allegro', 'Traditional lively fast tempo marking.'),
    ],
  },
]

export const EXPRESSION_TEXT_MARKINGS: ExpressionMarking[] = [
  {
    id: 'dolce',
    symbol: 'dolce',
    category: 'expression-text',
    displayName: 'Dolce',
    originLanguage: 'Italian',
    educationalDefinition: 'Sweetly and gently performed.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'sweetly', 'Perform with warmth and gentle expression.'),
      buildTranslation('it', 'Italian', 'dolce', 'Traditional expressive marking meaning sweetly.'),
      buildTranslation('fr', 'French', 'doucement', 'Jouer avec douceur et expression.'),
    ],
  },
  {
    id: 'espressivo',
    symbol: 'espressivo',
    category: 'expression-text',
    displayName: 'Espressivo',
    originLanguage: 'Italian',
    educationalDefinition: 'Expressively performed.',
    placement: 'above-staff',
    translations: [
      buildTranslation('en', 'English', 'expressively', 'Play with emotional shaping and phrasing.'),
      buildTranslation('it', 'Italian', 'espressivo', 'Traditional marking for expressive playing.'),
    ],
  },
]

export const EXPRESSION_PALETTE_GROUPS: ExpressionPaletteGroup[] = [
  {
    id: 'dynamics',
    title: 'Dynamics',
    category: 'dynamic',
    markings: DYNAMIC_MARKINGS,
  },
  {
    id: 'articulations',
    title: 'Articulations',
    category: 'articulation',
    markings: ARTICULATION_MARKINGS,
  },
  {
    id: 'tempo',
    title: 'Tempo',
    category: 'tempo',
    markings: TEMPO_MARKINGS,
  },
  {
    id: 'expression-text',
    title: 'Expression',
    category: 'expression-text',
    markings: EXPRESSION_TEXT_MARKINGS,
  },
]

export function getExpressionMarking(markingId: string): ExpressionMarking | undefined {
  return EXPRESSION_PALETTE_GROUPS
    .flatMap((group) => group.markings)
    .find((marking) => marking.id === markingId)
}

export function getTranslationForLanguage({
  marking,
  languageCode,
}: {
  marking: ExpressionMarking
  languageCode: string
}): ExpressionTranslation | undefined {
  return marking.translations.find((translation) => translation.languageCode === languageCode)
}
