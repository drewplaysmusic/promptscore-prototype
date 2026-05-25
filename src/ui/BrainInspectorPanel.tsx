import React from 'react'
import type { BrainExecutionResult } from '../music/BrainExecutionEngine'

export default function BrainInspectorPanel({
  execution,
}: {
  execution: BrainExecutionResult
}) {
  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 18, background: '#ffffff', padding: 18, display: 'grid', gap: 18 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 6 }}>
          Brain Inspector
        </div>

        <div style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6 }}>
          Live cognition pipeline, reasoning visibility, and educational intelligence output inspection.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            Active Brains
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {execution.activeBrains.map((brain) => (
              <div
                key={brain.id}
                style={{
                  border: '1px solid #d4d4d8',
                  borderRadius: 12,
                  background: '#ffffff',
                  padding: 10,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {brain.name}
                </div>

                <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.5 }}>
                  {brain.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            Analysis Summary
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>Key Center:</strong> {execution.analysis.estimatedKeyCenter}</div>
            <div><strong>Contour:</strong> {execution.analysis.contour}</div>
            <div><strong>Difficulty:</strong> {execution.analysis.estimatedDifficulty}</div>
            <div><strong>Cadence:</strong> {execution.analysis.cadenceTendency}</div>
            <div><strong>Rhythm Density:</strong> {execution.analysis.rhythmDensity}</div>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e4e4e7', borderRadius: 14, background: '#fafafa', padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Generated Mask Outputs
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {execution.outputs.map((output) => (
            <div
              key={output.id}
              style={{
                border: '1px solid #d4d4d8',
                borderRadius: 12,
                background: '#ffffff',
                padding: 12,
                display: 'grid',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>
                  {output.label}
                </div>

                <div style={{ fontSize: 12, color: '#71717a' }}>
                  {output.brainId}
                </div>
              </div>

              <div style={{ fontSize: 14 }}>
                {output.value}
              </div>

              <div style={{ fontSize: 12, color: '#71717a' }}>
                Measure {output.anchor.measure ?? '-'} · Beat {output.anchor.beat ?? '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: '1px dashed #cbd5e1', borderRadius: 14, background: '#fcfcfd', padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Explainable Intelligence
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {execution.analysis.explanation.map((line, index) => (
            <div
              key={index}
              style={{
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                padding: '8px 10px',
                fontSize: 13,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
