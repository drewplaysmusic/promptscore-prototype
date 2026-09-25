export const STANDARDS_SOURCES = {
  national: {
    name: 'National Core Arts Standards / NAfME 2014 Music Standards',
    scope: 'PK-8 General Music',
    url: 'https://nafme.org/publications-resources/standards/',
    primaryProcesses: ['Create', 'Perform', 'Respond', 'Connect'],
    note: 'Use the grade-by-grade PK-8 General Music strand as the national anchor. Connecting is embedded throughout the music standards while NCAS also presents it as an artistic process.',
  },
  tennessee: {
    name: 'Tennessee Academic Standards for Fine Arts Education',
    scope: 'General Music K-5 and 6-8; Instrumental/Vocal 6-8 where relevant',
    url: 'https://www.tn.gov/education/districts/academic-standards/arts-education.html',
    primaryProcesses: ['Create', 'Perform', 'Respond', 'Connect'],
    note: 'Tennessee states that its fine-arts standards are based on the national standards. PromptScore stores Tennessee codes alongside national process alignment so a question can be reused nationally while still producing state-specific teacher reports.',
  },
} as const

export const QUESTION_BANK_POLICY = {
  targetCanonicalQuestions: 1000,
  defaultScope: 'K-8',
  sourcePriority: ['Tennessee grade-level performance standard', 'NCAS/NAfME grade-level standard', 'teacher/student language variants'],
  promotionRule: 'New raw questions enter the question stream first. They become canonical only after clustering/review, preventing duplicates, typos, and off-topic prompts from polluting the vetted bank.',
  privacyRule: 'Do not store student names, emails, school identifiers, or free-text personal information in the question bank.',
} as const
