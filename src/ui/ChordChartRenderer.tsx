import React from 'react'
import type { MusicalPattern } from '../music/MusicalPatternRegistry'

type ChartChord = { symbol:string; measure:number; beat:number }
function accidental(a:any){ return a==='Flat'?'b':a==='Sharp'?'#':'' }
function qualitySuffix(count:number){ return count===4?'7':'' }

export default function ChordChartRenderer({notes,harmonyProgression=[],form}:{notes:any[];harmonyProgression?:string[];form?:MusicalPattern}){
  const chords:ChartChord[]=notes.filter(n=>n.chordPitches?.length).map((n,i)=>{
    const root=n.chordPitches[0]
    const label=harmonyProgression[i]
    const symbol=label && /[A-G]/i.test(label) ? label : `${root.step ?? root.pitch}${accidental(root.accidental)}${qualitySuffix(n.chordPitches.length)}`
    return {symbol,measure:n.measure ?? i+1,beat:n.beat ?? 1}
  })
  if(!chords.length) return <div style={{padding:'42px 12px',textAlign:'center',color:'#60708a'}}>Chord Chart view is available when the generated music contains harmony.</div>

  const measures=Array.from(new Set(chords.map(c=>c.measure))).sort((a,b)=>a-b)
  const bars=measures.map(m=>({measure:m,chords:chords.filter(c=>c.measure===m).sort((a,b)=>a.beat-b.beat)}))
  const sectionStarts=new Map<number,string>()
  if(form?.sections?.length && form.bars){
    const barsPerSection=Math.floor(form.bars/form.sections.length)
    form.sections.forEach((s,i)=>sectionStarts.set(1+i*barsPerSection,s.label))
  } else if(form) sectionStarts.set(1,form.name)

  return <div style={{padding:'24px 4px 10px'}}>
    {form && <div style={{marginBottom:18}}>
      <div style={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#60708a'}}>Form</div>
      <div style={{fontSize:20,fontWeight:800,color:'#17223b',marginTop:3}}>{form.name}{form.bars ? ` · ${form.bars} bars` : ''}</div>
      {form.sections && <div style={{fontSize:14,color:'#60708a',marginTop:3}}>{form.sections.map(s=>s.label.replace(/\d+$/,'')).join(' – ')}</div>}
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(110px,1fr))',gap:'20px 8px'}}>
      {bars.map((bar,i)=><div key={bar.measure} style={{position:'relative',minHeight:76,borderLeft:'2px solid #17223b',borderRight:i%4===3?'2px solid #17223b':'1px solid #9aa8bb',padding:'12px 12px 8px',background:'#fff'}}>
        {sectionStarts.has(bar.measure) && <div style={{position:'absolute',top:-19,left:0,fontSize:14,fontWeight:900,color:'#2563eb'}}>{sectionStarts.get(bar.measure)}</div>}
        <div style={{position:'absolute',top:3,right:6,fontSize:9,color:'#9aa8bb'}}>{bar.measure}</div>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${bar.chords.length},1fr)`,alignItems:'center',height:'100%',gap:8}}>
          {bar.chords.map((ch,j)=><div key={j} style={{fontSize:21,fontWeight:800,color:'#17223b',whiteSpace:'nowrap'}}>{ch.symbol}</div>)}
        </div>
      </div>)}
    </div>
  </div>
}
