import React from 'react'

type ChartChord = { symbol:string; measure:number }

function accidental(a:any){ return a==='Flat'?'b':a==='Sharp'?'#':'' }
function qualitySuffix(count:number, root:any, pitches:any[]){
  if(count===4) return '7'
  return ''
}

export default function ChordChartRenderer({notes,harmonyProgression=[]}:{notes:any[];harmonyProgression?:string[]}){
  const chords:ChartChord[]=notes.filter(n=>n.chordPitches?.length).map((n,i)=>{
    const root=n.chordPitches[0]
    const label=harmonyProgression[i]
    const symbol=label && /[A-G]/i.test(label) ? label : `${root.step ?? root.pitch}${accidental(root.accidental)}${qualitySuffix(n.chordPitches.length,root,n.chordPitches)}`
    return {symbol,measure:n.measure ?? i+1}
  })
  if(!chords.length) return <div style={{padding:'42px 12px',textAlign:'center',color:'#60708a'}}>Chord Chart view is available when the generated music contains harmony.</div>
  return <div style={{padding:'24px 4px 10px'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(110px,1fr))',gap:10}}>
      {chords.map((c,i)=><div key={i} style={{minHeight:72,border:'1px solid #cfd8e6',borderRadius:8,padding:'10px 12px',background:'#fff'}}>
        <div style={{fontSize:10,color:'#8190a6',marginBottom:8}}>{c.measure}</div>
        <div style={{fontSize:22,fontWeight:750,color:'#17223b'}}>{c.symbol}</div>
      </div>)}
    </div>
  </div>
}
