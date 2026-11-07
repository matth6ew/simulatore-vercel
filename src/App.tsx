import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { STORAGE_KEY, DIZIONARIO, PROFILI_ETICI } from './constants/dizionario';
import { DEFAULT_PARAMS } from './constants/configurazione';
import { caricaParams, getVal, firma, media, devStd, mescola } from './engine/helpers';
import {
  getDistribuzioneEsatta,
  getEticaEffettivaSquadra,
  getScheduleMatchmaking,
  creaSquadre,
  simulateSingleTappa
} from './engine/simulationEngine';

import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { TabSimulatore } from './components/tabs/TabSimulatore';
import { TabMatchmaking } from './components/tabs/TabMatchmaking';
import { TabClassifiche } from './components/tabs/TabClassifiche';
import { TabGrafici } from './components/tabs/TabGrafici';
import { TabAnalisi } from './components/tabs/TabAnalisi';
import { TabImpostazioni } from './components/tabs/TabImpostazioni';

export default function App() {
  const [lang, setLang] = useState<'it' | 'zh'>('it');
  const t = DIZIONARIO[lang];

  const [params, setParams] = useState(caricaParams);
  const [configCategory, setConfigCategory] = useState('partita');
  const [profiloAttivo, setProfiloAttivo] = useState('VIRTUOSA');
  const [confermaReset, setConfermaReset] = useState(false);
  const [paramsAvvio, setParamsAvvio] = useState('');
  const [riavvio, setRiavvio] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(params)); } catch (e) { console.error('Impossibile salvare i parametri', e); }
  }, [params]);

  const setParam = (path: string, raw: any) => setParams((prev: any) => {
    const v = Number(raw);
    if (Number.isNaN(v)) return prev;
    if (!path.includes('.')) return { ...prev, [path]: v };
    const [e, k] = path.split('.');
    return { ...prev, profili: { ...prev.profili, [e]: { ...prev.profili[e], [k]: v } } };
  });

  const ripristina = (paths: string[]) => paths.forEach(p => setParam(p, getVal(DEFAULT_PARAMS, p)));

  const handleResetToDefault = () => {
    setParams(JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
    setConfermaReset(false);
    setRiavvio(n => n + 1);
  };

  const configCambiata = paramsAvvio !== '' && paramsAvvio !== firma(params);

  const maxTappe = useMemo(() => {
    if (params.numSquadre === 12) return 6;
    if (params.numSquadre === 16) return 8;
    return 7;
  }, [params.numSquadre]);

  const [currentTappa, setCurrentTappa] = useState(0); 
  const [viewedTappa, setViewedTappa] = useState(0); 
  const [activeTab, setActiveTab] = useState('simulatore'); 
  const [squadre, setSquadre] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [ordinaPer, setOrdinaPer] = useState('id');
  const [filtroEtica, setFiltroEtica] = useState('TUTTE');
  const [vistaTabellone, setVistaTabellone] = useState('card');
  const [nPartite, setNPartite] = useState(100);
  const [mescolaSkill, setMescolaSkill] = useState(true);
  const [batch, setBatch] = useState<{ running: boolean; done: number; total: number; risultati: any }>({ running: false, done: 0, total: 0, risultati: null });
  const batchAnnulla = useRef(false);

  const handleSelectNumSquadre = (count: number) => {
    if (![12, 14, 16].includes(count)) return;
    if (count === params.numSquadre) return;
    setParams((p: any) => ({ ...p, numSquadre: count }));
    setRiavvio(n => n + 1);
  };

  const distribuzioneEticaLive = useMemo(() => {
    return getDistribuzioneEsatta(params.eticitaGlobalePerc, params.numSquadre);
  }, [params.eticitaGlobalePerc, params.numSquadre]);

  const scheduleMatchmaking = useMemo(() => {
    return getScheduleMatchmaking(params.numSquadre, maxTappe);
  }, [params.numSquadre, maxTappe]);

  const initializeTeams = useCallback(() => {
    const newSquadre = creaSquadre(params);

    setSquadre(newSquadre);
    setParamsAvvio(firma(params));
    setCurrentTappa(0);
    setViewedTappa(0);
    setHistory([{ tappa: 0, squadre: newSquadre.map(s => ({ ...s })) }]);
    setEventLogs([{ tappa: 0, testo: `Simulazione inizializzata!` }]);
  }, [params]);

  useEffect(() => {
    initializeTeams();
  }, [riavvio, initializeTeams]);

  const advanceTappa = () => {
    if (currentTappa >= maxTappe) return;
    const nextTappa = currentTappa + 1;
    const currentSquadreMap = new Map(squadre.map(s => [s.id, { ...s }]));
    
    const { updatedMap, logs } = simulateSingleTappa(nextTappa, currentSquadreMap, params, scheduleMatchmaking, maxTappe);
    const newSquadreArray = Array.from(updatedMap.values());

    setSquadre(newSquadreArray);
    setCurrentTappa(nextTappa);
    setViewedTappa(nextTappa);
    setHistory(prev => [...prev, { tappa: nextTappa, squadre: newSquadreArray.map(s => ({ ...s })) }]);
    setEventLogs(prev => [...prev, ...logs]);
  };

  const runFullSimulation = () => {
    if (currentTappa >= maxTappe) return;
    let tempTappa = currentTappa;
    let tempSquadreMap = new Map(squadre.map(s => [s.id, JSON.parse(JSON.stringify(s))]));
    let newHistoryEntries = [];
    let newLogsEntries = [];

    while (tempTappa < maxTappe) {
      tempTappa += 1;
      const { updatedMap, logs } = simulateSingleTappa(tempTappa, tempSquadreMap, params, scheduleMatchmaking, maxTappe);
      tempSquadreMap = updatedMap;
      const squadreSnapshot = Array.from(updatedMap.values()).map(s => JSON.parse(JSON.stringify(s)));
      newHistoryEntries.push({ tappa: tempTappa, squadre: squadreSnapshot });
      newLogsEntries.push(...logs);
    }

    const finalSquadreArray = Array.from(tempSquadreMap.values());
    setSquadre(finalSquadreArray);
    setCurrentTappa(maxTappe);
    setViewedTappa(maxTappe);
    setHistory(prev => [...prev, ...newHistoryEntries]);
    setEventLogs(prev => [...prev, ...newLogsEntries]);
  };

  const inTesta = (finali: any[], campoPunti: string) => {
    const ord = [...finali].sort((a, b) => b[campoPunti] - a[campoPunti] || b.monete - a.monete);
    return ord.filter(x => x[campoPunti] === ord[0][campoPunti] && x.monete === ord[0].monete);
  };

  const eseguiBatch = () => {
    if (batch.running) return;
    const totale = nPartite;
    const chiave = JSON.stringify(params) + '|' + mescolaSkill;
    const perProfilo: any = {};
    PROFILI_ETICI.forEach(e => { perProfilo[e] = { n: 0, monete: [], successo: [], misericordia: [], primoApp: 0, primoReale: 0 }; });
    let divergenze = 0;
    let fatte = 0;
    batchAnnulla.current = false;
    setBatch({ running: true, done: 0, total: totale, risultati: null });

    const unaPartita = () => {
      const iniziali = creaSquadre(params);
      if (mescolaSkill) {
        const skills = mescola(iniziali.map(x => x.skill));
        const etiche = mescola(iniziali.map(x => x.etica));
        iniziali.forEach((x, i) => { x.skill = skills[i]; x.etica = etiche[i]; x.eticaFissa = etiche[i]; });
      }
      let mappa = new Map(iniziali.map(x => [x.id, x]));
      for (let tp = 1; tp <= maxTappe; tp++) mappa = simulateSingleTappa(tp, mappa, params, scheduleMatchmaking, maxTappe).updatedMap;
      const finali = Array.from(mappa.values());
      const topApp = inTesta(finali, 'puntiSuccesso');
      const topReale = inTesta(finali, 'puntiMisericordia');
      const stessaSquadra = topApp.filter(x => topReale.some(y => y.id === x.id)).length / (topApp.length * topReale.length);
      divergenze += 1 - stessaSquadra;
      topApp.forEach(x => { perProfilo[x.etica].primoApp += 1 / topApp.length; });
      topReale.forEach(x => { perProfilo[x.etica].primoReale += 1 / topReale.length; });
      PROFILI_ETICI.forEach(e => {
        const g = finali.filter(x => x.etica === e);
        perProfilo[e].n = g.length;
        if (g.length === 0) return;
        perProfilo[e].monete.push(media(g.map(x => x.monete)));
        perProfilo[e].successo.push(media(g.map(x => x.puntiSuccesso)));
        perProfilo[e].misericordia.push(media(g.map(x => x.puntiMisericordia)));
      });
    };

    const passo = () => {
      if (batchAnnulla.current) { setBatch(b => ({ ...b, running: false })); return; }
      const limite = Math.min(totale, fatte + 10);
      while (fatte < limite) { unaPartita(); fatte++; }
      if (fatte < totale) { setBatch(b => ({ ...b, done: fatte })); setTimeout(passo, 0); return; }
      const stat = (arr: number[]) => (arr.length ? { m: media(arr), sd: devStd(arr) } : null);
      const risultati = {
        chiave,
        n: totale,
        divergenzaPerc: Math.round((divergenze / totale) * 100),
        profili: PROFILI_ETICI.map(e => {
          const q = perProfilo[e];
          return { etica: e, n: q.n, monete: stat(q.monete), successo: stat(q.successo), misericordia: stat(q.misericordia), primoApp: Math.round((q.primoApp / totale) * 100), primoReale: Math.round((q.primoReale / totale) * 100) };
        })
      };
      setBatch({ running: false, done: totale, total: totale, risultati });
    };
    setTimeout(passo, 0);
  };

  const displayedSquadre = useMemo(() => {
    const snapshot = history.find(h => h.tappa === viewedTappa);
    const base = snapshot ? snapshot.squadre : squadre;
    const prec = history.find(h => h.tappa === viewedTappa - 1);
    const precMap = prec ? new Map(prec.squadre.map((x: any) => [x.id, x])) : null;
    const conDelta = base.map((sq: any) => {
      const p: any = precMap ? precMap.get(sq.id) : null;
      return { ...sq, delta: p ? { monete: sq.monete - p.monete, successo: sq.puntiSuccesso - p.puntiSuccesso, misericordia: sq.puntiMisericordia - p.puntiMisericordia } : null };
    });
    if (viewedTappa !== currentTappa) return conDelta;
    const prevista = (sq: any) => getEticaEffettivaSquadra(sq.id - 1, base.length, params.eticitaGlobalePerc);
    return conDelta.map((sq: any) => currentTappa === 0
      ? { ...sq, etica: prevista(sq), eticaProssima: null }
      : { ...sq, eticaProssima: currentTappa < maxTappe ? prevista(sq) : null });
  }, [history, viewedTappa, currentTappa, maxTappe, squadre, params.eticitaGlobalePerc]);

  const classificaApparente = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.puntiSuccesso - a.puntiSuccesso || b.monete - a.monete);
  }, [displayedSquadre]);

  const classificaReale = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.puntiMisericordia - a.puntiMisericordia || b.monete - a.monete);
  }, [displayedSquadre]);

  const rangoApp = useMemo(() => new Map(classificaApparente.map((x, i) => [x.id, i + 1])), [classificaApparente]);
  const rangoReale = useMemo(() => new Map(classificaReale.map((x, i) => [x.id, i + 1])), [classificaReale]);

  const squadreVisibili = useMemo(() => {
    const l = filtroEtica === 'TUTTE' ? [...displayedSquadre] : displayedSquadre.filter(x => x.etica === filtroEtica);
    const cmp: any = {
      id: (a: any, b: any) => a.id - b.id,
      successo: (a: any, b: any) => b.puntiSuccesso - a.puntiSuccesso || b.monete - a.monete,
      misericordia: (a: any, b: any) => b.puntiMisericordia - a.puntiMisericordia || b.monete - a.monete,
      monete: (a: any, b: any) => b.monete - a.monete
    };
    return l.sort(cmp[ordinaPer]);
  }, [displayedSquadre, filtroEtica, ordinaPer]);

  const riepilogoTappa = useMemo(() => {
    if (viewedTappa === 0) return null;
    const r: any = { tentazioni: 0, donazioni: 0, rifiuti: 0, chiesa: 0, bancarotte: 0, fede: 0 };
    displayedSquadre.forEach((x: any) => {
      const st = x.storiaTappe.find((e: any) => e.tappa === viewedTappa);
      if (!st) return;
      st.logs.forEach((l: any) => {
        switch (l && l.k) {
          case 'tentazioneAcquistata': r.tentazioni++; break;
          case 'aiutoDato': case 'solidaleVinta': r.donazioni++; break;
          case 'aiutoNegato': r.rifiuti++; break;
          case 'soccorsoChiesa': r.chiesa++; break;
          case 'crisi3Bancarotta': case 'crisiBancarotta': case 'ingressoNonPagabile': r.bancarotte++; break;
          case 'sceltoFede': r.fede++; break;
          default: break;
        }
      });
    });
    return r;
  }, [displayedSquadre, viewedTappa]);

  const finito = currentTappa === maxTappe && viewedTappa === maxTappe;
  const riepilogoFinale = useMemo(() => {
    if (!finito || classificaApparente.length === 0) return null;
    const primoApp = classificaApparente[0];
    const primoReale = classificaReale[0];
    const profili = PROFILI_ETICI.map(e => {
      const g = displayedSquadre.filter(x => x.etica === e);
      const avg = (fn: any) => (g.length ? g.reduce((a: number, x: any) => a + fn(x), 0) / g.length : null);
      return { etica: e, n: g.length, monete: avg((x: any) => x.monete), successo: avg((x: any) => x.puntiSuccesso), misericordia: avg((x: any) => x.puntiMisericordia) };
    });
    return { primoApp, primoReale, rangoRealeDelPrimoApp: rangoReale.get(primoApp.id), profili };
  }, [finito, classificaApparente, classificaReale, displayedSquadre, rangoReale, maxTappe, viewedTappa, currentTappa]);

  const chartData = useMemo(() => {
    return history.map(h => {
      const item: any = { tappa: lang === 'zh' ? `阶段 ${h.tappa}` : `Tappa ${h.tappa}` };
      PROFILI_ETICI.forEach(etica => {
        const sqs = h.squadre.filter((s: any) => s.etica === etica);
        if (sqs.length > 0) {
          item[`${etica}_monete`] = Math.round(sqs.reduce((a: number, c: any) => a + c.monete, 0) / sqs.length);
          item[`${etica}_successo`] = Number((sqs.reduce((a: number, c: any) => a + c.puntiSuccesso, 0) / sqs.length).toFixed(1));
          item[`${etica}_misericordia`] = Number((sqs.reduce((a: number, c: any) => a + c.puntiMisericordia, 0) / sqs.length).toFixed(1));
        }
      });
      return item;
    });
  }, [history, lang]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header 
        lang={lang} 
        setLang={setLang} 
        t={t} 
        params={params} 
        maxTappe={maxTappe} 
        currentTappa={currentTappa} 
        initializeTeams={initializeTeams} 
        advanceTappa={advanceTappa} 
        runFullSimulation={runFullSimulation} 
      />

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        displayedSquadre={displayedSquadre} 
        currentTappa={currentTappa} 
        viewedTappa={viewedTappa} 
        setViewedTappa={setViewedTappa} 
        t={t} 
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'simulatore' && (
          <TabSimulatore 
            params={params}
            setParams={setParams}
            currentTappa={currentTappa}
            maxTappe={maxTappe}
            distribuzioneEticaLive={distribuzioneEticaLive}
            riepilogoFinale={riepilogoFinale}
            riepilogoTappa={riepilogoTappa}
            viewedTappa={viewedTappa}
            ordinaPer={ordinaPer}
            setOrdinaPer={setOrdinaPer}
            filtroEtica={filtroEtica}
            setFiltroEtica={setFiltroEtica}
            vistaTabellone={vistaTabellone}
            setVistaTabellone={setVistaTabellone}
            squadreVisibili={squadreVisibili}
            setActiveTab={setActiveTab}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === 'matchmaking' && (
          <TabMatchmaking 
            scheduleMatchmaking={scheduleMatchmaking}
            params={params}
            maxTappe={maxTappe}
            currentTappa={currentTappa}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === 'classifica' && (
          <TabClassifiche 
            riepilogoFinale={riepilogoFinale}
            classificaApparente={classificaApparente}
            classificaReale={classificaReale}
            rangoApp={rangoApp}
            rangoReale={rangoReale}
            lang={lang}
            t={t}
          />
        )}

        {activeTab === 'grafici' && (
          <TabGrafici 
            chartData={chartData}
            t={t}
          />
        )}

        {activeTab === 'analisi' && (
          <TabAnalisi 
            params={params}
            mescolaSkill={mescolaSkill}
            setMescolaSkill={setMescolaSkill}
            nPartite={nPartite}
            setNPartite={setNPartite}
            batch={batch}
            batchAnnulla={batchAnnulla}
            eseguiBatch={eseguiBatch}
            t={t}
          />
        )}

        {activeTab === 'impostazioni' && (
          <TabImpostazioni 
            params={params}
            setParam={setParam}
            ripristina={ripristina}
            handleResetToDefault={handleResetToDefault}
            initializeTeams={initializeTeams}
            handleSelectNumSquadre={handleSelectNumSquadre}
            configCategory={configCategory}
            setConfigCategory={setConfigCategory}
            profiloAttivo={profiloAttivo}
            setProfiloAttivo={setProfiloAttivo}
            confermaReset={confermaReset}
            setConfermaReset={setConfermaReset}
            configCambiata={configCambiata}
            lang={lang}
            t={t}
          />
        )}
      </main>
    </div>
  );
}
