import React from 'react';
import { BarChart2, Play } from 'lucide-react';
import { ETICA_BADGE } from '../../constants/dizionario';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function TabAnalisi({
  params,
  mescolaSkill,
  setMescolaSkill,
  nPartite,
  setNPartite,
  batch,
  batchAnnulla,
  eseguiBatch,
  t
}: any) {
  const r = batch.risultati;
  const obsoleta = r && r.chiave !== JSON.stringify(params) + '|' + mescolaSkill;
  const pm = (x: any) => (x ? `${x.m.toFixed(1)} ± ${x.sd.toFixed(1)}` : '—');
  const datiGrafico = r ? r.profili.filter((x: any) => x.n > 0).map((x: any) => ({ nome: (t.eticaNames as any)[x.etica], app: x.primoApp, reale: x.primoReale })) : [];
  const climaTxt = `${params.eticitaGlobalePerc > 0 ? '+' : ''}${params.eticitaGlobalePerc}%`;
  const perc = batch.total ? Math.round((batch.done / batch.total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-400" /> {t.analisiTitolo}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{t.analisiDesc(climaTxt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div role="group" aria-label={t.analisiNumero} className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 px-2">{t.analisiNumero}</span>
            {[50, 100, 500].map(n => (
              <button key={n} aria-pressed={nPartite === n} disabled={batch.running} onClick={() => setNPartite(n)} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition disabled:opacity-50 ${nPartite === n ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{n}</button>
            ))}
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer max-w-sm">
            <input type="checkbox" checked={mescolaSkill} disabled={batch.running} onChange={e => setMescolaSkill(e.target.checked)} className="mt-0.5 accent-indigo-500" />
            <span><b className="text-slate-100">{t.analisiMescola}</b><span className="block text-[11px] text-slate-500 leading-snug">{t.analisiMescolaHint}</span></span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {batch.running ? (
            <>
              <div className="flex-1 min-w-[180px] space-y-1">
                <div role="progressbar" aria-valuemin={0} aria-valuemax={batch.total} aria-valuenow={batch.done} className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${perc}%` }} />
                </div>
                <span className="text-[11px] text-slate-400">{t.analisiProgresso(batch.done, batch.total)}</span>
              </div>
              <button onClick={() => { batchAnnulla.current = true; }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer">{t.analisiAnnulla}</button>
            </>
          ) : (
            <button onClick={eseguiBatch} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer">
              <Play className="w-3.5 h-3.5 fill-current" /> {t.analisiAvvia}
            </button>
          )}
        </div>
      </section>

      {r && (
        <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {obsoleta && <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-xs text-amber-200">{t.analisiObsoleta}</div>}
          <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">{t.analisiDivergenza(r.divergenzaPerc, r.n)}</p>

          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2">{t.analisiTabellaTitolo}</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs tabular-nums">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="px-4 py-3 font-bold">{t.eticaCol}</th>
                    <th className="px-3 py-3 font-bold text-right">{t.analisiColSquadre}</th>
                    <th className="px-3 py-3 font-bold text-right">{t.monete}</th>
                    <th className="px-3 py-3 font-bold text-right">{t.successo}</th>
                    <th className="px-3 py-3 font-bold text-right">{t.misericordia}</th>
                    <th className="px-3 py-3 font-bold text-right">{t.analisiColApp}</th>
                    <th className="px-4 py-3 font-bold text-right">{t.analisiColReale}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.profili.map((x: any) => (
                    <tr key={x.etica} className="border-b border-slate-800/60">
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${(ETICA_BADGE as any)[x.etica]}`}>{(t.eticaNames as any)[x.etica]}</span></td>
                      <td className="px-3 py-2.5 text-right text-slate-300">{x.n}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-amber-400">{pm(x.monete)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-indigo-400">{pm(x.successo)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-400">{pm(x.misericordia)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-200">{x.n ? `${x.primoApp}%` : '—'}</td>
                      <td className="px-4 py-2.5 text-right text-slate-200">{x.n ? `${x.primoReale}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-2">{t.analisiGrafico}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datiGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="nome" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '16px' }} />
                  <Legend />
                  <Bar dataKey="app" name={t.analisiGraficoApp} fill="#6366F1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="reale" name={t.analisiGraficoReale} fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">{t.analisiNotaSD}</p>
        </section>
      )}
    </div>
  );
}
