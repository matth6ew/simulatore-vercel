import React from 'react';
import { Award, Heart } from 'lucide-react';
import { ETICA_BADGE } from '../../constants/dizionario';
import { nomeSquadra } from '../../engine/helpers';
import { Delta } from '../common/Delta';

export function TabClassifiche({
  riepilogoFinale,
  classificaApparente,
  classificaReale,
  rangoApp,
  rangoReale,
  lang,
  t
}: any) {
  const renderFinale = () => {
    if (!riepilogoFinale) return null;
    const { primoApp, primoReale, rangoRealeDelPrimoApp, profili } = riepilogoFinale;
    const coincidono = primoApp.id === primoReale.id;
    const fmt = (v: number | null) => (v === null ? '—' : v.toFixed(1));
    return (
      <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        <h2 className="text-xl font-extrabold text-white">{t.titoloFinale}</h2>
        <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
          {coincidono
            ? t.finaleCoincidono(nomeSquadra(lang, primoApp))
            : t.finaleDivergono(nomeSquadra(lang, primoApp), rangoRealeDelPrimoApp, nomeSquadra(lang, primoReale))}
        </p>
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-2">{t.profiliMedie}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {profili.map((pr: any) => (
              <div key={pr.etica} className={`rounded-2xl border p-4 ${(ETICA_BADGE as any)[pr.etica]}`}>
                <div className="text-xs font-extrabold">{(t.eticaNames as any)[pr.etica]} · {pr.n} {t.squadreWord}</div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.monete}</span><span className="text-base font-extrabold text-white">{fmt(pr.monete)}</span></div>
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.successo}</span><span className="text-base font-extrabold text-white">{fmt(pr.successo)}</span></div>
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.misericordia}</span><span className="text-base font-extrabold text-white">{fmt(pr.misericordia)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {renderFinale()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
          <h3 className="font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> {t.classificaApparente}
          </h3>
          <div className="space-y-2.5">
            {classificaApparente.map((s: any, idx: number) => (
              <div key={s.id} className="flex justify-between items-center py-3 px-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs shadow-sm">
                <span className="font-extrabold text-slate-400 w-6 text-sm">{idx + 1}.</span>
                <span className="font-semibold text-slate-200 flex-1 truncate">{nomeSquadra(lang, s)}</span>
                <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mr-2 ${(ETICA_BADGE as any)[s.etica]}`}>{(t.eticaNames as any)[s.etica]}</span>
                <span className="text-[10px] text-slate-500 mr-2 shrink-0">{t.rangoReale(rangoReale.get(s.id))}</span>
                <span className="text-indigo-400 font-bold px-3 py-1 bg-indigo-500/10 rounded-xl mr-2">{s.puntiSuccesso} {t.successo}</span>
                <span className="text-amber-400 font-extrabold w-20 text-right">{s.monete} 💰</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
          <h3 className="font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400 fill-current" /> {t.classificaReale}
          </h3>
          <div className="space-y-2.5">
            {classificaReale.map((s: any, idx: number) => (
              <div key={s.id} className={`flex justify-between items-center py-3 px-4 rounded-2xl text-xs border shadow-sm ${idx === 0 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/20' : 'bg-slate-950/70 border-slate-800 text-slate-200'}`}>
                <span className="font-extrabold text-emerald-400 w-6 text-sm">{idx + 1}.</span>
                <span className="font-semibold flex-1 truncate">{nomeSquadra(lang, s)}</span>
                <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mr-2 ${(ETICA_BADGE as any)[s.etica]}`}>{(t.eticaNames as any)[s.etica]}</span>
                <span className="text-[10px] text-slate-500 mr-1 shrink-0">{t.rangoApp(rangoApp.get(s.id))}</span>
                <Delta v={rangoApp.get(s.id) - (idx + 1)} title={t.spostamentoTitle} />
                <span className="ml-2 text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-xl mr-2">{s.puntiMisericordia} {t.misericordia}</span>
                <span className="text-amber-400 font-extrabold w-20 text-right">{s.monete} 💰</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
