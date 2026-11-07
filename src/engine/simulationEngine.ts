import { TAPPA_FEDE, TAPPA_CRISI_INTERMEDIA, LOG } from '../constants/dizionario';
import { clamp, rnd, generateDefaultArchetipi } from './helpers';

export const getDistribuzioneEsatta = (globalPerc: number, totalTeams: number) => {
  const pool = totalTeams;
  let vFloat = 0, oFloat = 0, eFloat = 0;

  if (globalPerc >= 0) {
    if (globalPerc <= 30) {
      const tVal = globalPerc / 30;
      eFloat = (pool * 0.3) * (1 - tVal);
      oFloat = (pool * 0.4) + (pool * 0.1 * tVal);
      vFloat = pool - eFloat - oFloat;
    } else if (globalPerc <= 95) {
      const tVal = (globalPerc - 30) / (95 - 30);
      const startOpp = pool * 0.5;
      oFloat = startOpp + tVal * (1 - startOpp);
      eFloat = 0;
      vFloat = pool - oFloat;
    } else {
      const tVal = (globalPerc - 95) / 5;
      oFloat = 1 - tVal;
      eFloat = 0;
      vFloat = pool - oFloat;
    }
  } else {
    const absPerc = Math.abs(globalPerc);
    if (absPerc <= 30) {
      const tVal = absPerc / 30;
      vFloat = (pool * 0.3) * (1 - tVal);
      oFloat = (pool * 0.4) + (pool * 0.1 * tVal);
      eFloat = pool - vFloat - oFloat;
    } else if (absPerc <= 95) {
      const tVal = (absPerc - 30) / (95 - 30);
      const startOpp = pool * 0.5;
      oFloat = startOpp + tVal * (1 - startOpp);
      vFloat = 0;
      eFloat = pool - oFloat;
    } else {
      const tVal = (absPerc - 95) / 5;
      oFloat = 1 - tVal;
      vFloat = 0;
      eFloat = pool - oFloat;
    }
  }

  let v = Math.round(vFloat);
  let o = Math.round(oFloat);
  let e = Math.round(eFloat);

  const diff = pool - (v + o + e);
  if (diff !== 0) {
    if (globalPerc >= 0) v += diff;
    else e += diff;
  }

  return { 
    VIRTUOSA: Math.max(0, v), 
    OPPORTUNISTA: Math.max(0, o), 
    EGOISTA: Math.max(0, e) 
  };
};

export const getEticaEffettivaSquadra = (index: number, totalTeams: number, globalPerc: number) => {
  const counts = getDistribuzioneEsatta(globalPerc, totalTeams);
  if (index < counts.VIRTUOSA) return 'VIRTUOSA';
  if (index < counts.VIRTUOSA + counts.OPPORTUNISTA) return 'OPPORTUNISTA';
  return 'EGOISTA';
};

export const getScheduleMatchmaking = (numSquadre: number, maxTappe: number) => {
  const n = numSquadre;
  const numRounds = maxTappe;
  const numMatchesPerRound = n / 2;
  const rounds = [];

  const baseRounds = [];
  const teamIds = Array.from({ length: n }, (_, i) => i + 1);

  for (let r = 0; r < numRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < numMatchesPerRound; i++) {
      const teamA = teamIds[i];
      const teamB = teamIds[n - 1 - i];
      roundMatches.push({ teamAId: teamA, teamBId: teamB });
    }
    baseRounds.push(roundMatches);
    teamIds.splice(1, 0, teamIds.pop()!);
  }

  for (let r = 0; r < numRounds; r++) {
    const matchesWithTappe: any[] = [];

    baseRounds[r].forEach((match, matchIdx) => {
      const postazione = ((matchIdx + r) % numMatchesPerRound) + 1;
      matchesWithTappe.push({
        postazione,
        teamAId: match.teamAId,
        teamBId: match.teamBId
      });
    });

    rounds.push({ round: r + 1, matches: matchesWithTappe });
  }

  return rounds;
};

export const creaSquadre = (params: any) => {
  const n = params.numSquadre;
  return generateDefaultArchetipi(n).map(arch => {
    const randCoins = [10, 20, 30][Math.floor(Math.random() * 3)];
    return {
      ...arch,
      etica: getEticaEffettivaSquadra(arch.id - 1, n, params.eticitaGlobalePerc),
      monete: params.moneteBase + randCoins,
      puntiSuccesso: 0,
      puntiMisericordia: 0,
      haSceltoDiCredere: false,
      haPagatoTutteLeDecime: true,
      storiaTappe: [],
      tentazioniCedute: 0,
      donazioniEffettuate: 0,
      bonusPuntualitaAccumulati: 0
    };
  });
};

export const probVittoria = (a: any, b: any, cedeA: boolean, cedeB: boolean, params: any) => {
  if (cedeA && !cedeB) return params.probVantaggioPerc / 100;
  if (!cedeA && cedeB) return 1 - params.probVantaggioPerc / 100;
  if (a.skill === b.skill) return 0.5;
  const forza: any = { ALTA: 3, MEDIA: 2, BASSA: 1 };
  const aForte = forza[a.skill] > forza[b.skill];
  const [forte, debole] = aForte ? [a.skill, b.skill] : [b.skill, a.skill];
  const p = (forte === 'ALTA' && debole === 'MEDIA' ? params.winAltaMedia : forte === 'MEDIA' ? params.winMediaBassa : params.winAltaBassa) / 100;
  return aForte ? p : 1 - p;
};

export const simulateSingleTappa = (tappaNumber: number, currentSquadreMap: Map<number, any>, params: any, scheduleMatchmaking: any[], maxTappe: number) => {
  const L = LOG;
  const clima = params.eticitaGlobalePerc;
  const tot = currentSquadreMap.size;
  const currentLogs = [{ tappa: tappaNumber, testo: `Tappa ${tappaNumber}` }];

  const map = new Map();
  currentSquadreMap.forEach((sq, id) => map.set(id, JSON.parse(JSON.stringify(sq))));

  map.forEach((t) => {
    t.ePuntualeInQuestaTappa = rnd(params.probabilitaPuntualitaPerc);
    if (t.ePuntualeInQuestaTappa) {
      t.monete += params.bonusPuntualita;
      t.bonusPuntualitaAccumulati = (t.bonusPuntualitaAccumulati || 0) + 1;
    }
  });

  const profiloDi = (etica: string) => params.profili[etica];

  scheduleMatchmaking[tappaNumber - 1].matches.forEach((match: any) => {
    const tA = map.get(match.teamAId), tB = map.get(match.teamBId);
    if (!tA || !tB) return;

    const mk = (t: any, opp: any) => ({ t, opp, log: [] as any[], cede: false, etica: t.eticaFissa || getEticaEffettivaSquadra(t.id - 1, tot, clima), oppS: null as any });
    const A = mk(tA, tB), B = mk(tB, tA);
    A.oppS = B; B.oppS = A;
    const entrambi = [A, B];
    const ref = (S: any) => ({ __team: true, id: S.t.id, skill: S.t.skill, etica: S.etica });
    const ordineCasuale = () => (Math.random() < 0.5 ? [A, B] : [B, A]);
    entrambi.forEach(S => S.log.push(S.t.ePuntualeInQuestaTappa ? L.inOrario(params.bonusPuntualita) : L.inRitardo));

    const richiediAiuto = (S: any, importo: number, misAcc: number) => {
      const { t, opp, oppS } = S;
      const pf = profiloDi(oppS.etica);
      if (opp.monete >= importo) {
        if (rnd(pf.aiutoPerc) && (opp.monete > pf.aiutoSeMoneteOltre || clima > pf.aiutoSeClimaOltre)) {
          opp.monete -= importo; opp.puntiMisericordia += misAcc; t.monete += importo;
          S.log.push(L.aiutoRicevuto(importo, ref(oppS)));
          oppS.log.push(L.aiutoDato(importo, ref(S), misAcc));
          return;
        }
        opp.puntiMisericordia -= params.penalitaRifiuto;
        S.log.push(L.aiutoRifiutato(ref(oppS)));
        oppS.log.push(L.aiutoNegato(ref(S), params.penalitaRifiuto));
      } else {
        S.log.push(L.senzaFondi(ref(oppS)));
      }
      if (params.chiesaSoccorre === 1) { t.monete += importo; S.log.push(L.soccorsoChiesa(importo)); }
    };

    const pagaCosto = (S: any, costo: number, misAcc: number, logOk: any, logKo: any) => {
      const { t } = S;
      if (t.monete < costo && t.puntiSuccesso > 0) {
        t.puntiSuccesso -= 1; t.monete += params.moneteDaVenditaSuccesso;
        S.log.push(L.vendutoSuccesso(params.moneteDaVenditaSuccesso));
      }
      if (t.monete < costo) richiediAiuto(S, costo - t.monete, misAcc);
      if (t.monete >= costo) { t.monete -= costo; S.log.push(logOk); }
      else { t.monete = 0; S.log.push(logKo); }
    };

    ordineCasuale().forEach(S => pagaCosto(S, params.costoIngressoTappa, params.misAiutoIngresso, L.costoIngresso(params.costoIngressoTappa), L.ingressoNonPagabile));
    if (tappaNumber === TAPPA_CRISI_INTERMEDIA) {
      ordineCasuale().forEach(S => pagaCosto(S, params.costoCrisiTappa3, params.misAiutoCrisi, L.crisi3Pagata(params.costoCrisiTappa3), L.crisi3Bancarotta));
    }

    if (tappaNumber === TAPPA_FEDE) {
      entrambi.forEach(S => {
        const pf = profiloDi(S.etica);
        S.t.haSceltoDiCredere = clima >= pf.fedeSicuraSeClimaOltre || rnd(clamp(pf.probFedePerc + pf.fedeSensClima * clima / 100, 0, 100));
        if (S.t.haSceltoDiCredere) S.log.push(L.sceltoFede);
        else { S.t.haPagatoTutteLeDecime = false; S.log.push(L.rifiutatoFede); }
      });
    }

    const vuoleBase = (S: any) => {
      const pf = profiloDi(S.etica);
      if (S.t.monete < params.costoTentazione) return false;
      if (clima < pf.tentSempreSeClimaSotto || S.t.monete < pf.tentSeMoneteSotto) return true;
      if (pf.tentBasePerc <= 0) return false;
      return rnd(clamp(pf.tentBasePerc * (1 - (pf.tentSensClima / 100) * (clima / 100)), 0, 100));
    };
    const base = [vuoleBase(A), vuoleBase(B)];
    entrambi.forEach((S, i) => {
      S.cede = base[i] || (profiloDi(S.etica).tentReagisce === 1 && base[1 - i] && S.t.monete >= params.costoTentazione);
      if (!S.cede) return;
      S.t.monete -= params.costoTentazione;
      S.t.puntiMisericordia -= params.costoMisericordiaTentazione;
      S.t.tentazioniCedute += 1;
      S.log.push(L.tentazioneAcquistata(params.costoTentazione, params.costoMisericordiaTentazione));
    });

    const pA = probVittoria(tA, tB, A.cede, B.cede, params);
    entrambi.forEach((S, i) => { if (S.cede) S.log.push(L.vantaggio(Math.round((i === 0 ? pA : 1 - pA) * 100))); });

    const aVince = Math.random() < pA;
    const W = aVince ? A : B, X = aVince ? B : A;
    X.log.push(L.sconfittoMinigioco);
    const pw = profiloDi(W.etica);
    const probSol = W.cede
      ? (clima > pw.solConTentClimaMin && W.t.monete >= pw.solConTentMoneteMin ? pw.solConTentPerc : 0)
      : clamp(pw.solSenzaTentPerc + pw.solSensClima * clima / 100, 0, 100);
    if (clima > params.climaMinSolidale && rnd(probSol)) {
      W.t.puntiSuccesso += params.puntiVittoriaSolidale;
      W.t.monete += params.moneteVittoriaSolidale;
      X.t.monete += params.moneteVittoriaSolidale;
      W.t.puntiMisericordia += params.misericordiaVittoriaSolidale;
      W.t.donazioniEffettuate += 1;
      W.log.push(L.solidaleVinta(params.puntiVittoriaSolidale, params.moneteVittoriaSolidale, params.misericordiaVittoriaSolidale, ref(X)));
      X.log.push(L.solidaleRicevuta(ref(W), params.moneteVittoriaSolidale));
    } else {
      W.t.puntiSuccesso += params.puntiVittoriaEgoista;
      W.t.monete += params.moneteVittoriaEgoista;
      W.t.puntiMisericordia += params.misericordiaVittoriaEgoista;
      W.log.push(L.egoistaVinta(params.puntiVittoriaEgoista, params.moneteVittoriaEgoista, params.misericordiaVittoriaEgoista));
    }

    if (tappaNumber >= TAPPA_FEDE && tappaNumber < maxTappe) {
      entrambi.forEach(S => {
        const { t } = S; const pf = profiloDi(S.etica); const d = params.valoreDecimaFissa;
        if (!t.haSceltoDiCredere) { t.haPagatoTutteLeDecime = false; return; }
        const salta = t.monete < pf.decimaSaltaSeMoneteSotto;
        if (!salta && t.monete >= d) { t.monete -= d; S.log.push(L.versataDecima(d)); }
        else if (!salta && pf.vendeSuccessoPerDecima === 1 && t.puntiSuccesso > 0 && t.monete + params.moneteDaVenditaSuccesso >= d) {
          t.puntiSuccesso -= 1; t.monete += params.moneteDaVenditaSuccesso - d;
          S.log.push(L.vendutoSuccesso(params.moneteDaVenditaSuccesso)); S.log.push(L.versataDecima(d));
        } else { t.haPagatoTutteLeDecime = false; S.log.push(L.decimaNonVersata); }
      });
    }

    if (tappaNumber === maxTappe) {
      entrambi.forEach(S => {
        const { t } = S;
        if (t.haSceltoDiCredere && t.haPagatoTutteLeDecime) S.log.push(L.crisiProtetto);
        else if (t.monete >= params.costoCrisiFinale) { t.monete -= params.costoCrisiFinale; S.log.push(L.crisiPagata(params.costoCrisiFinale)); }
        else { t.monete = 0; S.log.push(L.crisiBancarotta); }
      });
    }

    entrambi.forEach(S => { S.t.etica = S.etica; });
    entrambi.forEach(S => S.t.storiaTappe.push({ tappa: tappaNumber, vs: ref(S.oppS), monete: S.t.monete, successo: S.t.puntiSuccesso, misericordia: S.t.puntiMisericordia, logs: S.log }));
  });

  return { updatedMap: map, logs: currentLogs };
};
