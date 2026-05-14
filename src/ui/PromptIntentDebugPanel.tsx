import React, { useMemo, useState } from 'react'
import { parsePromptIntent } from './PromptIntentEngine'

export default function PromptIntentDebugPanel() {
  const [prompt, setPrompt] = useState('16 measures melody in G major in the style of Mozart for piano')
  const intent = useMemo(() => parsePromptIntent(prompt), [prompt])

  return (
    <div style={{ marginTop: 16, border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 14, display: 'grid', gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Prompt Intent Lab</div>
        <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Type a music prompt and see how PromptScore understands it.</div>
      </div>

      <input
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, fontSize: 12 }}>
        <div><strong>Task:</strong> {intent.task}</div>
        <div><strong>Measures:</strong> {intent.measureCount}</div>
        <div><strong>Key:</strong> {intent.keyRoot} {intent.mode}</div>
        <div><strong>Style:</strong> {intent.style}</div>
        <div><strong>Instrument:</strong> {intent.instrument}</div>
        <div><strong>Density:</strong> {intent.density}</div>
      </div>

      <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, background: '#fafafa', padding: 10, fontSize: 13, color: '#3f3f46' }}>
        {intent.summary}
      </div>
    </div>
  )
}
