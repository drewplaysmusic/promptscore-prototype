import React from 'react'
import type { MusicalPattern } from '../music/MusicalPatternRegistry'

type ChartChord = { symbol:string; measure:number }
function accidental(a:any){ return a==='Flat'?'b':a==='Sharp'?'#':'' }
function qualitySuffix(count:number){ return count===4?'7':'' }

export default function ChordChartRenderer({notes,harmonyProgression=[],form}:{notes:any[];harmonyProgression?:string[];form?:MusicalPattern}){
  const chords:ChartChord[]=notes.filter(n=>n.chordPitches?.length).map((n,i)=>{
    const root=n.chordPitches[0]
    const label=harmonyProgression[i]
    const symbol=label && /[A-G]/i.test(label) ? label : `${root.step ?? root.pitch}${accidental(root.accidental)}${qualitySuffix(n.chordPitches.length)}`
    return {symbol,measure:n.measure ?? i+1}
  })
  if(!chords.length) return <div style={{padding:'42px 12px',textAlign:'center',color:'#60708a'}}>Chord Chart view is available when the generated music contains harmony.</div>

  const sections=form?.sections?.length ? form.sections.map(s=>({label:s.label,count:s.degrees.length})) : [{label:form?.name ?? '',count:chords.length}]
  let cursor=0
  return <div style={{padding:'24px 4px 10px'}}>
    {form && <div style={{marginBottom:18}}>
      <div style={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#60708a'}}>Form</div>
      <div style={{fontSize:20,fontWeight:800,color:'#17223b',marginTop:3}}>{form.name}{form.bars ? ` · ${form.bars} bars` : ''}</div>
      {form.sections && <div style={{fontSize:14,color:'#60708a',marginTop:3}}>{form.sections.map(s=>s.label.replace(/\d+$/,'')).join(' – ')}</div>}
    </div>}
    {sections.map((section,si)=>{
      const slice=chords.slice(cursor,cursor+section.count); cursor+=section.count
      return <div key={si} style={{marginBottom:20}}>
        {section.label && <div style={{fontSize:15,fontWeight:850,color:'#17223b',margin:'0 0 7px 2px'}}>{section.label}</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(110px,1fr))',gap:10}}>
          {slice.map((ch,i)=><div key={i} style={{minHeight:72,border:'1px solid #cfd8e6',borderRadius:8,padding:'10px 12px',background:'#fff'}}>
            <div style={{fontSize:10,color:'#8190a6',marginBottom:8}}>{ch.measure}</div>
            <div style={{fontSize:22,fontWeight:750,color:'#17223b'}}>{ch.symbol}</div>
          </div>)}
        </div>
      </div>
    })}
  </div>
}
