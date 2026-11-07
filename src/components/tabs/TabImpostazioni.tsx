import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CONFIG_SEZIONI, GRUPPI_PERSONAGGIO, PROFILI_DEFAULT, PROFILI_INFO } from '../../constants/configurazione';
import { PROFILI_ETICI } from '../../constants/dizionario';
import { DEFAULT_PARAMS } from '../../constants/configurazione';
import { getVal } from '../../engine/helpers';
import { ConfigField } from '../common/ConfigField';

export function TabImpostazioni({
  params,
  setParam,
  ripristina,
  handleResetToDefault,
  initializeTeams,
  handleSelectNumSquadre,
  configCategory,
  setConfigCategory,
  profiloAttivo,
  setProfiloAttivo,
  confermaReset,
  setConfermaReset,
  configCambiata,
  lang,
  t
}: any) {
  const tx = (it: string, zh: string) => (lang === 'zh' ? zh : it);
  const sez = CONFIG_SEZIONI.find(x => x.id === configCategory) || CONFIG_SEZIONI[0];
  const pathsProfilo = GRUPPI_PERSONAGGIO.flatMap(g => g.campi.map(c => `${profiloAttivo}.${c.k}`));
  const pathsSezione = sez.id === 'personaggi' ? pathsProfilo : sez.campi.map(c => c.k);
  const campo = (def: any, path: string) => (
    <ConfigField key={path} def={def} lang={lang} value={getVal(params, path)} defaultValue={getVal(DEFAULT_PARAMS, path)} onChange={(v: any) => setParam(path, v)} />
  );
  const nModificati = pathsSezione.filter(p => getVal(params, p) !== getVal(DEFAULT_PARAMS, p)).length;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[210px_1fr] gap-6">
      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible md:sticky md:top-40 self-start">
        {CONFIG_SEZIONI.map(c => {
          const Icon = c.icon;
          const paths = c.id === 'personaggi' ? PROFILI_ETICI.flatMap(e => GRUPPI_PERSONAGGIO.flatMap(g => g.campi.map(x => `${e}.${x.k}`))) : c.campi.map(x => x.k);
          const n = paths.filter(p => getVal(params, p) !== getVal(DEFAULT_PARAMS, p)).length;
          return (
            <button key={c.id} onClick={() => setConfigCategory(c.id)} className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-left transition shrink-0 cursor-pointer ${configCategory === c.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{tx(c.it, c.zh)}</span>
              {n > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold">{n}</span>}
            </button>
          );
        })}
      </nav>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{tx(sez.it, sez.zh)}</h2>
            <p className="text-xs text-slate-400 mt-1">{tx('Le modifiche si salvano da sole. I valori cambiati rispetto al default sono evidenziati.', '修改会自动保存。与默认值不同的项会高亮显示。')}</p>
          </div>
          <div className="flex gap-2">
            <button disabled={nModificati === 0} onClick={() => ripristina(pathsSezione)} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> {tx('Ripristina sezione', '恢复本节默认')}
            </button>
            <button onClick={() => (confermaReset ? handleResetToDefault() : setConfermaReset(true))} onBlur={() => setConfermaReset(false)} className={`px-3.5 py-2 text-xs font-bold rounded-xl border cursor-pointer ${confermaReset ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {confermaReset ? tx('Conferma: ripristina tutto', '确认：全部恢复') : t.ripristinaDefault}
            </button>
          </div>
        </div>

        {configCambiata && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
            <span className="text-xs text-amber-200">{tx("Hai cambiato le regole dopo l'avvio: valgono dalla prossima tappa, ma le tappe già giocate usavano le vecchie.", '开局后规则已更改：从下一阶段起生效，已进行的阶段仍使用旧规则。')}</span>
            <button onClick={initializeTeams} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-2 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> {tx('Riavvia con le nuove regole', '以新规则重新开始')}</button>
          </div>
        )}

        {sez.id === 'partita' && (
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
            <h3 className="text-sm font-bold text-white">{t.numSquadreTappeTitolo}</h3>
            <div className="grid grid-cols-3 gap-3">
              {[12, 14, 16].map(count => (
                <button key={count} onClick={() => handleSelectNumSquadre(count)} className={`p-3 rounded-2xl border text-center cursor-pointer transition ${params.numSquadre === count ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                  <span className="block text-base font-black text-white">{t.squadreCountLabel(count)}</span>
                  <span className="block text-xs text-indigo-400 font-bold">{t.tappeCountLabel(count === 12 ? 6 : count === 14 ? 7 : 8)}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">{tx('Cambiare il numero di squadre riavvia la partita.', '更改队伍数量会重新开始对局。')}</p>
          </div>
        )}

        {sez.id !== 'personaggi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{sez.campi.map(c => campo(c, c.k))}</div>
        )}

        {sez.id === 'personaggi' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {PROFILI_ETICI.map(e => (
                <button key={e} onClick={() => setProfiloAttivo(e)} className={`px-3 py-3 rounded-2xl border text-xs font-extrabold cursor-pointer transition ${profiloAttivo === e ? (PROFILI_INFO as any)[e].stile + ' ring-1 ring-white/10' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                  {tx((PROFILI_INFO as any)[e].it, (PROFILI_INFO as any)[e].zh)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3">{(PROFILI_INFO as any)[profiloAttivo].d[lang]} <span className="text-slate-500">{tx('Il clima globale (−100% … +100%) è quello impostato nel Tabellone.', '全局气候（−100% … +100%）在面板中设置。')}</span></p>
            {GRUPPI_PERSONAGGIO.map(g => (
              <section key={g.id} className="space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">{tx(g.it, g.zh)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{g.campi.map(c => campo(c, `${profiloAttivo}.${c.k}`))}</div>
              </section>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <span className="text-xs text-slate-500">{tx('Vuoi ripartire da zero con queste regole?', '想用这些规则从头开始吗？')}</span>
          <button onClick={initializeTeams} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> {tx('Riavvia la simulazione', '重新开始模拟')}
          </button>
        </div>
      </div>
    </div>
  );
}
