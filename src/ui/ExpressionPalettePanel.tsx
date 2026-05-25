import React, { useMemo, useState } from 'react'
import {
  EXPRESSION_PALETTE_GROUPS,
  getTranslationForLanguage,
  type ExpressionMarking,
} from '../music/ExpressionPaletteEngine'

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
]

export default function ExpressionPalettePanel({
  onSelectMarking,
}: {
  onSelectMarking?: (marking: ExpressionMarking) => void
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedMarking, setSelectedMarking] = useState<ExpressionMarking | null>(
    EXPRESSION_PALETTE_GROUPS[0]?.markings[0] ?? null,
  )

  const selectedTranslation = useMemo(() => {
    if (!selectedMarking) return undefined

    return getTranslationForLanguage({
      marking: selectedMarking,
      languageCode: selectedLanguage,
    }) ?? selectedMarking.translations[0]
  }, [selectedMarking, selectedLanguage])

  function handleSelect(marking: ExpressionMarking) {
    setSelectedMarking(marking)
    onSelectMarking?.(marking)
  }

  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 18, background: '#ffffff', padding: 18, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>
            Expression Palette
          </div>

          <div style={{ fontSize: 14, color: '#52525b', lineHeight: 1.5 }}>
            Dynamics, articulations, tempo markings, expression text, and musical-language translations.
          </div>
        </div>

        <label style={{ display: 'grid', gap: 6, minWidth: 150 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>Learning Language</span>
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '8px 10px', background: '#fafafa' }}
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          {EXPRESSION_PALETTE_GROUPS.map((group) => (
            <div key={group.id} style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                {group.title}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {group.markings.map((marking) => {
                  const active = selectedMarking?.id === marking.id

                  return (
                    <button
                      key={marking.id}
                      type="button"
                      onClick={() => handleSelect(marking)}
                      style={{
                        border: active ? '1px solid #111827' : '1px solid #d4d4d8',
                        background: active ? '#111827' : '#ffffff',
                        color: active ? '#ffffff' : '#111827',
                        borderRadius: 14,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'grid',
                        gap: 4,
                        minWidth: 78,
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Georgia, serif' }}>
                        {marking.symbol}
                      </span>

                      <span style={{ fontSize: 11, opacity: active ? 0.82 : 0.65 }}>
                        {marking.displayName}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fcfcfd', padding: 16, display: 'grid', gap: 14, alignContent: 'start' }}>
          {selectedMarking ? (
            <>
              <div>
                <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'Georgia, serif', marginBottom: 4 }}>
                  {selectedMarking.symbol}
                </div>

                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {selectedMarking.displayName}
                </div>

                <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
                  {selectedMarking.category} · {selectedMarking.originLanguage ?? 'music notation'} · {selectedMarking.placement}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 6 }}>
                  Educational Definition
                </div>

                <div style={{ color: '#111827', lineHeight: 1.55 }}>
                  {selectedMarking.educationalDefinition}
                </div>
              </div>

              {selectedTranslation ? (
                <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>
                    Translation · {selectedTranslation.languageName}
                  </div>

                  <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                    {selectedTranslation.translatedText}
                  </div>

                  <div style={{ color: '#52525b', lineHeight: 1.55 }}>
                    {selectedTranslation.educationalMeaning}
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#71717a' }}>
                  Learning Uses
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ borderRadius: 999, background: '#e5e7eb', padding: '6px 10px', fontSize: 12, fontWeight: 700 }}>Interpretation</span>
                  <span style={{ borderRadius: 999, background: '#e5e7eb', padding: '6px 10px', fontSize: 12, fontWeight: 700 }}>Performance</span>
                  <span style={{ borderRadius: 999, background: '#e5e7eb', padding: '6px 10px', fontSize: 12, fontWeight: 700 }}>Language</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: '#71717a' }}>
              Select a marking to inspect its meaning and translation.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
