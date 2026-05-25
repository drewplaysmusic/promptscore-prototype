import React from 'react'
import type { MusicMaskOutput } from '../music/MusicIntelligenceLayer'

function getMaskColor(brainId: string): string {
  switch (brainId) {
    case 'rhythm':
      return '#2563eb'

    case 'pitch-literacy':
      return '#059669'

    case 'theory':
      return '#7c3aed'

    case 'technique':
      return '#ea580c'

    case 'percussion':
      return '#dc2626'

    default:
      return '#111827'
  }
}

export default function NotationMaskOverlayLayer({
  outputs,
}: {
  outputs: MusicMaskOutput[]
}) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 220, marginTop: 16 }}>
      <div
        style={{
          border: '1px dashed #cbd5e1',
          borderRadius: 16,
          background: '#fcfcfd',
          minHeight: 220,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
            {outputs.map((output, index) => {
              const measure = output.anchor.measure ?? 1
              const beat = output.anchor.beat ?? 1

              const left = 60 + (measure - 1) * 180 + beat * 28
              const top = output.type === 'analysis-label'
                ? 24
                : output.type === 'practice-prompt'
                  ? 150
                  : output.brainId === 'rhythm'
                    ? 135
                    : 70

              return (
                <div
                  key={`${output.id}-${index}`}
                  style={{
                    position: 'absolute',
                    left,
                    top,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: 999,
                    border: `1px solid ${getMaskColor(output.brainId)}`,
                    background: '#ffffff',
                    color: getMaskColor(output.brainId),
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {output.value}
                </div>
              )
            })}
        </div>

        <div style={{ padding: 18, display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>
              Notation Mask Overlay Layer
            </div>

            <div style={{ fontSize: 13, color: '#52525b' }}>
              Spatial educational masks attached to musical structure, measure position, and brain outputs.
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18, marginTop: 20 }}>
            {[1, 2].map((staff) => (
              <div
                key={staff}
                style={{
                  position: 'relative',
                  height: 72,
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    style={{
                      position: 'absolute',
                      left: 18,
                      right: 18,
                      top: 12 + line * 12,
                      height: 1,
                      background: '#9ca3af',
                    }}
                  />
                ))}

                {[1, 2, 3, 4].map((measure) => (
                  <div
                    key={measure}
                    style={{
                      position: 'absolute',
                      top: 8,
                      bottom: 8,
                      left: 40 + measure * 180,
                      width: 2,
                      background: '#d1d5db',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
