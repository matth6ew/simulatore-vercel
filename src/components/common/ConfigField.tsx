import React, { useState, useEffect } from 'react';

export function ConfigField({ def, value, defaultValue, onChange, lang }: any) {
  const modificato = value !== defaultValue;
  const [bozza, setBozza] = useState(String(value));
  useEffect(() => { setBozza(String(value)); }, [value]);
  const limita = (n: number) => Math.min(def.max, Math.max(def.min, n));
  const conferma = (v: string) => {
    const n = Number(v);
    if (v.trim() === '' || Number.isNaN(n)) { setBozza(String(value)); return; }
    const ok = limita(Math.round(n));
    onChange(ok);
    setBozza(String(ok));
  };
  const btn = 'w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer transition active:scale-95';
  return (
    <div className={`rounded-2xl border p-4 space-y-2.5 ${modificato ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-semibold text-slate-200 leading-snug">{lang === 'zh' ? def.zh : def.it}</span>
        {modificato && (
          <button onClick={() => onChange(defaultValue)} title={lang === 'zh' ? '恢复默认' : `Ripristina (${defaultValue})`} className="text-[10px] font-bold text-indigo-300 hover:text-white shrink-0 cursor-pointer">
            ↺ {defaultValue}
          </button>
        )}
      </div>
      {def.h && lang !== 'zh' && <p className="text-[11px] text-slate-400 leading-snug">{def.h}</p>}
      {def.bool ? (
        <button onClick={() => onChange(value === 1 ? 0 : 1)} className={`w-full py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition ${value === 1 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {value === 1 ? (lang === 'zh' ? '开启' : 'Attivo') : (lang === 'zh' ? '关闭' : 'Disattivo')}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button aria-label="-" onClick={() => onChange(limita(value - def.step))} className={btn}>−</button>
            <div className="relative flex-1">
              <input type="text" inputMode="numeric" value={bozza} onChange={e => setBozza(e.target.value)} onBlur={e => conferma(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') conferma(bozza); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500" />
              {def.u && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 pointer-events-none">{def.u}</span>}
            </div>
            <button aria-label="+" onClick={() => onChange(limita(value + def.step))} className={btn}>+</button>
          </div>
          {def.u === '%' && <input type="range" min={def.min} max={def.max} step={def.step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />}
        </>
      )}
    </div>
  );
}
