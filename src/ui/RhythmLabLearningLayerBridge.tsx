import React, { useMemo, useState } from 'react'
import LearningLayersPanel from './LearningLayersPanel'
import {
  DEFAULT_OVERLAY_STATE,
  buildEducationalOverlays,
  type EducationalOverlayState,
  type EducationalOverlayType,
} from '../music/EducationalOverlayEngine'

export default function RhythmLabLearningLayerBridge({
  notes,
  countsByMeasure,
}: {
  notes: any[]
  countsByMeasure: Record<number, string[]>
}) {
  const [overlays, setOverlays] = useState<EducationalOverlayState>(DEFAULT_OVERLAY_STATE)

  const rendered = useMemo(() => buildEducationalOverlays({
    notes,
    countsByMeasure,
    enabled: overlays,
  }), [notes, countsByMeasure, overlays])

  function handleToggle(key: EducationalOverlayType) {
    setOverlays((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginTop: 16 }}>
      <LearningLayersPanel overlays={overlays} onToggle={handleToggle} />

      <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 16, display: 'grid', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>
            Active Learning Layers
          </div>

          <div style={{ fontSize: 13, color: '#52525b' }}>
            Educational overlay rendering preview and alignment engine.
          </div>
        </div>

        {rendered.noteNames.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Note Name Overlay</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rendered.noteNames.map((item, index) => (
                <div
                  key={`note-${index}`}
                  style={{
                    border: '1px solid #d4d4d8',
                    borderRadius: 999,
                    background: '#fafafa',
                    padding: '6px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {rendered.countLabels.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Count Overlay</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rendered.countLabels.map((item, index) => (
                <div
                  key={`count-${index}`}
                  style={{
                    border: '1px solid #d4d4d8',
                    borderRadius: 999,
                    background: '#ffffff',
                    padding: '6px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {rendered.solfege.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Solfege Overlay</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rendered.solfege.map((item, index) => (
                <div
                  key={`solfege-${index}`}
                  style={{
                    border: '1px solid #d4d4d8',
                    borderRadius: 999,
                    background: '#eef2ff',
                    padding: '6px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
