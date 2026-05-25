import React, { useMemo, useState } from 'react'
import {
  buildTechniquePrompt,
  getInstrumentFamilies,
  getInstrumentsForFamily,
  getTechniquePriorities,
  getTemplatesForFamily,
  type InstrumentFamily,
  type TechniqueCategory,
  type TechniqueDifficulty,
  type ScaleType,
} from '../music/TechniqueLabEngine'

const DIFFICULTIES: TechniqueDifficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
]

const CATEGORIES: TechniqueCategory[] = [
  'Scales',
  'Arpeggios',
  'Sight Reading',
  'Rhythm',
  'Articulation',
  'Intervals',
  'Technique Builder',
  'Rudiments',
]

const SCALE_TYPES: ScaleType[] = [
  'Major',
  'Natural Minor',
  'Harmonic Minor',
  'Melodic Minor',
  'Pentatonic',
  'Blues',
  'Modes',
  'Chromatic',
]

export default function TechniqueLabWorkbench() {
  const families = useMemo(() => getInstrumentFamilies(), [])

  const [family, setFamily] = useState<InstrumentFamily>('Percussion')
  const [difficulty, setDifficulty] = useState<TechniqueDifficulty>('Beginner')
  const [category, setCategory] = useState<TechniqueCategory>('Scales')
  const [scaleType, setScaleType] = useState<ScaleType>('Major')

  const instruments = useMemo(() => getInstrumentsForFamily(family), [family])
  const [instrument, setInstrument] = useState('Snare Drum')

  const priorities = useMemo(() => getTechniquePriorities(family), [family])
  const templates = useMemo(() => getTemplatesForFamily(family), [family])

  const generatedPrompt = useMemo(() => buildTechniquePrompt({
    family,
    instrument,
    category,
    difficulty,
    scaleType,
  }), [family, instrument, category, difficulty, scaleType])

  function handleFamilyChange(nextFamily: InstrumentFamily) {
    setFamily(nextFamily)
    const nextInstruments = getInstrumentsForFamily(nextFamily)
    setInstrument(nextInstruments[0] ?? '')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, padding: 20, background: '#f4f4f5', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <aside style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            TechniqueLab
          </div>

          <div style={{ color: '#52525b', fontSize: 14, lineHeight: 1.6 }}>
            Adaptive musicianship and technical development workspace.
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 18, display: 'grid', gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a' }}>
            Technique Builder
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Instrument Family</span>
            <select value={family} onChange={(event) => handleFamilyChange(event.target.value as InstrumentFamily)}>
              {families.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Instrument</span>
            <select value={instrument} onChange={(event) => setInstrument(event.target.value)}>
              {instruments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as TechniqueDifficulty)}>
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as TechniqueCategory)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Scale Type</span>
            <select value={scaleType} onChange={(event) => setScaleType(event.target.value as ScaleType)}>
              {SCALE_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <button style={{ border: '1px solid #111827', background: '#111827', color: '#ffffff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
            Generate Technique Exercise
          </button>
        </div>
      </aside>

      <main style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>
                {instrument} · {difficulty}
              </div>

              <div style={{ color: '#52525b', marginTop: 4 }}>
                {category} · {scaleType}
              </div>
            </div>

            <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 13 }}>
              {family}
            </div>
          </div>

          <div style={{ border: '1px dashed #cbd5e1', borderRadius: 14, background: '#fcfcfd', padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>
              Generated Technique Prompt
            </div>

            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {generatedPrompt}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Technical Priorities
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {priorities.map((priority) => (
                  <div
                    key={priority}
                    style={{
                      border: '1px solid #d4d4d8',
                      borderRadius: 999,
                      background: '#ffffff',
                      padding: '6px 10px',
                      fontSize: 13,
                    }}
                  >
                    {priority}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Suggested Templates
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid #d4d4d8',
                      borderRadius: 12,
                      background: '#ffffff',
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {template.title}
                    </div>

                    <div style={{ fontSize: 13, color: '#52525b', marginBottom: 8 }}>
                      {template.description}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {template.focusAreas.map((focus) => (
                        <div
                          key={focus}
                          style={{
                            borderRadius: 999,
                            background: '#e5e7eb',
                            padding: '4px 8px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {focus}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
