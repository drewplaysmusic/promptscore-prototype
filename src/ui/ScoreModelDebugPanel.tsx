import React, { useMemo } from 'react'
import { buildScoreDocument } from './ScoreModel'
import type { KeySignatureValue, NoteEvent, TimeSignatureValue } from './musicBrain'

export default function ScoreModelDebugPanel({ notes, timeSignature, keySignature }: {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
}) {
  const scoreDocument = useMemo(() => buildScoreDocument(notes, timeSignature, keySignature), [notes, timeSignature, keySignature])
  const measures = scoreDocument.systems.flatMap((system) => system.measures)
  const voiceTotals = measures.reduce<Record<string, number>>((totals, measure) => {
    measure.voices.forEach((voice) => {
      totals[voice.type] = (totals[voice.type] ?? 0) + voice.events.length
    })
    return totals
  }, {})

  return (
    <div style={{ marginTop: 16, border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 14, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Score Model Debug</div>
          <div style={{ fontSize: 12, color: '#71717a' }}>ScoreDocument → Systems → Measures → Voices → Events</div>
        </div>
        <div style={{ fontSize: 12, color: '#52525b' }}>
          {scoreDocument.systems.length} system(s) · {measures.length} measure(s) · {notes.length} event(s)
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(voiceTotals).length === 0 ? (
          <span style={{ fontSize: 12, color: '#71717a' }}>No voices yet.</span>
        ) : Object.entries(voiceTotals).map(([voiceType, count]) => (
          <span key={voiceType} style={{ border: '1px solid #e4e4e7', borderRadius: 999, background: '#f8fafc', padding: '6px 10px', fontSize: 12 }}>
            {voiceType}: <strong>{count}</strong>
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 6, maxHeight: 160, overflow: 'auto' }}>
        {measures.slice(0, 12).map((measure) => (
          <div key={measure.measureNumber} style={{ border: '1px solid #e4e4e7', borderRadius: 10, background: '#fafafa', padding: 8, fontSize: 12 }}>
            <strong>Measure {measure.measureNumber}</strong>{' '}
            {measure.voices.length === 0 ? 'No voices' : measure.voices.map((voice) => `${voice.name}: ${voice.events.length}`).join(' · ')}
          </div>
        ))}
      </div>
    </div>
  )
}
