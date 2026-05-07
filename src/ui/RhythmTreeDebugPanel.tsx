import React, { useMemo, useState } from 'react'
import { describeRhythmTree, flattenRhythmTree } from './RhythmTree'
import { runRhythmFunnel } from './RhythmFunnel'
import ScoreRenderer from './ScoreRenderer'

function formatRatio(value: number): string {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

export default function RhythmTreeDebugPanel() {
  const [prompt, setPrompt] = useState('eighth note triplets in C')
  const funnel = useMemo(() => runRhythmFunnel(prompt), [prompt])
  const tree = funnel.tree
  const leaves = useMemo(() => flattenRhythmTree(tree), [tree])
  const notationNotes = funnel.notes

  return (
    <div
      style={{
        marginTop: 16,
        border: '1px solid #d4d4d8',
        borderRadius: 14,
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e4e4e7',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>
              RhythmFunnel Lab
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
              {funnel.summary}
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${funnel.valid ? '#bbf7d0' : '#fecaca'}`,
              background: funnel.valid ? '#f0fdf4' : '#fef2f2',
              color: funnel.valid ? '#166534' : '#991b1b',
              borderRadius: 999,
              padding: '5px 9px',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {funnel.valid ? 'Valid' : 'Check'} · {funnel.intent.kind}
          </div>
        </div>

        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Try: eighth note triplets in C, 5 over 4 in D, nested ninelet in C"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #d4d4d8',
            borderRadius: 12,
            padding: '10px 12px',
            background: '#fafafa',
            fontSize: 14,
            outline: 'none',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Intent</div>
            <div>{funnel.intent.label}</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Confidence</div>
            <div>{Math.round(funnel.intent.confidence * 100)}%</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Tree</div>
            <div>{describeRhythmTree(tree)}</div>
          </div>
        </div>

        {funnel.warnings.length > 0 ? (
          <div style={{ border: '1px solid #fecaca', borderRadius: 10, padding: 8, background: '#fef2f2', fontSize: 12, color: '#991b1b' }}>
            {funnel.warnings.map((warning) => (
              <div key={warning}>⚠ {warning}</div>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            position: 'relative',
            height: 76,
            border: '1px solid #e4e4e7',
            borderRadius: 12,
            background: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 37,
              height: 1,
              background: '#d4d4d8',
            }}
          />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={`pulse-${ratio}`}
              style={{
                position: 'absolute',
                left: `${ratio * 100}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: '#cbd5e1',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748b', marginLeft: 4, marginTop: 4 }}>
                {formatRatio(ratio)}
              </div>
            </div>
          ))}

          {leaves.map((leaf, index) => {
            const left = leaf.startRatio * 100
            const width = Math.max(0.8, leaf.durationRatio * 100)

            return (
              <div
                key={leaf.id}
                title={`${leaf.id}: ${formatRatio(leaf.startRatio)} → ${formatRatio(leaf.endRatio)}`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: 24,
                  width: `${width}%`,
                  minWidth: 8,
                  height: 28,
                  border: '1px solid #a1a1aa',
                  borderRadius: 7,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#3f3f46',
                  boxSizing: 'border-box',
                }}
              >
                {index + 1}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {leaves.map((leaf, index) => (
            <div
              key={`cell-${leaf.id}`}
              style={{
                border: '1px solid #e4e4e7',
                borderRadius: 10,
                padding: 8,
                background: '#fafafa',
                fontSize: 11,
                color: '#52525b',
              }}
            >
              <div style={{ fontWeight: 800, color: '#18181b' }}>Event {index + 1}</div>
              <div>{formatRatio(leaf.startRatio)} → {formatRatio(leaf.endRatio)}</div>
              <div>dur {formatRatio(leaf.durationRatio)}</div>
              {leaf.ratio ? <div>{leaf.ratio.label}</div> : null}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', marginBottom: 8 }}>
            RhythmFunnel Notation Preview
          </div>
          <ScoreRenderer notes={notationNotes} timeSignature="4/4" keySignature="C major" />
        </div>
      </div>
    </div>
  )
}
