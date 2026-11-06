import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  FastForward, 
  Award, 
  Heart, 
  Settings, 
  TrendingUp, 
  Users,
  Swords,
  Grid,
  ChevronRight,
  ShieldCheck,
  Flame,
  Scale,
  Compass,
  BarChart2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TAPPE_DISPONIBILI = [
  { id: 1, name: 'Educazione e Formazione', nameZh: '教育与培训', icon: '🎓', desc: { it: 'Test d\'ingresso. Tentazione: sbirciare la prova.', zh: '入学测试。诱惑：偷看试卷。' } },
  { id: 2, name: 'Matrimonio e Relazioni (Fede)', nameZh: '婚姻与关系（信仰）', icon: '💍', desc: { it: 'Incontro spirituale. Scelta Fede e inizio pagamento Decima.', zh: '精神聚会。选择信仰并开始支付什一税。' } },
  { id: 3, name: 'Finanza e Crisi Intermedia', nameZh: '金融与中期危机', icon: '⚡', desc: { it: 'Imprevisto e Catastrofe (30 monete). Impatto economico per tutti.', zh: '突发经济灾难（30金币）。全员承受经济冲击。' } },
  { id: 4, name: 'Lavoro e Carriera', nameZh: '工作与职业', icon: '💼', desc: { it: 'Promozione aziendale. Tentazione: boicottare i colleghi.', zh: '公司晋升。诱惑：排挤同事。' } },
  { id: 5, name: 'Salute e Benessere', nameZh: '健康与福祉', icon: '🏥', desc: { it: 'Lista d\'attesa medica. Tentazione: raccomandazione sconsiderata.', zh: '医疗等待名单。诱惑：无节制走后门。' } },
  { id: 6, name: 'Amicizie e Community', nameZh: '友谊与社群', icon: '🤝', desc: { it: 'Mutuo soccorso. Donazioni e prestiti inter-squadra.', zh: '互助。队伍间捐赠与借贷。' } },
  { id: 7, name: 'Famiglia e Crisi Finale', nameZh: '家庭与终极危机', icon: '🏠', desc: { it: 'Imprevisto economico (40 monete). La Chiesa copre i fedeli integrali.', zh: '经济意外（40金币）。教会庇护虔诚信徒。' } },
  { id: 8, name: 'Eredità e Futuro', nameZh: '传承与未来', icon: '🌟', desc: { it: 'Passaggio generazionale. Lascito e bilancio etico finale.', zh: '代际传承。遗赠与最终伦理结算。' } }
];

const NOMI_FISSI_PER_ETICA_E_SKILL = {
  VIRTUOSA: {
    ALTA: { it: "Virtuosi abili", zh: "高能美德队" },
    MEDIA: { it: "Virtuosi medi", zh: "中能美德队" },
    BASSA: { it: "Virtuosi deboli", zh: "低能美德队" }
  },
  OPPORTUNISTA: {
    ALTA: { it: "Opportunisti abili", zh: "高能机会主义队" },
    MEDIA: { it: "Opportunisti medi", zh: "中能机会主义队" },
    BASSA: { it: "Opportunisti deboli", zh: "低能机会主义队" }
  },
  EGOISTA: {
    ALTA: { it: "Egoisti abili", zh: "高能利己队" },
    MEDIA: { it: "Egoisti medi", zh: "中能利己队" },
    BASSA: { it: "Egoisti deboli", zh: "低能利己队" }
  }
};

const PROFILI_ETICI = ["VIRTUOSA", "OPPORTUNISTA", "EGOISTA"];
const SKILL_LEVELS = ["ALTA", "MEDIA", "BASSA"];

const DIZIONARIO = {
  it: {
    titoloApp: (num, tappe) => `Simulatore ${num} Squadre & ${tappe} Tappe`,
    sottotitoloApp: "Scontri diretti completi senza pause",
    reset: "Resetta",
    avanza: (curr, max) => `Avanza (${curr}/${max})`,
    simulaTutto: "Simula Tutto",
    tabellone: (count) => `Tabellone (${count})`,
    berger: "Berger",
    classifiche: "Classifiche",
    grafici: "Grafici",
    impostazioni: "Configurazione",
    storico: "Storico:",
    inizio: "Inizio",
    tappaN: (idx) => `Tappa ${idx}`,
    corrente: (curr) => `Corrente (${curr})`,
    regiaEtica: "Regia Clima Etico Globale",
    regiaDesc: "Modifica in tempo reale la propensione etica delle squadre. Il cursore regola la pressione collettiva verso comportamenti virtuosi o egoistici.",
    virtuosoClima: (perc) => `Clima Virtuoso (+${perc}%)`,
    egoistaClima: (perc) => `Clima Egoista (${perc}%)`,
    neutraleClima: "Clima Neutrale (0%)",
    virtuoseLabel: "Virtuose",
    opportunisteLabel: "Opportuniste",
    egoisteLabel: "Egoiste",
    squadreWord: "squadre",
    skillLabel: "Skill",
    monete: "Monete",
    successo: "Successo",
    misericordia: "Misericordia",
    attesaTurno: "In attesa del turno...",
    matriceBerger: "Matrice di Matchmaking (Sistema di Berger)",
    partecipantiBerger: (num, tappe) => `${num} Squadre partecipanti • ${tappe} Tappe senza pause`,
    roundTappa: (r) => `Tappa ${r}`,
    correnteBadge: "Corrente",
    classificaApparente: "Classifica Apparente (Punti Successo)",
    classificaReale: "Classifica Reale (Punti Misericordia)",
    moneteMedieEtico: "Monete Medie per Profilo Etico",
    successoMedieEtico: "Punti Successo Medi per Profilo Etico",
    misericordiaMedieEtico: "Misericordia Media per Profilo Etico",
    configEconomica: "Configurazione Economica & Regia",
    numSquadreTappeTitolo: "Numero di Squadre e Tappe (Senza Turni di Riposo)",
    numSquadreTappeDesc: "Seleziona una delle configurazioni ammesse per bilanciare il tabellone Berger:",
    squadreCountLabel: (c) => `${c} Squadre`,
    tappeCountLabel: (t) => `${t} Tappe`,
    moneteBaseLabel: "Monete Base Iniziali",
    decimaFedeLabel: "Costo Decima Fede (Monete fisse)",
    costoIngressoLabel: "Costo Ingresso Tappa",
    costoTentazioneLabel: "Costo Tentazione",
    costoCrisiIntermediaLabel: "Costo Catastrofe (Tappa 3)",
    costoCrisiLabel: "Costo Crisi Finale",
    bonusPuntualitaLabel: "Bonus Puntualità",
    moneteVenditaSuccessoLabel: "Monete da Vendita Successo",
    puntiEgoistaLabel: "Punti Successo (Vittoria Egoista)",
    moneteEgoistaLabel: "Monete (Vittoria Egoista)",
    puntiSolidaleLabel: "Punti Successo (Vittoria Solidale)",
    moneteSolidaleLabel: "Monete (Vittoria Solidale)",
    applicaResetta: "Applica e Salva Impostazioni",
    ripristinaDefault: "Ripristina Default",
    teamPrefix: "Squadra",
    eticaNames: { VIRTUOSA: "VIRTUOSA", OPPORTUNISTA: "OPPORTUNISTA", EGOISTA: "EGOISTA" },
    skillNames: { ALTA: "ALTA", MEDIA: "MEDIA", BASSA: "BASSA" },
    descSquadra: (skill) => `Squadra con abilità nei minigiochi ${skill.toLowerCase()}.`,
    logs: {
      inOrario: (b) => `⚡ In orario (+${b} monete)`,
      inRitardo: "⏰ In ritardo (0 monete)",
      costoIngresso: (c) => `Costo ingresso (-${c} monete)`,
      vendutoSuccesso: (m) => `Venduto 1 Successo (-1 succ, +${m} monete)`,
      prestitoAccettato: (m, opp) => `🤝 ${opp} ha ACCETTATO il prestito (+${m} monete, opp +1 misericordia)`,
      prestitoRifiutato: (m, opp) => `❌ ${opp} ha RIFIUTATO il prestito (opp -1 misericordia). Soccorso Chiesa (+${m} monete)`,
      sceltoFede: "Ha scelto la Fede",
      rifiutatoFede: "Ha rifiutato la Fede",
      versataDecima: (d) => `Versata Decima (-${d} monete)`,
      decimaNonVersata: "Decima non versata",
      tentazioneAcquistata: (c, m) => `Tentazione acquistata (-${c} monete, -${m} misericordia)`,
      sconfittoMinigioco: "Sconfitto nel minigioco (0 guadagni)",
      vittoriaSolidale: (p, m) => `Vittoria Solidale (+${p} successo, +${m} monete, +1 misericordia)`,
      ricevutaSolidarieta: (m) => `Ricevuta solidarietà (+${m} monete)`,
      vittoriaEgoista: (p, m) => `Vittoria Egoista (+${p} successo, +${m} monete)`,
      crisi3Pagata: (c) => `⚡ CATASTROFE (Tappa 3): Pagata tassa (-${c} monete)`,
      crisi3Bancarotta: "⚡ CATASTROFE (Tappa 3): Bancarotta (0 monete)",
      crisiProtetto: "🔥 CRISI FINALE: Protetto dalla Chiesa (0 costo)",
      crisiPagata: (c) => `🔥 CRISI FINALE: Pagata tassa (-${c} monete)`,
      crisiBancarotta: "🔥 CRISI FINALE: Bancarotta (0 monete)"
    }
  },
  zh: {
    titoloApp: (num, tappe) => `${num}支队伍 & ${tappe}阶段 模拟器`,
    sottotitoloApp: "完整直接对抗，无轮空",
    reset: "重置",
    avanza: (curr, max) => `推进 (${curr}/${max})`,
    simulaTutto: "模拟全部",
    tabellone: (count) => `面板 (${count})`,
    berger: "贝尔格排程",
    classifiche: "排行榜",
    grafici: "图表",
    impostazioni: "配置",
    storico: "历史:",
    inizio: "初始",
    tappaN: (idx) => `第 ${idx} 阶段`,
    corrente: (curr) => `当前 (${curr})`,
    regiaEtica: "全局伦理气候导演",
    regiaDesc: "实时修改队伍的伦理倾向。滑块调节集体朝向美德或利己行为的压力。",
    virtuosoClima: (perc) => `美德气候 (+${perc}%)`,
    egoistaClima: (perc) => `利己气候 (${perc}%)`,
    neutraleClima: "中立气候 (0%)",
    virtuoseLabel: "美德型",
    opportunisteLabel: "机会主义型",
    egoisteLabel: "利己型",
    squadreWord: "支队伍",
    skillLabel: "能力",
    monete: "金币",
    successo: "成功",
    misericordia: "仁慈",
    attesaTurno: "等待回合中...",
    matriceBerger: "配对矩阵（贝尔格系统）",
    partecipantiBerger: (num, tappe) => `${num}支参赛队伍 • ${tappe}个阶段无轮空`,
    roundTappa: (r) => `阶段 ${r}`,
    correnteBadge: "当前",
    classificaApparente: "表观排行榜（成功点数）",
    classificaReale: "真实排行榜（仁慈点数）",
    moneteMedieEtico: "各伦理档案平均金币",
    successoMedieEtico: "各伦理档案平均成功点数",
    misericordiaMedieEtico: "各伦理档案平均仁慈",
    configEconomica: "经济与导演配置",
    numSquadreTappeTitolo: "队伍数与阶段数（无轮空）",
    numSquadreTappeDesc: "选择允许的配置之一以平衡贝尔格排程表：",
    squadreCountLabel: (c) => `${c} 支队伍`,
    tappeCountLabel: (t) => `${t} 个阶段`,
    moneteBaseLabel: "初始基础金币",
    decimaFedeLabel: "信仰什一税成本（固定金币）",
    costoIngressoLabel: "阶段准入成本",
    costoTentazioneLabel: "诱惑成本",
    costoCrisiIntermediaLabel: "中期灾难成本 (第3阶段)",
    costoCrisiLabel: "终极危机成本",
    bonusPuntualitaLabel: "准时奖励",
    moneteVenditaSuccessoLabel: "出售成功点数所得金币",
    puntiEgoistaLabel: "成功点数（利己胜利）",
    moneteEgoistaLabel: "金币（利己胜利）",
    puntiSolidaleLabel: "成功点数（互助胜利）",
    moneteSolidaleLabel: "金币（互助胜利）",
    applicaResetta: "应用并保存配置",
    ripristinaDefault: "恢复默认设置",
    teamPrefix: "队伍",
    eticaNames: { VIRTUOSA: "美德", OPPORTUNISTA: "机会主义", EGOISTA: "利己" },
    skillNames: { ALTA: "高", MEDIA: "中", BASSA: "低" },
    descSquadra: (skill) => `具备${skill === 'ALTA' ? '高' : skill === 'MEDIA' ? '中' : '低'}能力的小游戏队伍。`,
    logs: {
      inOrario: (b) => `⚡ 准时 (+${b} 金币)`,
      inRitardo: "⏰ 迟到 (0 金币)",
      costoIngresso: (c) => `准入成本 (-${c} 金币)`,
      vendutoSuccesso: (m) => `出售 1 成功 (-1 成功, +${m} 金币)`,
      prestitoAccettato: (m, opp) => `🤝 ${opp} 接受借贷援助 (+${m} 金币, 对方 +1 仁慈)`,
      prestitoRifiutato: (m, opp) => `❌ ${opp} 拒绝借贷 (对方 -1 仁慈)。教会救助 (+${m} 金币)`,
      sceltoFede: "选择了信仰",
      rifiutatoFede: "拒绝了信仰",
      versataDecima: (d) => `缴纳什一税 (-${d} 金币)`,
      decimaNonVersata: "未缴纳什一税",
      tentazioneAcquistata: (c, m) => `购买诱惑 (-${c} 金币, -${m} 仁慈)`,
      sconfittoMinigioco: "小游戏败北 (0 收益)",
      vittoriaSolidale: (p, m) => `互助胜利 (+${p} 成功, +${m} 金币, +1 仁慈)`,
      ricevutaSolidarieta: (m) => `获得互助援助 (+${m} 金币)`,
      vittoriaEgoista: (p, m) => `利己胜利 (+${p} 成功, +${m} 金币)`,
      crisi3Pagata: (c) => `⚡ 中期灾难 (第3阶段)：缴纳税款 (-${c} 金币)`,
      crisi3Bancarotta: "⚡ 中期灾难 (第3阶段)：破产 (0 金币)",
      crisiProtetto: "🔥 终极危机：获教会庇护 (0 成本)",
      crisiPagata: (c) => `🔥 终极危机：缴纳税款 (-${c} 金币)`,
      crisiBancarotta: "🔥 终极危机：破产 (0 金币)"
    }
  }
};

const DEFAULT_PARAMS = {
  numSquadre: 14,
  moneteBase: 0,
  bonusPuntualita: 4,
  probabilitaPuntualitaPerc: 70, 
  costoIngressoTappa: 10,
  costoTentazione: 5,
  costoCrisiTappa3: 30,
  costoCrisiTappa7: 50,
  valoreDecimaFissa: 5,
  moneteDaVenditaSuccesso: 40,
  puntiVittoriaEgoista: 2,
  moneteVittoriaEgoista: 30,
  puntiVittoriaSolidale: 1,
  moneteVittoriaSolidale: 15,
  eticitaGlobalePerc: 0,
  bonusVantaggio: 2.0,
  costoMisericordiaTentazione: 2
};

const generateDefaultArchetipi = (count, lang) => {
  return Array.from({ length: count }, (_, i) => {
    const eticaBase = i % 3 === 0 ? "VIRTUOSA" : i % 3 === 1 ? "OPPORTUNISTA" : "EGOISTA";
    const skill = SKILL_LEVELS[i % SKILL_LEVELS.length];
    const nomeBase = NOMI_FISSI_PER_ETICA_E_SKILL[eticaBase][skill];

    return {
      id: i + 1,
      nomeOriginale: nomeBase,
      skill,
      eticaBase,
      desc: DIZIONARIO[lang].descSquadra(skill)
    };
  });
};

export default function App() {
  const [lang, setLang] = useState('it');
  const t = DIZIONARIO[lang];

  const [params, setParams] = useState(() => {
    try {
      const saved = localStorage.getItem('simulatore_squadre_params');
      if (saved) {
        return { ...DEFAULT_PARAMS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Impossibile caricare parametri da localStorage", e);
    }
    return DEFAULT_PARAMS;
  });

  const [configCategory, setConfigCategory] = useState('struttura');

  const saveParamsToLocalStorage = useCallback((newParams) => {
    try {
      localStorage.setItem('simulatore_squadre_params', JSON.stringify(newParams));
    } catch (e) {
      console.error("Impossibile salvare in localStorage", e);
    }
  }, []);

  const updateSingleParam = (key, val) => {
    setParams(prev => {
      const next = { ...prev, [key]: Number(val) };
      saveParamsToLocalStorage(next);
      return next;
    });
  };

  const handleResetToDefault = () => {
    setParams(DEFAULT_PARAMS);
    saveParamsToLocalStorage(DEFAULT_PARAMS);
    setArchetipiConfig(generateDefaultArchetipi(DEFAULT_PARAMS.numSquadre, lang));
  };

  const maxTappe = useMemo(() => {
    if (params.numSquadre === 12) return 6;
    if (params.numSquadre === 16) return 8;
    return 7;
  }, [params.numSquadre]);

  const [archetipiConfig, setArchetipiConfig] = useState(() => generateDefaultArchetipi(14, 'it'));
  const [currentTappa, setCurrentTappa] = useState(0); 
  const [viewedTappa, setViewedTappa] = useState(0); 
  const [activeTab, setActiveTab] = useState('simulatore'); 
  const [squadre, setSquadre] = useState([]);
  const [history, setHistory] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);

  const handleSelectNumSquadre = (count) => {
    if (![12, 14, 16].includes(count)) return;
    const nextParams = { ...params, numSquadre: count };
    setParams(nextParams);
    saveParamsToLocalStorage(nextParams);
    setArchetipiConfig(generateDefaultArchetipi(count, lang));
  };

  const eticitaValoreNumerico = useMemo(() => {
    return Math.round((params.eticitaGlobalePerc / 100) * 50);
  }, [params.eticitaGlobalePerc]);

  const getDistribuzioneEsatta = useCallback((globalPerc, totalTeams) => {
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
  }, []);

  const distribuzioneEticaLive = useMemo(() => {
    return getDistribuzioneEsatta(params.eticitaGlobalePerc, archetipiConfig.length);
  }, [getDistribuzioneEsatta, params.eticitaGlobalePerc, archetipiConfig.length]);

  const getEticaEffettivaSquadra = useCallback((index, totalTeams, globalPerc) => {
    const counts = getDistribuzioneEsatta(globalPerc, totalTeams);
    if (index < counts.VIRTUOSA) return 'VIRTUOSA';
    if (index < counts.VIRTUOSA + counts.OPPORTUNISTA) return 'OPPORTUNISTA';
    return 'EGOISTA';
  }, [getDistribuzioneEsatta]);

  const getDatiDinamiciSquadra = useCallback((index, totalTeams, globalPerc, skill) => {
    const etica = getEticaEffettivaSquadra(index, totalTeams, globalPerc);
    const nomeObj = NOMI_FISSI_PER_ETICA_E_SKILL[etica][skill];
    return { etica, nome: nomeObj[lang] };
  }, [getEticaEffettivaSquadra, lang]);

  const scheduleMatchmaking = useMemo(() => {
    const n = params.numSquadre;
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
      teamIds.splice(1, 0, teamIds.pop());
    }

    for (let r = 0; r < numRounds; r++) {
      const matchesWithTappe = [];

      baseRounds[r].forEach((match, matchIdx) => {
        let tappaId = ((matchIdx + r) % numMatchesPerRound) + 1;
        
        matchesWithTappe.push({
          tappaId,
          tappaNome: TAPPE_DISPONIBILI[tappaId - 1] ? TAPPE_DISPONIBILI[tappaId - 1].name : `Tappa ${tappaId}`,
          teamAId: match.teamAId,
          teamBId: match.teamBId
        });
      });

      rounds.push({ round: r + 1, matches: matchesWithTappe });
    }

    return rounds;
  }, [params.numSquadre, maxTappe]);

  const initializeTeams = useCallback(() => {
    const currentArchetipi = generateDefaultArchetipi(params.numSquadre, lang);
    setArchetipiConfig(currentArchetipi);

    const newSquadre = currentArchetipi.map((arch, idx) => {
      const randCoins = [10, 20, 30][Math.floor(Math.random() * 3)];
      const { etica, nome } = getDatiDinamiciSquadra(idx, params.numSquadre, params.eticitaGlobalePerc, arch.skill);

      return {
        ...arch,
        nome: `${t.teamPrefix} ${arch.id} (${nome})`,
        etica,
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

    setSquadre(newSquadre);
    setCurrentTappa(0);
    setViewedTappa(0);
    setHistory([{ tappa: 0, squadre: newSquadre.map(s => ({ ...s })) }]);
    setEventLogs([{ tappa: 0, testo: `Simulazione inizializzata!` }]);
  }, [params.numSquadre, params.moneteBase, params.eticitaGlobalePerc, lang, getDatiDinamiciSquadra, t.teamPrefix]);

  useEffect(() => {
    initializeTeams();
  }, [lang]);

  useEffect(() => {
    setSquadre(prevSquadre => {
      if (prevSquadre.length === 0) return prevSquadre;
      return prevSquadre.map((sq, idx) => {
        const { etica, nome } = getDatiDinamiciSquadra(idx, params.numSquadre, params.eticitaGlobalePerc, sq.skill);
        return {
          ...sq,
          etica,
          nome: `${t.teamPrefix} ${sq.id} (${nome})`,
          desc: t.descSquadra(sq.skill)
        };
      });
    });
  }, [params.eticitaGlobalePerc, params.numSquadre, getDatiDinamiciSquadra, lang, t]);

  const calculateWinProbability = (teamA, teamB, cedeA, cedeB) => {
    if (cedeA && !cedeB) return 0.80;
    if (!cedeA && cedeB) return 0.20;

    const skillA = teamA.skill;
    const skillB = teamB.skill;

    if (skillA === skillB) return 0.50;

    if (skillA === 'ALTA' && skillB === 'MEDIA') return 0.60;
    if (skillA === 'MEDIA' && skillB === 'ALTA') return 0.40;

    if (skillA === 'MEDIA' && skillB === 'BASSA') return 0.60;
    if (skillA === 'BASSA' && skillB === 'MEDIA') return 0.40;

    if (skillA === 'ALTA' && skillB === 'BASSA') return 0.70;
    if (skillA === 'BASSA' && skillB === 'ALTA') return 0.30;

    return 0.50;
  };

  const simulateSingleTappa = (tappaNumber, currentSquadreMap) => {
    const currentRoundMatches = scheduleMatchmaking[tappaNumber - 1].matches;
    const currentLogs = [];
    currentLogs.push({ tappa: tappaNumber, testo: `Tappa ${tappaNumber}` });

    const updatedSquadreMap = new Map();
    currentSquadreMap.forEach((sq, id) => {
      updatedSquadreMap.set(id, JSON.parse(JSON.stringify(sq)));
    });

    updatedSquadreMap.forEach((t) => {
      const probPuntuale = params.probabilitaPuntualitaPerc / 100;
      const ePuntuale = Math.random() < probPuntuale;
      t.ePuntualeInQuestaTappa = ePuntuale;
      if (ePuntuale) {
        t.monete += params.bonusPuntualita;
        t.bonusPuntualitaAccumulati = (t.bonusPuntualitaAccumulati || 0) + 1;
      }
    });

    currentRoundMatches.forEach(match => {
      let teamA = updatedSquadreMap.get(match.teamAId);
      let teamB = updatedSquadreMap.get(match.teamBId);
      if (!teamA || !teamB) return;

      const eticaEffettivaA = getEticaEffettivaSquadra(match.teamAId - 1, archetipiConfig.length, params.eticitaGlobalePerc);
      const eticaEffettivaB = getEticaEffettivaSquadra(match.teamBId - 1, archetipiConfig.length, params.eticitaGlobalePerc);

      let logA = [];
      let logB = [];

      [ { t: teamA, log: logA }, { t: teamB, log: logB } ].forEach(({ t, log }) => {
        if (t.ePuntualeInQuestaTappa) log.push(DIZIONARIO[lang].logs.inOrario(params.bonusPuntualita));
        else log.push(DIZIONARIO[lang].logs.inRitardo);
      });

      [ 
        { t: teamA, log: logA, opp: teamB, oppEtica: eticaEffettivaB }, 
        { t: teamB, log: logB, opp: teamA, oppEtica: eticaEffettivaA } 
      ].forEach(({ t, log, opp, oppEtica }) => {
        if (t.monete >= params.costoIngressoTappa) {
          t.monete -= params.costoIngressoTappa;
          log.push(DIZIONARIO[lang].logs.costoIngresso(params.costoIngressoTappa));
        } else {
          if (t.puntiSuccesso > 0) {
            t.puntiSuccesso -= 1;
            t.monete += params.moneteDaVenditaSuccesso;
            log.push(DIZIONARIO[lang].logs.vendutoSuccesso(params.moneteDaVenditaSuccesso));
            // Effettua subito il pagamento dell'ingresso dopo la vendita
            t.monete -= params.costoIngressoTappa;
            log.push(DIZIONARIO[lang].logs.costoIngresso(params.costoIngressoTappa));
          } else {
            // Calcolo dell'importo strettamente necessario per coprire l'ingresso
            const mancanteIngresso = params.costoIngressoTappa - t.monete;

            if (opp.monete >= mancanteIngresso) {
              let accettaAiuto = false;
              if (oppEtica === 'VIRTUOSA') {
                accettaAiuto = true;
              } else if (oppEtica === 'OPPORTUNISTA') {
                accettaAiuto = opp.monete > 20 || params.eticitaGlobalePerc > 20;
              } else {
                accettaAiuto = false;
              }

              if (accettaAiuto) {
                opp.monete -= mancanteIngresso;
                opp.puntiMisericordia += 1;
                t.monete += mancanteIngresso;
                log.push(DIZIONARIO[lang].logs.prestitoAccettato(mancanteIngresso, opp.nome));
              } else {
                opp.puntiMisericordia -= 1;
                t.monete += mancanteIngresso;
                log.push(DIZIONARIO[lang].logs.prestitoRifiutato(mancanteIngresso, opp.nome));
              }
            } else {
              t.monete += mancanteIngresso;
              log.push(DIZIONARIO[lang].logs.prestitoRifiutato(mancanteIngresso, opp.nome));
            }

            // Successivamente alla donazione/intervento, paga regolarmente l'ingresso
            t.monete -= params.costoIngressoTappa;
            log.push(DIZIONARIO[lang].logs.costoIngresso(params.costoIngressoTappa));
          }
        }
      });

      if (tappaNumber === 3) {
        [ 
          { t: teamA, log: logA, opp: teamB, oppEtica: eticaEffettivaB, oppLog: logB }, 
          { t: teamB, log: logB, opp: teamA, oppEtica: eticaEffettivaA, oppLog: logA } 
        ].forEach(({ t, log, opp, oppEtica, oppLog }) => {
          const costoCatastrofe = params.costoCrisiTappa3;

          if (t.monete >= costoCatastrofe) {
            t.monete -= costoCatastrofe;
            log.push(DIZIONARIO[lang].logs.crisi3Pagata(costoCatastrofe));
          } else {
            let importoMancante = costoCatastrofe - t.monete;
            if (t.puntiSuccesso > 0) {
              t.puntiSuccesso -= 1;
              t.monete += params.moneteDaVenditaSuccesso;
              log.push(DIZIONARIO[lang].logs.vendutoSuccesso(params.moneteDaVenditaSuccesso));
            }

            importoMancante = costoCatastrofe - t.monete;

            if (importoMancante > 0) {
              if (opp.monete >= importoMancante) {
                let accettaAiuto = oppEtica === 'VIRTUOSA' || (oppEtica === 'OPPORTUNISTA' && params.eticitaGlobalePerc > 20);
                if (accettaAiuto) {
                  opp.monete -= importoMancante;
                  opp.puntiMisericordia += 2;
                  t.monete += importoMancante;
                  log.push(`🤝 ${opp.nome} ha ACCETTATO il prestito di ${importoMancante} monete.`);
                  oppLog.push(`🤝 Ha donato/prestato ${importoMancante} monete a ${t.nome} (+2 misericordia).`);
                } else {
                  opp.puntiMisericordia -= 1;
                  t.monete += importoMancante;
                  log.push(DIZIONARIO[lang].logs.prestitoRifiutato(importoMancante, opp.nome));
                  oppLog.push(`❌ Ha RIFIUTATO il prestito a ${t.nome} (-1 misericordia). Intervento Chiesa.`);
                }
              } else {
                t.monete += importoMancante;
                log.push(`⛪ ${opp.nome} non ha abbastanza fondi. Intervento protettivo della Chiesa (+${importoMancante} monete).`);
              }
            }

            if (t.monete >= costoCatastrofe) {
              t.monete -= costoCatastrofe;
              log.push(DIZIONARIO[lang].logs.crisi3Pagata(costoCatastrofe));
            } else {
              t.monete = 0;
              log.push(DIZIONARIO[lang].logs.crisi3Bancarotta);
            }
          }
        });
      }

      [ 
        { t: teamA, log: logA, eticaEff: eticaEffettivaA }, 
        { t: teamB, log: logB, eticaEff: eticaEffettivaB } 
      ].forEach(({ t, log, eticaEff }) => {
        if (tappaNumber === 2) {
          const probFedeMod = 0.5 + (eticitaValoreNumerico / 100);
          if (eticaEff === 'VIRTUOSA') t.haSceltoDiCredere = true;
          else if (eticaEff === 'EGOISTA') t.haSceltoDiCredere = eticitaValoreNumerico >= 40;
          else if (eticaEff === 'OPPORTUNISTA') t.haSceltoDiCredere = Math.random() < probFedeMod;
          else t.haSceltoDiCredere = Math.random() > (0.6 - (eticitaValoreNumerico / 200));

          if (t.haSceltoDiCredere) log.push(DIZIONARIO[lang].logs.sceltoFede);
          else {
            t.haPagatoTutteLeDecime = false;
            log.push(DIZIONARIO[lang].logs.rifiutatoFede);
          }
        }
      });

      const vuoleTentazione = (t, eticaEff) => {
        if (t.monete < params.costoTentazione) return false;

        if (eticaEff === 'VIRTUOSA') {
          return eticitaValoreNumerico < -30;
        }
        
        if (eticaEff === 'EGOISTA') {
          return true;
        }

        if (eticaEff === 'OPPORTUNISTA') {
          if (t.monete <= 15 || t.puntiSuccesso <= 1) {
            return true;
          }
          const probCedereStabile = Math.max(0.05, 1 - (params.eticitaGlobalePerc / 100));
          return Math.random() < probCedereStabile;
        }

        return false;
      };

      const cedeA = vuoleTentazione(teamA, eticaEffettivaA);
      const cedeB = vuoleTentazione(teamB, eticaEffettivaB);

      const penalitaMisericordia = params.costoMisericordiaTentazione !== undefined ? params.costoMisericordiaTentazione : 2;

      if (cedeA) {
        teamA.monete -= params.costoTentazione;
        teamA.puntiMisericordia -= penalitaMisericordia;
        teamA.tentazioniCedute += 1;
        logA.push(DIZIONARIO[lang].logs.tentazioneAcquistata(params.costoTentazione, penalitaMisericordia));
      }
      if (cedeB) {
        teamB.monete -= params.costoTentazione;
        teamB.puntiMisericordia -= penalitaMisericordia;
        teamB.tentazioniCedute += 1;
        logB.push(DIZIONARIO[lang].logs.tentazioneAcquistata(params.costoTentazione, penalitaMisericordia));
      }

      const winProbA = calculateWinProbability(teamA, teamB, cedeA, cedeB);
      const winProbAPerc = Math.round(winProbA * 100);
      const winProbBPerc = 100 - winProbAPerc;

      if (cedeA) logA.push(`⚡ Vantaggio attivo! Probabilità scontro: ${winProbAPerc}%`);
      if (cedeB) logB.push(`⚡ Vantaggio attivo! Probabilità scontro: ${winProbBPerc}%`);

      const winnerIsA = Math.random() < winProbA;
      const winner = winnerIsA ? teamA : teamB;
      const winnerEticaEff = winnerIsA ? eticaEffettivaA : eticaEffettivaB;
      const winnerHaUsatoTentazione = winnerIsA ? cedeA : cedeB;
      const loser = winnerIsA ? teamB : teamA;
      const winnerLog = winnerIsA ? logA : logB;
      const loserLog = winnerIsA ? logB : logA;

      loserLog.push(DIZIONARIO[lang].logs.sconfittoMinigioco);

      let sceglieSolidale = false;

      if (winnerEticaEff === 'VIRTUOSA') {
        sceglieSolidale = winnerHaUsatoTentazione
          ? Math.random() < 0.15 && eticitaValoreNumerico > 20
          : true;
      } else if (winnerEticaEff === 'OPPORTUNISTA') {
        if (winnerHaUsatoTentazione) {
          sceglieSolidale = winner.monete >= 20;
        } else {
          const probAltaSolidale = Math.min(0.95, Math.max(0.65, 0.80 + (params.eticitaGlobalePerc / 500)));
          sceglieSolidale = Math.random() < probAltaSolidale;
        }
      } else {
        sceglieSolidale = false;
      }

      if (sceglieSolidale && eticitaValoreNumerico > -40) {
        winner.puntiSuccesso += params.puntiVittoriaSolidale;
        winner.monete += params.moneteVittoriaSolidale;
        loser.monete += params.moneteVittoriaSolidale;
        winner.puntiMisericordia += 1;
        winner.donazioniEffettuate += 1;
        winnerLog.push(`🤝 Vittoria Solidale con donazione: +${params.puntiVittoriaSolidale} successo, +${params.moneteVittoriaSolidale} monete a se stesso e a ${loser.nome} (+1 misericordia).`);
        loserLog.push(`🎁 ${winner.nome} ha condiviso la solidarietà, donando ${params.moneteVittoriaSolidale} monete.`);
      } else {
        winner.puntiSuccesso += params.puntiVittoriaEgoista;
        winner.monete += params.moneteVittoriaEgoista;
        winnerLog.push(DIZIONARIO[lang].logs.vittoriaEgoista(params.puntiVittoriaEgoista, params.moneteVittoriaEgoista));
      }

      if (tappaNumber >= 2 && tappaNumber < maxTappe) {
        [ { t: teamA, log: logA, eticaEff: eticaEffettivaA }, { t: teamB, log: logB, eticaEff: eticaEffettivaB } ].forEach(({ t, log, eticaEff }) => {
          if (t.haSceltoDiCredere) {
            const decima = params.valoreDecimaFissa;
            const opportunistaInCrisi = eticaEff === 'OPPORTUNISTA' && t.monete < 15;

            if (!opportunistaInCrisi && t.monete >= decima) {
              t.monete -= decima;
              log.push(DIZIONARIO[lang].logs.versataDecima(decima));
            } else {
              if (!opportunistaInCrisi && eticaEff === 'VIRTUOSA' && t.puntiSuccesso > 0) {
                t.puntiSuccesso -= 1;
                t.monete += params.moneteDaVenditaSuccesso - decima;
                log.push(DIZIONARIO[lang].logs.vendutoSuccesso(params.moneteDaVenditaSuccesso));
                log.push(DIZIONARIO[lang].logs.versataDecima(decima));
              } else {
                t.haPagatoTutteLeDecime = false;
                log.push(DIZIONARIO[lang].logs.decimaNonVersata);
              }
            }
          } else {
            t.haPagatoTutteLeDecime = false;
          }
        });
      }

      if (tappaNumber === maxTappe) {
        [ { t: teamA, log: logA }, { t: teamB, log: logB } ].forEach(({ t, log }) => {
          if (t.haSceltoDiCredere && t.haPagatoTutteLeDecime) {
            log.push(DIZIONARIO[lang].logs.crisiProtetto);
          } else {
            if (t.monete >= params.costoCrisiTappa7) {
              t.monete -= params.costoCrisiTappa7;
              log.push(DIZIONARIO[lang].logs.crisiPagata(params.costoCrisiTappa7));
            } else {
              t.monete = 0;
              log.push(DIZIONARIO[lang].logs.crisiBancarotta);
            }
          }
        });
      }

      teamA.storiaTappe.push({ tappa: tappaNumber, vs: teamB.nome, monete: teamA.monete, successo: teamA.puntiSuccesso, misericordia: teamA.puntiMisericordia, logs: logA });
      teamB.storiaTappe.push({ tappa: tappaNumber, vs: teamA.nome, monete: teamB.monete, successo: teamB.puntiSuccesso, misericordia: teamB.puntiMisericordia, logs: logB });
    });

    return { updatedMap: updatedSquadreMap, logs: currentLogs };
  };

  const advanceTappa = () => {
    if (currentTappa >= maxTappe) return;
    const nextTappa = currentTappa + 1;
    const currentSquadreMap = new Map(squadre.map(s => [s.id, { ...s }]));
    
    const { updatedMap, logs } = simulateSingleTappa(nextTappa, currentSquadreMap);
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
      const { updatedMap, logs } = simulateSingleTappa(tempTappa, tempSquadreMap);
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

  const displayedSquadre = useMemo(() => {
    const snapshot = history.find(h => h.tappa === viewedTappa);
    return snapshot ? snapshot.squadre : squadre;
  }, [history, viewedTappa, squadre]);

  const classificaApparente = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.puntiSuccesso - a.puntiSuccesso || b.monete - a.monete);
  }, [displayedSquadre]);

  const classificaReale = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.puntiMisericordia - a.puntiMisericordia || b.monete - a.monete);
  }, [displayedSquadre]);

  const chartData = useMemo(() => {
    return history.map(h => {
      const item = { tappa: lang === 'zh' ? `阶段 ${h.tappa}` : `Tappa ${h.tappa}` };
      PROFILI_ETICI.forEach(etica => {
        const sqs = h.squadre.filter(s => s.etica === etica);
        if (sqs.length > 0) {
          item[`${etica}_monete`] = Math.round(sqs.reduce((a, c) => a + c.monete, 0) / sqs.length);
          item[`${etica}_successo`] = Number((sqs.reduce((a, c) => a + c.puntiSuccesso, 0) / sqs.length).toFixed(1));
          item[`${etica}_misericordia`] = Number((sqs.reduce((a, c) => a + c.puntiMisericordia, 0) / sqs.length).toFixed(1));
        }
      });
      return item;
    });
  }, [history, lang]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
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

      {/* NAVIGAZIONE TAB & BARRA STORICO */}
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

      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* REGIA CLIMA ETICO */}
        {activeTab === 'simulatore' && (
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
        )}

        {/* TAB 1. TABELLONE SQUADRE */}
        {activeTab === 'simulatore' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayedSquadre.map(s => (
              <div key={s.id} className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">{s.nome}</h3>
                      <div className="flex gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                          s.etica === 'VIRTUOSA' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                          s.etica === 'EGOISTA' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                          'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>{t.eticaNames[s.etica]}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-slate-300">
                          {t.skillLabel}: {t.skillNames[s.skill]}
                        </span>
                      </div>
                    </div>
                    {s.haSceltoDiCredere && (
                      <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-base shadow-sm" title="Credente">🙏</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4 italic leading-relaxed">{s.desc}</p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center bg-slate-950/50 rounded-2xl px-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.monete}</span>
                      <span className="text-base font-extrabold text-amber-400">{s.monete}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.successo}</span>
                      <span className="text-base font-extrabold text-indigo-400">{s.puntiSuccesso}</span>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">{t.misericordia}</span>
                      <span className="text-base font-extrabold text-emerald-400">{s.puntiMisericordia}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-300">
                    {s.storiaTappe.length > 0 ? (
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner">
                        <span className="text-xs font-bold text-indigo-300 block pb-1.5 border-b border-slate-800 flex items-center justify-between">
                          <span>{t.tappaN(s.storiaTappe.length)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">vs {s.storiaTappe[s.storiaTappe.length - 1].vs}</span>
                        </span>
                        {s.storiaTappe[s.storiaTappe.length - 1].logs.map((log, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span className="leading-tight">{log}</span>
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

        {/* TAB 2. MATCHMAKING BERGER */}
        {activeTab === 'matchmaking' && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-x-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-400" /> Matrice di Matchmaking (Vista per Tappa)
              </h2>
              <span className="text-xs text-slate-400">{t.partecipantiBerger(params.numSquadre, maxTappe)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {TAPPE_DISPONIBILI.slice(0, maxTappe).map((tappa, tIdx) => (
                <div key={tappa.id} className="border rounded-2xl p-5 bg-slate-950/60 shadow-inner flex flex-col justify-between border-slate-800">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800 text-xs font-bold text-indigo-400">
                      <span className="text-sm font-extrabold flex items-center gap-1.5 text-white">
                        <span className="text-base">{tappa.icon}</span>
                        Tappa {tappa.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">{tappa.name}</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mb-3 italic">
                      Squadre in sfida per ciascun Round (R):
                    </p>

                    <div className="space-y-2">
                      {scheduleMatchmaking.map((roundObj) => {
                        const matchInTappa = roundObj.matches.find(m => m.tappaId === tappa.id);
                        if (!matchInTappa) return null;
                        
                        const isCurrentRound = currentTappa === roundObj.round;
                        const nameA = `${t.teamPrefix} ${matchInTappa.teamAId}`;
                        const nameB = `${t.teamPrefix} ${matchInTappa.teamBId}`;
                        
                        return (
                          <div 
                            key={roundObj.round} 
                            className={`text-[11px] p-2.5 rounded-xl flex justify-between items-center border font-medium shadow-sm transition ${
                              isCurrentRound 
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                                : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span className={`text-[10px] font-extrabold mr-1 px-1.5 py-0.5 rounded ${
                              isCurrentRound ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              R{roundObj.round}
                            </span>
                            <span className="truncate max-w-[35%] font-semibold">{nameA}</span>
                            <span className="text-slate-500 font-extrabold px-1 text-[10px]">VS</span>
                            <span className="truncate max-w-[35%] font-semibold">{nameB}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-medium flex justify-between">
                    <span>{maxTappe} Round totali</span>
                    <span>1 Sfida per Round</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3. CLASSIFICHE */}
        {activeTab === 'classifica' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
              <h3 className="font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> {t.classificaApparente}
              </h3>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {classificaApparente.map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center py-3 px-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs shadow-sm">
                    <span className="font-extrabold text-slate-400 w-6 text-sm">{idx + 1}.</span>
                    <span className="font-semibold text-slate-200 flex-1 truncate">{s.nome}</span>
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
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {classificaReale.map((s, idx) => (
                  <div key={s.id} className={`flex justify-between items-center py-3 px-4 rounded-2xl text-xs border shadow-sm ${idx === 0 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/20' : 'bg-slate-950/70 border-slate-800 text-slate-200'}`}>
                    <span className="font-extrabold text-emerald-400 w-6 text-sm">{idx + 1}.</span>
                    <span className="font-semibold flex-1 truncate">{s.nome}</span>
                    <span className="text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-xl mr-2">{s.puntiMisericordia} {t.misericordia}</span>
                    <span className="text-amber-400 font-extrabold w-20 text-right">{s.monete} 💰</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4. GRAFICI */}
        {activeTab === 'grafici' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" /> {t.moneteMedieEtico}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="tappa" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '16px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="VIRTUOSA_monete" name={t.virtuoseLabel} stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="EGOISTA_monete" name={t.egoisteLabel} stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OPPORTUNISTA_monete" name={t.opportunisteLabel} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> {t.successoMedieEtico}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="tappa" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '16px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="VIRTUOSA_successo" name={t.virtuoseLabel} stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="EGOISTA_successo" name={t.egoisteLabel} stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OPPORTUNISTA_successo" name={t.opportunisteLabel} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" /> {t.misericordiaMedieEtico}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="tappa" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '16px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="VIRTUOSA_misericordia" name={t.virtuoseLabel} stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="EGOISTA_misericordia" name={t.egoisteLabel} stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OPPORTUNISTA_misericordia" name={t.opportunisteLabel} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5. CONFIGURAZIONE */}
        {activeTab === 'impostazioni' && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> {t.configEconomica}
                </h2>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Le impostazioni vengono salvate automaticamente per le prossime sessioni.
                </p>
              </div>

              <button
                onClick={handleResetToDefault}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.ripristinaDefault}
              </button>
            </div>

            {/* SELEZIONE CATEGORIA CONFIGURAZIONE */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              {[
                { id: 'struttura', label: 'Struttura & Squadre', icon: Users },
                { id: 'economia', label: 'Economia Base', icon: Scale },
                { id: 'crisi', label: 'Tentazioni & Crisi', icon: Flame },
                { id: 'premi', label: 'Minigiochi & Esiti', icon: Award }
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = configCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setConfigCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* CATEGORIA 1: STRUTTURA */}
            {configCategory === 'struttura' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/30 shadow-inner space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" /> {t.numSquadreTappeTitolo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{t.numSquadreTappeDesc}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    {[12, 14, 16].map(count => {
                      const tappe = count === 12 ? 6 : count === 14 ? 7 : 8;
                      const isSelected = params.numSquadre === count;
                      return (
                        <button
                          key={count}
                          onClick={() => handleSelectNumSquadre(count)}
                          className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-lg font-black text-white">{t.squadreCountLabel(count)}</span>
                          <span className="text-xs text-indigo-400 font-extrabold mt-0.5">{t.tappeCountLabel(tappe)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CONTROL INPUT REUSABLE RENDER */}
            {configCategory !== 'struttura' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {configCategory === 'economia' && [
                  { key: 'moneteBase', label: t.moneteBaseLabel, step: 5, min: 0 },
                  { key: 'costoIngressoTappa', label: t.costoIngressoLabel, step: 1, min: 0 },
                  { key: 'bonusPuntualita', label: t.bonusPuntualitaLabel, step: 1, min: 0 },
                  { key: 'valoreDecimaFissa', label: t.decimaFedeLabel, step: 1, min: 0 },
                  { key: 'moneteDaVenditaSuccesso', label: t.moneteVenditaSuccessoLabel, step: 5, min: 0 }
                ].map(item => (
                  <div key={item.key} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <label className="font-semibold text-slate-300 block mb-2">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSingleParam(item.key, Math.max(item.min, params[item.key] - item.step))}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={params[item.key]} 
                        onChange={e => updateSingleParam(item.key, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-center text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => updateSingleParam(item.key, params[item.key] + item.step)}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {configCategory === 'crisi' && [
                  { key: 'costoTentazione', label: t.costoTentazioneLabel, step: 1, min: 0 },
                  { key: 'costoMisericordiaTentazione', label: "Perdita Misericordia da Tentazione", step: 1, min: 0 },
                  { key: 'costoCrisiTappa3', label: t.costoCrisiIntermediaLabel, step: 5, min: 0 },
                  { key: 'costoCrisiTappa7', label: t.costoCrisiLabel, step: 5, min: 0 }
                ].map(item => (
                  <div key={item.key} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <label className="font-semibold text-slate-300 block mb-2">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSingleParam(item.key, Math.max(item.min, params[item.key] - item.step))}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={params[item.key]} 
                        onChange={e => updateSingleParam(item.key, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-center text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => updateSingleParam(item.key, params[item.key] + item.step)}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {configCategory === 'premi' && [
                  { key: 'puntiVittoriaEgoista', label: t.puntiEgoistaLabel, step: 1, min: 0 },
                  { key: 'moneteVittoriaEgoista', label: t.moneteEgoistaLabel, step: 5, min: 0 },
                  { key: 'puntiVittoriaSolidale', label: t.puntiSolidaleLabel, step: 1, min: 0 },
                  { key: 'moneteVittoriaSolidale', label: t.moneteSolidaleLabel, step: 5, min: 0 }
                ].map(item => (
                  <div key={item.key} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <label className="font-semibold text-slate-300 block mb-2">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSingleParam(item.key, Math.max(item.min, params[item.key] - item.step))}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={params[item.key]} 
                        onChange={e => updateSingleParam(item.key, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-center text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => updateSingleParam(item.key, params[item.key] + item.step)}
                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer transition active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Clicca per applicare le modifiche alla simulazione corrente</span>
              <button 
                onClick={initializeTeams} 
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> {t.applicaResetta}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
