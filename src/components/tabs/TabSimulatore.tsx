import React from 'react';
import { Compass, Scale, Flame, ShieldCheck, Users, ChevronRight, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { ETICA_BADGE, PROFILI_ETICI, temaTappa } from '../../constants/dizionario';
import { nomeSquadra, testoLog } from '../../engine/helpers';
import { Delta } from '../common/Delta';

export function TabSimulatore({
  params,
  setParams,
  currentTappa,
  maxTappe,
  distribuzioneEticaLive,
  riepilogoFinale,
  riepilogoTappa,
  viewedTappa,
  ordinaPer,
  setOrdinaPer,
  filtroEtica,
  setFiltroEtica,
  vistaTabellone,
  setVistaTabellone,
  squadreVisibili,
  setActiveTab,
  lang,
  t
}: any) {
  return (
    <div className="space-y-6">
      {/* REGIA CLIMA ETICO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Compass className="w-6 h-6 text-indigo-400 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">{t.regiaEtica}</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{t.regiaDesc}</p>
          </div>

          <div className={`px-4 py-2 rounded-2xl border text-sm font-extrabold flex items-center gap-2 shadow-inner ${
            params.eticitaGlobalePerc > 20 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            params.eticitaGlobalePerc < -20 ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
            'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            <Scale className="w-4 h-4" />
            <span>{params.eticitaGlobalePerc > 0 ? t.virtuosoClima(params.eticitaGlobalePerc) : params.eticitaGlobalePerc < 0 ? t.egoistaClima(params.eticitaGlobalePerc) : t.neutraleClima}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative pt-2">
            <input 
              type="range" 
              min="-100" 
              max="100" 
              step="5"
              value={params.eticitaGlobalePerc}
              onChange={(e) => setParams({...params, eticitaGlobalePerc: Number(e.target.value)})}
              className="w-full h-4 bg-slate-950/80 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-slate-800 shadow-inner focus:outline-none transition-all"
            />
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mt-2 px-1">
              <span className="text-rose-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> -100%</span>
              <span className="text-amber-400">0%</span>
              <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> +100%</span>
            </div>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          <p className="text-[11px] text-amber-300/90">{currentTappa >= maxTappe ? t.climaNotaFine : t.climaNotaProssima(currentTappa + 1)}</p>
          <p className="text-[11px] font-bold text-slate-400">{t.prossimaLabel}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider block">{t.virtuoseLabel}</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-emerald-300">{distribuzioneEticaLive.VIRTUOSA}</span>
                <span className="text-xs text-slate-400 font-medium">{t.squadreWord}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Users className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider block">{t.opportunisteLabel}</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-amber-300">{distribuzioneEticaLive.OPPORTUNISTA}</span>
                <span className="text-xs text-slate-400 font-medium">{t.squadreWord}</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><Flame className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-rose-400 uppercase font-extrabold tracking-wider block">{t.egoisteLabel}</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-rose-300">{distribuzioneEticaLive.EGOISTA}</span>
                <span className="text-xs text-slate-400 font-medium">{t.squadreWord}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABELLONE SQUADRE */}
      <div className="space-y-5">
        {riepilogoFinale && (
          <button onClick={() => setActiveTab('classifica')} className="w-full text-left bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/40 rounded-2xl px-4 py-3 text-xs text-amber-200 cursor-pointer flex items-center justify-between gap-3">
            <span><b className="text-amber-100">{t.simulazioneConclusa}</b> {t.vediRisultato}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        )}

        {riepilogoTappa && (() => {
          const tema = temaTappa(viewedTappa, maxTappe);
          const voci = Object.entries(riepilogoTappa).filter(([, n]) => Number(n) > 0);
          return (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              <span className="font-bold text-white">{tema.icon} {t.tappaN(viewedTappa)} · {lang === 'zh' ? tema.zh : tema.it}</span>
              {voci.map(([k, n]) => <span key={k} className="text-slate-300"><b className="text-amber-300">{n}</b> {(t.riepilogoLabels as any)[k]}</span>)}
              {voci.length === 0 && <span className="text-slate-500">{t.riepilogoVuoto}</span>}
            </div>
          );
        })()}

        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label={t.ordinaPer} className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 px-2 shrink-0">{t.ordinaPer}</span>
            {[['id', t.ordId], ['successo', t.successo], ['misericordia', t.misericordia], ['monete', t.monete]].map(([k, label]) => (
              <button key={k} aria-pressed={ordinaPer === k} onClick={() => setOrdinaPer(k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${ordinaPer === k ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{label}</button>
            ))}
          </div>
          <div role="group" aria-label={t.eticaCol} className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            {['TUTTE', ...PROFILI_ETICI].map(e => (
              <button key={e} aria-pressed={filtroEtica === e} onClick={() => setFiltroEtica(e)} className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${filtroEtica === e ? (e === 'TUTTE' ? 'bg-indigo-600 text-white' : `${(ETICA_BADGE as any)[e]} border`) : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{e === 'TUTTE' ? t.filtroTutte : (t.eticaNames as any)[e]}</button>
            ))}
          </div>
          <div role="group" className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 ml-auto">
            <button aria-pressed={vistaTabellone === 'card'} onClick={() => setVistaTabellone('card')} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${vistaTabellone === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><LayoutGrid className="w-3.5 h-3.5" /> {t.vistaCard}</button>
            <button aria-pressed={vistaTabellone === 'tabella'} onClick={() => setVistaTabellone('tabella')} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${vistaTabellone === 'tabella' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><TableIcon className="w-3.5 h-3.5" /> {t.vistaTabella}</button>
          </div>
        </div>

        {vistaTabellone === 'tabella' ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-x-auto shadow-2xl">
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="px-4 py-3 font-bold">{t.squadraCol}</th>
                  <th className="px-3 py-3 font-bold">{t.eticaCol}</th>
                  <th className="px-3 py-3 font-bold">{t.skillLabel}</th>
                  <th className="px-3 py-3 font-bold text-right">{t.monete}</th>
                  <th className="px-3 py-3 font-bold text-right">{t.successo}</th>
                  <th className="px-3 py-3 font-bold text-right">{t.misericordia}</th>
                  <th className="px-4 py-3 font-bold">{t.avversarioCol}</th>
                </tr>
              </thead>
              <tbody>
                {squadreVisibili.map((s: any) => {
                  const ultimo = s.storiaTappe.find((e: any) => e.tappa === viewedTappa);
                  return (
                    <tr key={s.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-semibold text-slate-100 whitespace-nowrap">{nomeSquadra(lang, s)} {s.haSceltoDiCredere && <span title={t.credente}>🙏</span>}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${(ETICA_BADGE as any)[s.etica]}`}>{(t.eticaNames as any)[s.etica]}</span>
                        {s.eticaProssima && s.eticaProssima !== s.etica && <span title={t.prossimaTitle} className={`ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-dashed ${(ETICA_BADGE as any)[s.eticaProssima]}`}>→ {(t.eticaNames as any)[s.eticaProssima]}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-slate-300">{(t.skillNames as any)[s.skill]}</td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-amber-400">{s.monete}<Delta v={s.delta?.monete} /></td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-indigo-400">{s.puntiSuccesso}<Delta v={s.delta?.successo} /></td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-emerald-400">{s.puntiMisericordia}<Delta v={s.delta?.misericordia} /></td>
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{ultimo ? nomeSquadra(lang, ultimo.vs) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {squadreVisibili.map((s: any) => (
              <div key={s.id} className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">{nomeSquadra(lang, s)}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${(ETICA_BADGE as any)[s.etica]}`}>{(t.eticaNames as any)[s.etica]}</span>
                        {s.eticaProssima && s.eticaProssima !== s.etica && (
                          <span title={t.prossimaTitle} className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-dashed uppercase tracking-wider ${(ETICA_BADGE as any)[s.eticaProssima]}`}>→ {(t.eticaNames as any)[s.eticaProssima]}</span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-slate-300">
                          {t.skillLabel}: {(t.skillNames as any)[s.skill]}
                        </span>
                      </div>
                    </div>
                    {s.haSceltoDiCredere && (
                      <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-base shadow-sm" title={t.credente}>🙏</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center bg-slate-950/50 rounded-2xl px-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.monete}</span>
                      <span className="text-base font-extrabold text-amber-400">{s.monete}<Delta v={s.delta?.monete} /></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.successo}</span>
                      <span className="text-base font-extrabold text-indigo-400">{s.puntiSuccesso}<Delta v={s.delta?.successo} /></span>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">{t.misericordia}</span>
                      <span className="text-base font-extrabold text-emerald-400">{s.puntiMisericordia}<Delta v={s.delta?.misericordia} /></span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-300">
                    {s.storiaTappe.length > 0 ? (
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner">
                        <span className="text-xs font-bold text-indigo-300 block pb-1.5 border-b border-slate-800 flex items-center justify-between">
                          <span>{t.tappaN(s.storiaTappe.length)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">vs {nomeSquadra(lang, s.storiaTappe[s.storiaTappe.length - 1].vs)}</span>
                        </span>
                        {s.storiaTappe[s.storiaTappe.length - 1].logs.map((log: any, idx: number) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span className="leading-tight">{testoLog(lang, log)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-slate-500 text-xs block py-2 text-center bg-slate-950/30 rounded-2xl">{t.attesaTurno}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
