import React from 'react';
import { Swords, RotateCcw, Play, FastForward } from 'lucide-react';

export function Header({ lang, setLang, t, params, maxTappe, currentTappa, initializeTeams, advanceTappa, runFullSimulation }: any) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
          <Swords className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {t.titoloApp(params.numSquadre, maxTappe)}
          </h1>
          <p className="text-xs text-slate-400 font-medium">{t.sottotitoloApp}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setLang('it')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${lang === 'it' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            🇮🇹 IT
          </button>
          <button
            onClick={() => setLang('zh')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${lang === 'zh' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            🇨🇳 中文
          </button>
        </div>

        <button 
          onClick={initializeTeams} 
          className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition shadow-sm hover:shadow active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> {t.reset}
        </button>
        
        <button 
          onClick={advanceTappa} 
          disabled={currentTappa >= maxTappe}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> {t.avanza(currentTappa, maxTappe)}
        </button>

        <button 
          onClick={runFullSimulation} 
          disabled={currentTappa >= maxTappe}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/25 transition active:scale-95 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5 fill-current" /> {t.simulaTutto}
        </button>
      </div>
    </header>
  );
}
