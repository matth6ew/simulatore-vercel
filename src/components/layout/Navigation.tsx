import React from 'react';
import { Users, Grid, Award, TrendingUp, BarChart2, Settings, ChevronRight } from 'lucide-react';

export function Navigation({ activeTab, setActiveTab, displayedSquadre, currentTappa, viewedTappa, setViewedTappa, t }: any) {
  return (
    <div className="sticky top-[73px] z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 flex flex-wrap justify-between items-center gap-4 shadow-xl">
      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto w-full md:w-auto">
        <button 
          onClick={() => setActiveTab('simulatore')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'simulatore' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Users className="w-4 h-4" /> {t.tabellone(displayedSquadre.length)}
        </button>
        <button 
          onClick={() => setActiveTab('matchmaking')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'matchmaking' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Grid className="w-4 h-4" /> {t.berger}
        </button>
        <button 
          onClick={() => setActiveTab('classifica')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'classifica' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Award className="w-4 h-4" /> {t.classifiche}
        </button>
        <button 
          onClick={() => setActiveTab('grafici')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'grafici' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <TrendingUp className="w-4 h-4" /> {t.grafici}
        </button>
        <button 
          onClick={() => setActiveTab('analisi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'analisi' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <BarChart2 className="w-4 h-4" /> {t.analisi}
        </button>
        <button 
          onClick={() => setActiveTab('impostazioni')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'impostazioni' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Settings className="w-4 h-4" /> {t.impostazioni}
        </button>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 px-2 shrink-0">{t.storico}</span>
        {Array.from({ length: currentTappa + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setViewedTappa(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm shrink-0 cursor-pointer ${
              viewedTappa === idx ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {idx === 0 ? t.inizio : t.tappaN(idx)}
          </button>
        ))}
        {viewedTappa !== currentTappa && (
          <button
            onClick={() => setViewedTappa(currentTappa)}
            className="ml-auto text-xs font-bold text-amber-400 hover:underline px-2 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {t.corrente(currentTappa)} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
