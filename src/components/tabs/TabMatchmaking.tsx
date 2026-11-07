import React from 'react';
import { Grid } from 'lucide-react';
import { temaTappa } from '../../constants/dizionario';

export function TabMatchmaking({ scheduleMatchmaking, params, maxTappe, currentTappa, lang, t }: any) {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Grid className="w-5 h-5 text-indigo-400" /> {t.matriceBerger}</h2>
        <span className="text-xs text-slate-400">{t.partecipantiBerger(params.numSquadre, maxTappe)}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {scheduleMatchmaking.map((roundObj: any) => {
          const tema = temaTappa(roundObj.round, maxTappe);
          const corrente = currentTappa === roundObj.round;
          return (
            <div key={roundObj.round} className={`rounded-2xl p-4 border space-y-3 ${corrente ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
              <div>
                <div className="flex items-center gap-2 text-sm font-extrabold text-white"><span className="text-base">{tema.icon}</span>{t.tappaN(roundObj.round)}{corrente && <span className="text-[10px] text-amber-300 font-bold">• {t.correnteBadge}</span>}</div>
                <div className="text-[11px] text-indigo-300 font-semibold mt-0.5">{lang === 'zh' ? tema.zh : tema.it}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tema.d[lang]}</p>
              </div>
              <div className="space-y-1.5">
                {roundObj.matches.map((m: any) => (
                  <div key={m.postazione} className="text-[11px] p-2 rounded-xl flex items-center gap-2 border border-slate-800 bg-slate-900/80 text-slate-200">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 shrink-0">{lang === 'zh' ? '台' : 'Tav.'} {m.postazione}</span>
                    <span className="truncate font-semibold">{t.teamPrefix} {m.teamAId}</span>
                    <span className="text-slate-500 font-extrabold text-[10px]">VS</span>
                    <span className="truncate font-semibold">{t.teamPrefix} {m.teamBId}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
