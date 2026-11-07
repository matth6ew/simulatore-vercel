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
  BarChart2,
  LayoutGrid,
  Table as TableIcon
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

const TAPPA_FEDE = 2;
const TAPPA_CRISI_INTERMEDIA = 3;
const STORAGE_KEY = 'simulatore_squadre_params_v2';

// Tema narrativo di ogni tappa (round). La logica usa il numero di tappa; la "postazione" è solo il tavolo.
const TEMI = {
  istruzione: { icon: '🎓', it: 'Educazione e Formazione', zh: '教育与培训', d: { it: "Test d'ingresso. Tentazione: sbirciare la prova.", zh: '入学测试。诱惑：偷看试卷。' } },
  fede: { icon: '💍', it: 'Matrimonio e Relazioni (Fede)', zh: '婚姻与关系（信仰）', d: { it: 'Scelta della Fede e inizio del pagamento della Decima.', zh: '选择信仰并开始支付什一税。' } },
  crisi: { icon: '⚡', it: 'Finanza e Crisi Intermedia', zh: '金融与中期危机', d: { it: 'Catastrofe economica: tassa per tutte le squadre.', zh: '经济灾难：全员缴税。' } },
  lavoro: { icon: '💼', it: 'Lavoro e Carriera', zh: '工作与职业', d: { it: 'Promozione aziendale. Tentazione: boicottare i colleghi.', zh: '公司晋升。诱惑：排挤同事。' } },
  salute: { icon: '🏥', it: 'Salute e Benessere', zh: '健康与福祉', d: { it: "Lista d'attesa medica. Tentazione: raccomandazione.", zh: '医疗等待名单。诱惑：走后门。' } },
  amicizie: { icon: '🤝', it: 'Amicizie e Community', zh: '友谊与社群', d: { it: 'Mutuo soccorso tra squadre.', zh: '队伍间互助。' } },
  eredita: { icon: '🌟', it: 'Eredità e Futuro', zh: '传承与未来', d: { it: 'Passaggio generazionale e lascito.', zh: '代际传承与遗赠。' } },
  finale: { icon: '🏠', it: 'Famiglia e Crisi Finale', zh: '家庭与终极危机', d: { it: 'Crisi finale: la Chiesa copre i fedeli integrali.', zh: '终极危机：教会庇护虔诚信徒。' } }
};
const temaTappa = (round, max) => {
  if (round === 1) return TEMI.istruzione;
  if (round === 2) return TEMI.fede;
  if (round === 3) return TEMI.crisi;
  if (round === max) return TEMI.finale;
  return [TEMI.lavoro, TEMI.salute, TEMI.amicizie, TEMI.eredita][round - 4];
};

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
    puntiEgoistaLabel: "Punti Successo",
    moneteEgoistaLabel: "Monete Guadagnate",
    misericordiaEgoistaLabel: "Misericordia",
    puntiSolidaleLabel: "Punti Successo",
    moneteSolidaleLabel: "Monete Guadagnate",
    misericordiaSolidaleLabel: "Misericordia",
    applicaResetta: "Applica e Salva Impostazioni",
    ripristinaDefault: "Ripristina Default",
    teamPrefix: "Squadra",
    credente: "Ha scelto la Fede",
    climaNotaProssima: (n) => `Il clima vale dalla tappa ${n} in poi: le tappe già giocate non cambiano.`,
    climaNotaFine: "La simulazione è conclusa: il clima non ha più effetto.",
    prossimaLabel: "Etica delle squadre nella prossima tappa",
    prossimaTitle: "Etica usata nell'ultima tappa → prevista per la prossima",
    ordinaPer: "Ordina per",
    ordId: "Numero",
    filtroTutte: "Tutte",
    vistaCard: "Schede",
    vistaTabella: "Tabella",
    squadraCol: "Squadra",
    eticaCol: "Etica",
    avversarioCol: "Ultimo avversario",
    riepilogoLabels: { tentazioni: "tentazioni cedute", donazioni: "donazioni", rifiuti: "aiuti negati", chiesa: "soccorsi della Chiesa", bancarotte: "bancarotte", fede: "scelte di Fede" },
    riepilogoVuoto: "Nessun evento rilevante in questa tappa.",
    simulazioneConclusa: "Simulazione conclusa.",
    vediRisultato: "Vedi chi ha vinto davvero nelle Classifiche",
    titoloFinale: "Risultato finale: chi vince davvero?",
    finaleCoincidono: (n) => `${n} è prima sia per Successo sia per Misericordia: qui apparenza e realtà coincidono.`,
    finaleDivergono: (a, r, b) => `${a} vince per Successo, ma è solo ${r}ª per Misericordia. In testa alla classifica reale c'è ${b}.`,
    profiliMedie: "Media per profilo etico",
    rangoReale: (n) => `Reale #${n}`,
    rangoApp: (n) => `Apparente #${n}`,
    spostamentoTitle: "Posizioni guadagnate (▲) o perse (▼) rispetto alla classifica apparente",
    eticaNames: { VIRTUOSA: "VIRTUOSA", OPPORTUNISTA: "OPPORTUNISTA", EGOISTA: "EGOISTA" },
    skillNames: { ALTA: "ALTA", MEDIA: "MEDIA", BASSA: "BASSA" },
    descSquadra: (skill) => `Squadra con abilità nei minigiochi ${skill.toLowerCase()}.`,
    logs: {
      inOrario: (b) => `⚡ In orario (+${b} monete)`,
      inRitardo: "⏰ In ritardo (0 monete)",
      costoIngresso: (c) => `Costo ingresso (-${c} monete)`,
      vendutoSuccesso: (m) => `Venduto 1 Successo (-1 succ, +${m} monete)`,
      sceltoFede: "Ha scelto la Fede",
      rifiutatoFede: "Ha rifiutato la Fede",
      versataDecima: (d) => `Versata Decima (-${d} monete)`,
      decimaNonVersata: "Decima non versata",
      tentazioneAcquistata: (c, m) => `Tentazione acquistata (-${c} monete, -${m} misericordia)`,
      sconfittoMinigioco: "Sconfitto nel minigioco (0 guadagni)",
      crisi3Pagata: (c) => `⚡ CATASTROFE (Tappa 3): Pagata tassa (-${c} monete)`,
      crisi3Bancarotta: "⚡ CATASTROFE (Tappa 3): Bancarotta (0 monete)",
      crisiProtetto: "🔥 CRISI FINALE: Protetto dalla Chiesa (0 costo)",
      crisiPagata: (c) => `🔥 CRISI FINALE: Pagata tassa (-${c} monete)`,
      crisiBancarotta: "🔥 CRISI FINALE: Bancarotta (0 monete)",
      aiutoRicevuto: (m, opp) => `🤝 ${opp} ha accettato di aiutare (+${m} monete)`,
      aiutoDato: (m, nome, mis) => `🤝 Ha donato ${m} monete a ${nome} (+${mis} misericordia)`,
      aiutoRifiutato: (opp) => `❌ ${opp} ha rifiutato di aiutare`,
      aiutoNegato: (nome, pen) => `❌ Ha rifiutato di aiutare ${nome} (-${pen} misericordia)`,
      senzaFondi: (opp) => `${opp} non ha fondi per aiutare`,
      soccorsoChiesa: (m) => `⛪ Soccorso della Chiesa (+${m} monete)`,
      ingressoNonPagabile: "Ingresso non pagabile: monete azzerate",
      vantaggio: (p) => `⚡ Vantaggio attivo! Probabilità di vittoria: ${p}%`,
      solidaleVinta: (p, m, mis, nome) => `🤝 Vittoria Solidale: +${p} successo, +${m} monete a sé e a ${nome} (+${mis} misericordia)`,
      solidaleRicevuta: (nome, m) => `🎁 ${nome} ha condiviso la vittoria: +${m} monete`,
      egoistaVinta: (p, m, mis) => `🏆 Vittoria Egoista (+${p} successo, +${m} monete${mis ? `, ${mis > 0 ? '+' : ''}${mis} misericordia` : ''})`
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
    puntiEgoistaLabel: "成功点数",
    moneteEgoistaLabel: "金币",
    misericordiaEgoistaLabel: "仁慈",
    puntiSolidaleLabel: "成功点数",
    moneteSolidaleLabel: "金币",
    misericordiaSolidaleLabel: "仁慈",
    applicaResetta: "应用并保存配置",
    ripristinaDefault: "恢复默认设置",
    teamPrefix: "队伍",
    credente: "选择了信仰",
    climaNotaProssima: (n) => `气候从第 ${n} 阶段起生效，已进行的阶段不变。`,
    climaNotaFine: "模拟已结束：气候不再产生影响。",
    prossimaLabel: "下一阶段各队伍的伦理类型",
    prossimaTitle: "上一阶段所用类型 → 下一阶段预计类型",
    ordinaPer: "排序",
    ordId: "编号",
    filtroTutte: "全部",
    vistaCard: "卡片",
    vistaTabella: "表格",
    squadraCol: "队伍",
    eticaCol: "伦理",
    avversarioCol: "上一对手",
    riepilogoLabels: { tentazioni: "次屈服诱惑", donazioni: "次捐助", rifiuti: "次拒绝帮助", chiesa: "次教会救助", bancarotte: "次破产", fede: "人选择信仰" },
    riepilogoVuoto: "本阶段没有重要事件。",
    simulazioneConclusa: "模拟已结束。",
    vediRisultato: "在排行榜中查看真正的赢家",
    titoloFinale: "最终结果：谁才是真正的赢家？",
    finaleCoincidono: (n) => `${n} 在成功点数和仁慈上均排第一：表象与真实一致。`,
    finaleDivergono: (a, r, b) => `${a} 以成功点数获胜，但仁慈仅排第 ${r}。真实排行榜第一是 ${b}。`,
    profiliMedie: "各伦理类型平均值",
    rangoReale: (n) => `真实 #${n}`,
    rangoApp: (n) => `表观 #${n}`,
    spostamentoTitle: "相对表观排行榜上升(▲)或下降(▼)的名次",
    eticaNames: { VIRTUOSA: "美德", OPPORTUNISTA: "机会主义", EGOISTA: "利己" },
    skillNames: { ALTA: "高", MEDIA: "中", BASSA: "低" },
    descSquadra: (skill) => `具备${skill === 'ALTA' ? '高' : skill === 'MEDIA' ? '中' : '低'}能力的小游戏队伍。`,
    logs: {
      inOrario: (b) => `⚡ 准时 (+${b} 金币)`,
      inRitardo: "⏰ 迟到 (0 金币)",
      costoIngresso: (c) => `准入成本 (-${c} 金币)`,
      vendutoSuccesso: (m) => `出售 1 成功 (-1 成功, +${m} 金币)`,
      sceltoFede: "选择了信仰",
      rifiutatoFede: "拒绝了信仰",
      versataDecima: (d) => `缴纳什一税 (-${d} 金币)`,
      decimaNonVersata: "未缴纳什一税",
      tentazioneAcquistata: (c, m) => `购买诱惑 (-${c} 金币, -${m} 仁慈)`,
      sconfittoMinigioco: "小游戏败北 (0 收益)",
      crisi3Pagata: (c) => `⚡ 中期灾难 (第3阶段)：缴纳税款 (-${c} 金币)`,
      crisi3Bancarotta: "⚡ 中期灾难 (第3阶段)：破产 (0 金币)",
      crisiProtetto: "🔥 终极危机：获教会庇护 (0 成本)",
      crisiPagata: (c) => `🔥 终极危机：缴纳税款 (-${c} 金币)`,
      crisiBancarotta: "🔥 终极危机：破产 (0 金币)",
      aiutoRicevuto: (m, opp) => `🤝 ${opp} 同意帮助 (+${m} 金币)`,
      aiutoDato: (m, nome, mis) => `🤝 向 ${nome} 捐助 ${m} 金币 (+${mis} 仁慈)`,
      aiutoRifiutato: (opp) => `❌ ${opp} 拒绝帮助`,
      aiutoNegato: (nome, pen) => `❌ 拒绝帮助 ${nome} (-${pen} 仁慈)`,
      senzaFondi: (opp) => `${opp} 资金不足，无法帮助`,
      soccorsoChiesa: (m) => `⛪ 教会救助 (+${m} 金币)`,
      ingressoNonPagabile: "无法支付准入费：金币清零",
      vantaggio: (p) => `⚡ 优势生效！获胜概率：${p}%`,
      solidaleVinta: (p, m, mis, nome) => `🤝 互助胜利：+${p} 成功，自己与 ${nome} 各 +${m} 金币 (+${mis} 仁慈)`,
      solidaleRicevuta: (nome, m) => `🎁 ${nome} 分享了胜利：+${m} 金币`,
      egoistaVinta: (p, m, mis) => `🏆 利己胜利 (+${p} 成功, +${m} 金币${mis ? `, ${mis > 0 ? '+' : ''}${mis} 仁慈` : ''})`
    }
  }
};

const PROFILI_DEFAULT = {
  VIRTUOSA: { probFedePerc: 100, fedeSensClima: 0, fedeSicuraSeClimaOltre: 101, tentBasePerc: 0, tentSensClima: 0, tentSempreSeClimaSotto: -60, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 100, solSensClima: 0, solConTentPerc: 15, solConTentClimaMin: 40, solConTentMoneteMin: 0, aiutoPerc: 100, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: -101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 1 },
  OPPORTUNISTA: { probFedePerc: 50, fedeSensClima: 50, fedeSicuraSeClimaOltre: 101, tentBasePerc: 20, tentSensClima: 100, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 15, tentReagisce: 1, solSenzaTentPerc: 80, solSensClima: 20, solConTentPerc: 100, solConTentClimaMin: -101, solConTentMoneteMin: 20, aiutoPerc: 100, aiutoSeMoneteOltre: 20, aiutoSeClimaOltre: 20, decimaSaltaSeMoneteSotto: 15, vendeSuccessoPerDecima: 0 },
  EGOISTA: { probFedePerc: 0, fedeSensClima: 0, fedeSicuraSeClimaOltre: 80, tentBasePerc: 100, tentSensClima: 0, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 0, solSensClima: 0, solConTentPerc: 0, solConTentClimaMin: -101, solConTentMoneteMin: 0, aiutoPerc: 0, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: 101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 0 }
};

const DEFAULT_PARAMS = {
  numSquadre: 14,
  moneteBase: 0,
  bonusPuntualita: 4,
  probabilitaPuntualitaPerc: 70,
  costoIngressoTappa: 10,
  costoTentazione: 5,
  costoMisericordiaTentazione: 2,
  costoCrisiTappa3: 30,
  costoCrisiFinale: 50,
  valoreDecimaFissa: 5,
  moneteDaVenditaSuccesso: 40,
  puntiVittoriaEgoista: 2,
  moneteVittoriaEgoista: 30,
  misericordiaVittoriaEgoista: 0,
  puntiVittoriaSolidale: 1,
  moneteVittoriaSolidale: 15,
  misericordiaVittoriaSolidale: 1,
  climaMinSolidale: -80,
  probVantaggioPerc: 80,
  winAltaMedia: 60,
  winMediaBassa: 60,
  winAltaBassa: 70,
  chiesaSoccorre: 1,
  misAiutoIngresso: 1,
  misAiutoCrisi: 2,
  penalitaRifiuto: 1,
  eticitaGlobalePerc: 0,
  profili: PROFILI_DEFAULT
};

const caricaParams = () => {
  const m = JSON.parse(JSON.stringify(DEFAULT_PARAMS));
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('simulatore_squadre_params');
    if (!raw) return m;
    const o = JSON.parse(raw);
    Object.keys(DEFAULT_PARAMS).forEach(k => { if (k !== 'profili' && typeof o[k] === 'number') m[k] = o[k]; });
    if (typeof o.costoCrisiTappa7 === 'number' && typeof o.costoCrisiFinale !== 'number') m.costoCrisiFinale = o.costoCrisiTappa7;
    if (typeof o.opportunistaSogliaMonete === 'number') m.profili.OPPORTUNISTA.tentSeMoneteSotto = o.opportunistaSogliaMonete;
    if (typeof o.opportunistaReagisciAvversario === 'number') m.profili.OPPORTUNISTA.tentReagisce = o.opportunistaReagisciAvversario;
    if (typeof o.opportunistaProbabilitaRandomPerc === 'number') m.profili.OPPORTUNISTA.tentBasePerc = o.opportunistaProbabilitaRandomPerc;
    PROFILI_ETICI.forEach(e => Object.keys(m.profili[e]).forEach(k => { const v = o.profili?.[e]?.[k]; if (typeof v === 'number') m.profili[e][k] = v; }));
  } catch (e) { console.error('Impossibile caricare i parametri', e); }
  return m;
};

const getVal = (p, path) => {
  if (!path.includes('.')) return p[path];
  const [e, k] = path.split('.');
  return p.profili[e][k];
};
// firma dei parametri escluso il clima (che è pensato per essere modificato in tempo reale)
const firma = (p) => JSON.stringify({ ...p, eticitaGlobalePerc: 0 });

const generateDefaultArchetipi = (count) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, skill: SKILL_LEVELS[i % SKILL_LEVELS.length] }));

// Nome e testi si calcolano al render, così cambiare lingua non richiede di rigenerare la partita.
const nomeSquadra = (lang, s) => `${DIZIONARIO[lang].teamPrefix} ${s.id} (${NOMI_FISSI_PER_ETICA_E_SKILL[s.etica][s.skill][lang]})`;

// I log vengono salvati come eventi strutturati {k, a} (chiave + argomenti) e tradotti solo al render.
const LOG = new Proxy({}, {
  get: (_, k) => {
    const v = DIZIONARIO.it.logs[k];
    return typeof v === 'function' ? (...a) => ({ k, a }) : { k, a: [] };
  }
});
const testoLog = (lang, log) => {
  if (typeof log === 'string') return log;
  const v = DIZIONARIO[lang].logs[log.k];
  if (typeof v !== 'function') return v;
  return v(...log.a.map(x => (x && x.__team ? nomeSquadra(lang, x) : x)));
};

const f = (k, it, zh, h, min, max, step, u = '') => ({ k, it, zh, h, min, max, step, u });
const bl = (k, it, zh, h) => ({ k, it, zh, h, bool: true, min: 0, max: 1, step: 1 });

const CONFIG_SEZIONI = [
  { id: 'partita', it: 'Partita', zh: '对局', icon: Users, campi: [
    f('moneteBase', 'Monete iniziali (base)', '初始基础金币', 'Si somma a un extra casuale di 10, 20 o 30 monete per squadra.', 0, 200, 5, '💰'),
    f('probabilitaPuntualitaPerc', 'Probabilità di essere puntuali', '准时概率', 'Ogni squadra, a ogni tappa, può arrivare in orario e prendere il bonus.', 0, 100, 5, '%'),
    f('bonusPuntualita', 'Bonus puntualità', '准时奖励', 'Monete guadagnate arrivando in orario.', 0, 50, 1, '💰')
  ] },
  { id: 'economia', it: 'Economia', zh: '经济', icon: Scale, campi: [
    f('costoIngressoTappa', 'Costo di ingresso a ogni tappa', '阶段准入成本', 'Pagato da entrambe le squadre prima dello scontro.', 0, 100, 1, '💰'),
    f('valoreDecimaFissa', 'Decima (importo fisso)', '什一税金额', 'Pagata a ogni tappa da chi ha scelto la Fede.', 0, 50, 1, '💰'),
    f('moneteDaVenditaSuccesso', 'Monete ottenute vendendo 1 punto Successo', '出售成功点数所得金币', 'Usato quando una squadra non riesce a pagare un costo.', 0, 200, 5, '💰'),
    f('costoCrisiTappa3', 'Catastrofe di metà gioco (tappa 3)', '中期灾难成本', 'Tassa per tutte le squadre alla tappa 3.', 0, 200, 5, '💰'),
    f('costoCrisiFinale', 'Crisi finale (ultima tappa)', '终极危机成本', 'Non la paga chi ha scelto la Fede e ha versato tutte le decime.', 0, 200, 5, '💰')
  ] },
  { id: 'scontri', it: 'Scontri e vittorie', zh: '对抗与胜利', icon: Swords, campi: [
    f('winAltaMedia', 'Abilità ALTA contro MEDIA', '高对中', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('winMediaBassa', 'Abilità MEDIA contro BASSA', '中对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('winAltaBassa', 'Abilità ALTA contro BASSA', '高对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('probVantaggioPerc', 'Vittoria con Vantaggio (se lo compra solo una)', '独占优势获胜概率', 'Se entrambe lo comprano, conta solo l\'abilità.', 0, 100, 5, '%'),
    f('costoTentazione', 'Costo del Vantaggio (Tentazione)', '诱惑成本', 'Monete spese per comprare il Vantaggio.', 0, 50, 1, '💰'),
    f('costoMisericordiaTentazione', 'Misericordia persa con la Tentazione', '诱惑扣除仁慈', '', 0, 20, 1),
    f('puntiVittoriaEgoista', 'Vittoria egoista: punti Successo', '利己胜利：成功点数', '', 0, 20, 1),
    f('moneteVittoriaEgoista', 'Vittoria egoista: monete al vincitore', '利己胜利：金币', '', 0, 200, 5, '💰'),
    f('misericordiaVittoriaEgoista', 'Vittoria egoista: Misericordia', '利己胜利：仁慈', 'Può essere negativa.', -20, 20, 1),
    f('puntiVittoriaSolidale', 'Vittoria solidale: punti Successo', '互助胜利：成功点数', '', 0, 20, 1),
    f('moneteVittoriaSolidale', 'Vittoria solidale: monete a testa', '互助胜利：金币', 'Le riceve sia il vincitore sia lo sconfitto.', 0, 200, 5, '💰'),
    f('misericordiaVittoriaSolidale', 'Vittoria solidale: Misericordia', '互助胜利：仁慈', '', -20, 20, 1),
    f('climaMinSolidale', 'Clima minimo per la vittoria solidale', '互助所需最低气候', 'Sotto questo clima nessuno sceglie la solidarietà.', -100, 100, 5, '%')
  ] },
  { id: 'aiuti', it: 'Aiuti e Chiesa', zh: '援助与教会', icon: Heart, campi: [
    bl('chiesaSoccorre', 'La Chiesa copre chi non può pagare', '教会救助无力支付者', 'Se attiva, quando l\'avversario non aiuta (o non può) la Chiesa versa l\'importo mancante. Se spenta, la squadra paga solo quello che ha.'),
    f('misAiutoIngresso', 'Misericordia a chi aiuta (ingresso)', '帮助者所得仁慈（准入）', 'Gli aiuti sono donazioni: non vanno restituiti.', 0, 10, 1),
    f('misAiutoCrisi', 'Misericordia a chi aiuta (catastrofe)', '帮助者所得仁慈（灾难）', '', 0, 10, 1),
    f('penalitaRifiuto', 'Misericordia persa se rifiuta di aiutare', '拒绝帮助扣除仁慈', 'Vale solo se poteva permetterselo.', 0, 10, 1)
  ] },
  { id: 'personaggi', it: 'Personaggi', zh: '角色', icon: Compass, campi: [] }
];

const GRUPPI_PERSONAGGIO = [
  { id: 'fede', it: 'Fede e Decima', zh: '信仰与什一税', campi: [
    f('probFedePerc', 'Probabilità di scegliere la Fede', '选择信仰概率', 'Valore di partenza, a clima neutro.', 0, 100, 5, '%'),
    f('fedeSensClima', 'Effetto del clima sulla Fede', '气候对信仰的影响', 'Punti % aggiunti con clima +100% (negativi se il clima è egoista).', -100, 100, 5, '%'),
    f('fedeSicuraSeClimaOltre', 'Sceglie sempre la Fede se il clima è almeno', '气候不低于此值则必选信仰', '101 = mai.', -100, 101, 1, '%'),
    f('decimaSaltaSeMoneteSotto', 'Salta la Decima se ha meno di', '金币低于此值则不缴什一税', '0 = la paga sempre che possa.', 0, 100, 1, '💰'),
    bl('vendeSuccessoPerDecima', 'Vende Successo pur di pagare la Decima', '为缴什一税出售成功点数', 'Altrimenti rinuncia alla Decima.')
  ] },
  { id: 'tentazione', it: 'Tentazione (Vantaggio)', zh: '诱惑（优势）', campi: [
    f('tentBasePerc', 'Probabilità di cedere', '屈服概率', 'Valore di partenza, a clima neutro.', 0, 100, 5, '%'),
    f('tentSensClima', 'Quanto il clima virtuoso la riduce', '美德气候降低程度', '100 = a clima +100% non cede mai (a -100% raddoppia).', -100, 100, 5, '%'),
    f('tentSempreSeClimaSotto', 'Cede sempre se il clima è sotto', '气候低于此值必屈服', '-101 = mai.', -101, 100, 1, '%'),
    f('tentSeMoneteSotto', 'Cede sempre se ha meno di', '金币低于此值必屈服', '0 = disattivato.', 0, 100, 1, '💰'),
    bl('tentReagisce', 'Cede se l\'avversario lo ha fatto', '对手屈服则跟进', 'Reagisce alla scelta dell\'avversario nello stesso scontro.')
  ] },
  { id: 'vittoria', it: 'Quando vince', zh: '获胜时', campi: [
    f('solSenzaTentPerc', 'Probabilità di vittoria solidale', '互助胜利概率', 'Se ha vinto senza comprare il Vantaggio.', 0, 100, 5, '%'),
    f('solSensClima', 'Effetto del clima sulla solidarietà', '气候对互助的影响', 'Punti % aggiunti con clima +100%.', -100, 100, 5, '%'),
    f('solConTentPerc', 'Probabilità di solidarietà dopo aver comprato il Vantaggio', '购买优势后互助概率', '', 0, 100, 5, '%'),
    f('solConTentClimaMin', '…solo se il clima supera', '…仅当气候高于', '-101 = sempre.', -101, 100, 1, '%'),
    f('solConTentMoneteMin', '…solo se ha almeno', '…仅当金币不少于', '0 = sempre.', 0, 200, 1, '💰')
  ] },
  { id: 'aiuto', it: 'Aiuto agli altri', zh: '帮助他人', campi: [
    f('aiutoPerc', 'Probabilità di aiutare chi è in difficoltà', '帮助困难者概率', 'Se le condizioni qui sotto sono soddisfatte.', 0, 100, 5, '%'),
    f('aiutoSeMoneteOltre', 'Aiuta se ha più di', '金币多于此值则帮助', 'Basta una delle due condizioni.', 0, 200, 1, '💰'),
    f('aiutoSeClimaOltre', 'oppure se il clima supera', '或气候高于', '101 = mai, -101 = sempre.', -101, 101, 1, '%')
  ] }
];

const PROFILI_INFO = {
  VIRTUOSA: { it: 'Virtuosi', zh: '美德队', d: { it: 'Cercano solidarietà: aiutano, dividono le vittorie e resistono alle tentazioni.', zh: '寻求团结：帮助他人、分享胜利、抵制诱惑。' }, stile: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
  OPPORTUNISTA: { it: 'Opportunisti', zh: '机会主义队', d: { it: 'Si adattano: cedono alle tentazioni se sono in difficoltà o se lo fa l\'avversario.', zh: '随机应变：处境困难或对手屈服时会屈服。' }, stile: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
  EGOISTA: { it: 'Egoisti', zh: '利己队', d: { it: 'Puntano al proprio vantaggio: tentazione sempre, mai solidali, non aiutano.', zh: '只顾自身利益：总是屈服、从不互助、不帮助他人。' }, stile: 'bg-rose-500/20 text-rose-300 border-rose-500/50' }
};

const ETICA_BADGE = {
  VIRTUOSA: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  OPPORTUNISTA: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  EGOISTA: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
};

// Variazione rispetto alla tappa precedente: la freccia comunica la direzione anche senza il colore.
function Delta({ v, title }) {
  if (!v) return null;
  return <span title={title} className={`ml-1 text-[10px] font-bold ${v > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{v > 0 ? '▲' : '▼'}{Math.abs(v)}</span>;
}

function ConfigField({ def, value, defaultValue, onChange, lang }) {
  const modificato = value !== defaultValue;
  const [bozza, setBozza] = useState(String(value));
  useEffect(() => { setBozza(String(value)); }, [value]);
  const limita = (n) => Math.min(def.max, Math.max(def.min, n));
  const conferma = (v) => {
    const n = Number(v);
    if (v.trim() === '' || Number.isNaN(n)) { setBozza(String(value)); return; }
    const ok = limita(Math.round(n));
    onChange(ok);
    setBozza(String(ok));
  };
  const btn = 'w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer transition active:scale-95';
  return (
    <div className={`rounded-2xl border p-4 space-y-2.5 ${modificato ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-semibold text-slate-200 leading-snug">{lang === 'zh' ? def.zh : def.it}</span>
        {modificato && (
          <button onClick={() => onChange(defaultValue)} title={lang === 'zh' ? '恢复默认' : `Ripristina (${defaultValue})`} className="text-[10px] font-bold text-indigo-300 hover:text-white shrink-0 cursor-pointer">
            ↺ {defaultValue}
          </button>
        )}
      </div>
      {def.h && lang !== 'zh' && <p className="text-[11px] text-slate-400 leading-snug">{def.h}</p>}
      {def.bool ? (
        <button onClick={() => onChange(value === 1 ? 0 : 1)} className={`w-full py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition ${value === 1 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {value === 1 ? (lang === 'zh' ? '开启' : 'Attivo') : (lang === 'zh' ? '关闭' : 'Disattivo')}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button aria-label="-" onClick={() => onChange(limita(value - def.step))} className={btn}>−</button>
            <div className="relative flex-1">
              <input type="text" inputMode="numeric" value={bozza} onChange={e => setBozza(e.target.value)} onBlur={e => conferma(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') conferma(bozza); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500" />
              {def.u && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 pointer-events-none">{def.u}</span>}
            </div>
            <button aria-label="+" onClick={() => onChange(limita(value + def.step))} className={btn}>+</button>
          </div>
          {def.u === '%' && <input type="range" min={def.min} max={def.max} step={def.step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('it');
  const t = DIZIONARIO[lang];

  const [params, setParams] = useState(caricaParams);
  const [configCategory, setConfigCategory] = useState('partita');
  const [profiloAttivo, setProfiloAttivo] = useState('VIRTUOSA');
  const [confermaReset, setConfermaReset] = useState(false);
  const [paramsAvvio, setParamsAvvio] = useState('');
  const [riavvio, setRiavvio] = useState(0); // incrementato per far ripartire la partita con i parametri aggiornati

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(params)); } catch (e) { console.error('Impossibile salvare i parametri', e); }
  }, [params]);

  const setParam = (path, raw) => setParams(prev => {
    const v = Number(raw);
    if (Number.isNaN(v)) return prev;
    if (!path.includes('.')) return { ...prev, [path]: v };
    const [e, k] = path.split('.');
    return { ...prev, profili: { ...prev.profili, [e]: { ...prev.profili[e], [k]: v } } };
  });
  const ripristina = (paths) => paths.forEach(p => setParam(p, getVal(DEFAULT_PARAMS, p)));
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
  const [squadre, setSquadre] = useState([]);
  const [history, setHistory] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [ordinaPer, setOrdinaPer] = useState('id');
  const [filtroEtica, setFiltroEtica] = useState('TUTTE');
  const [vistaTabellone, setVistaTabellone] = useState('card');

  const handleSelectNumSquadre = (count) => {
    if (![12, 14, 16].includes(count)) return;
    if (count === params.numSquadre) return;
    setParams(p => ({ ...p, numSquadre: count }));
    setRiavvio(n => n + 1);
  };

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
    return getDistribuzioneEsatta(params.eticitaGlobalePerc, params.numSquadre);
  }, [getDistribuzioneEsatta, params.eticitaGlobalePerc, params.numSquadre]);

  const getEticaEffettivaSquadra = useCallback((index, totalTeams, globalPerc) => {
    const counts = getDistribuzioneEsatta(globalPerc, totalTeams);
    if (index < counts.VIRTUOSA) return 'VIRTUOSA';
    if (index < counts.VIRTUOSA + counts.OPPORTUNISTA) return 'OPPORTUNISTA';
    return 'EGOISTA';
  }, [getDistribuzioneEsatta]);

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
  }, [params.numSquadre, maxTappe]);

  const initializeTeams = useCallback(() => {
    const n = params.numSquadre;
    const newSquadre = generateDefaultArchetipi(n).map(arch => {
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

    setSquadre(newSquadre);
    setParamsAvvio(firma(params));
    setCurrentTappa(0);
    setViewedTappa(0);
    setHistory([{ tappa: 0, squadre: newSquadre.map(s => ({ ...s })) }]);
    setEventLogs([{ tappa: 0, testo: `Simulazione inizializzata!` }]);
  }, [params, getEticaEffettivaSquadra]);

  // Parte al montaggio e ogni volta che `riavvio` cambia (nuovo numero di squadre, reset). Non dipende dalla lingua.
  useEffect(() => {
    initializeTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riavvio]);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = (perc) => Math.random() * 100 < perc;
  const profiloDi = (etica) => params.profili[etica];

  const probVittoria = (a, b, cedeA, cedeB) => {
    if (cedeA && !cedeB) return params.probVantaggioPerc / 100;
    if (!cedeA && cedeB) return 1 - params.probVantaggioPerc / 100;
    if (a.skill === b.skill) return 0.5;
    const forza = { ALTA: 3, MEDIA: 2, BASSA: 1 };
    const aForte = forza[a.skill] > forza[b.skill];
    const [forte, debole] = aForte ? [a.skill, b.skill] : [b.skill, a.skill];
    const p = (forte === 'ALTA' && debole === 'MEDIA' ? params.winAltaMedia : forte === 'MEDIA' ? params.winMediaBassa : params.winAltaBassa) / 100;
    return aForte ? p : 1 - p;
  };

  const simulateSingleTappa = (tappaNumber, currentSquadreMap) => {
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

    scheduleMatchmaking[tappaNumber - 1].matches.forEach(match => {
      const tA = map.get(match.teamAId), tB = map.get(match.teamBId);
      if (!tA || !tB) return;
      const mk = (t, opp) => ({ t, opp, log: [], cede: false, etica: getEticaEffettivaSquadra(t.id - 1, tot, clima), oppS: null });
      const A = mk(tA, tB), B = mk(tB, tA);
      A.oppS = B; B.oppS = A;
      const entrambi = [A, B];
      const ref = (S) => ({ __team: true, id: S.t.id, skill: S.t.skill, etica: S.etica });
      // l'ordine casuale evita che la squadra "A" sia sempre avvantaggiata nelle fasi sequenziali
      const ordineCasuale = () => (Math.random() < 0.5 ? [A, B] : [B, A]);
      entrambi.forEach(S => S.log.push(S.t.ePuntualeInQuestaTappa ? L.inOrario(params.bonusPuntualita) : L.inRitardo));

      // Aiuto dell'avversario (donazione, non va restituita) e, se necessario, soccorso della Chiesa
      const richiediAiuto = (S, importo, misAcc) => {
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

      const pagaCosto = (S, costo, misAcc, logOk, logKo) => {
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

      // Tentazione: UNA sola estrazione casuale per squadra; poi l'eventuale reazione all'avversario
      const vuoleBase = (S) => {
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

      const pA = probVittoria(tA, tB, A.cede, B.cede);
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

      entrambi.forEach(S => { S.t.etica = S.etica; }); // l'etica effettivamente usata in questa tappa
      entrambi.forEach(S => S.t.storiaTappe.push({ tappa: tappaNumber, vs: ref(S.oppS), monete: S.t.monete, successo: S.t.puntiSuccesso, misericordia: S.t.puntiMisericordia, logs: S.log }));
    });

    return { updatedMap: map, logs: currentLogs };
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

  // Etica mostrata = quella USATA nell'ultima tappa giocata. L'etica prevista dal clima attuale vale dalla prossima tappa.
  // Prima della tappa 1 non c'è nulla di "usato": si mostra direttamente quella prevista.
  const displayedSquadre = useMemo(() => {
    const snapshot = history.find(h => h.tappa === viewedTappa);
    const base = snapshot ? snapshot.squadre : squadre;
    const prec = history.find(h => h.tappa === viewedTappa - 1);
    const precMap = prec ? new Map(prec.squadre.map(x => [x.id, x])) : null;
    const conDelta = base.map(sq => {
      const p = precMap ? precMap.get(sq.id) : null;
      return { ...sq, delta: p ? { monete: sq.monete - p.monete, successo: sq.puntiSuccesso - p.puntiSuccesso, misericordia: sq.puntiMisericordia - p.puntiMisericordia } : null };
    });
    if (viewedTappa !== currentTappa) return conDelta;
    const prevista = (sq) => getEticaEffettivaSquadra(sq.id - 1, base.length, params.eticitaGlobalePerc);
    return conDelta.map(sq => currentTappa === 0
      ? { ...sq, etica: prevista(sq), eticaProssima: null }
      : { ...sq, eticaProssima: currentTappa < maxTappe ? prevista(sq) : null });
  }, [history, viewedTappa, currentTappa, maxTappe, squadre, params.eticitaGlobalePerc, getEticaEffettivaSquadra]);

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
    const cmp = {
      id: (a, b) => a.id - b.id,
      successo: (a, b) => b.puntiSuccesso - a.puntiSuccesso || b.monete - a.monete,
      misericordia: (a, b) => b.puntiMisericordia - a.puntiMisericordia || b.monete - a.monete,
      monete: (a, b) => b.monete - a.monete
    };
    return l.sort(cmp[ordinaPer]);
  }, [displayedSquadre, filtroEtica, ordinaPer]);

  // Cosa è successo nella tappa visualizzata, contando i log strutturati di tutte le squadre.
  const riepilogoTappa = useMemo(() => {
    if (viewedTappa === 0) return null;
    const r = { tentazioni: 0, donazioni: 0, rifiuti: 0, chiesa: 0, bancarotte: 0, fede: 0 };
    displayedSquadre.forEach(x => {
      const st = x.storiaTappe.find(e => e.tappa === viewedTappa);
      if (!st) return;
      st.logs.forEach(l => {
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
      const avg = (fn) => (g.length ? g.reduce((a, x) => a + fn(x), 0) / g.length : null);
      return { etica: e, n: g.length, monete: avg(x => x.monete), successo: avg(x => x.puntiSuccesso), misericordia: avg(x => x.puntiMisericordia) };
    });
    return { primoApp, primoReale, rangoRealeDelPrimoApp: rangoReale.get(primoApp.id), profili };
  }, [finito, classificaApparente, classificaReale, displayedSquadre, rangoReale]);

  const renderFinale = () => {
    if (!riepilogoFinale) return null;
    const { primoApp, primoReale, rangoRealeDelPrimoApp, profili } = riepilogoFinale;
    const coincidono = primoApp.id === primoReale.id;
    const fmt = (v) => (v === null ? '—' : v.toFixed(1));
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
            {profili.map(pr => (
              <div key={pr.etica} className={`rounded-2xl border p-4 ${ETICA_BADGE[pr.etica]}`}>
                <div className="text-xs font-extrabold">{t.eticaNames[pr.etica]} · {pr.n} {t.squadreWord}</div>
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
        )}

        {/* TAB 1. TABELLONE SQUADRE */}
        {activeTab === 'simulatore' && (
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
                  {voci.map(([k, n]) => <span key={k} className="text-slate-300"><b className="text-amber-300">{n}</b> {t.riepilogoLabels[k]}</span>)}
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
                  <button key={e} aria-pressed={filtroEtica === e} onClick={() => setFiltroEtica(e)} className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${filtroEtica === e ? (e === 'TUTTE' ? 'bg-indigo-600 text-white' : `${ETICA_BADGE[e]} border`) : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{e === 'TUTTE' ? t.filtroTutte : t.eticaNames[e]}</button>
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
                    {squadreVisibili.map(s => {
                      const ultimo = s.storiaTappe.find(e => e.tappa === viewedTappa);
                      return (
                        <tr key={s.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-semibold text-slate-100 whitespace-nowrap">{nomeSquadra(lang, s)} {s.haSceltoDiCredere && <span title={t.credente}>🙏</span>}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${ETICA_BADGE[s.etica]}`}>{t.eticaNames[s.etica]}</span>
                            {s.eticaProssima && s.eticaProssima !== s.etica && <span title={t.prossimaTitle} className={`ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-dashed ${ETICA_BADGE[s.eticaProssima]}`}>→ {t.eticaNames[s.eticaProssima]}</span>}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">{t.skillNames[s.skill]}</td>
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
            {squadreVisibili.map(s => (
              <div key={s.id} className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">{nomeSquadra(lang, s)}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${ETICA_BADGE[s.etica]}`}>{t.eticaNames[s.etica]}</span>
                        {s.eticaProssima && s.eticaProssima !== s.etica && (
                          <span title={t.prossimaTitle} className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-dashed uppercase tracking-wider ${ETICA_BADGE[s.eticaProssima]}`}>→ {t.eticaNames[s.eticaProssima]}</span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-slate-300">
                          {t.skillLabel}: {t.skillNames[s.skill]}
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
                        {s.storiaTappe[s.storiaTappe.length - 1].logs.map((log, idx) => (
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
        )}

        {/* TAB 2. MATCHMAKING BERGER */}
        {activeTab === 'matchmaking' && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Grid className="w-5 h-5 text-indigo-400" /> {t.matriceBerger}</h2>
              <span className="text-xs text-slate-400">{t.partecipantiBerger(params.numSquadre, maxTappe)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {scheduleMatchmaking.map(roundObj => {
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
                      {roundObj.matches.map(m => (
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
        )}

        {/* TAB 3. CLASSIFICHE */}
        {activeTab === 'classifica' && (
          <div className="space-y-6">
          {renderFinale()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
              <h3 className="font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> {t.classificaApparente}
              </h3>
              <div className="space-y-2.5">
                {classificaApparente.map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center py-3 px-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs shadow-sm">
                    <span className="font-extrabold text-slate-400 w-6 text-sm">{idx + 1}.</span>
                    <span className="font-semibold text-slate-200 flex-1 truncate">{nomeSquadra(lang, s)}</span>
                    <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mr-2 ${ETICA_BADGE[s.etica]}`}>{t.eticaNames[s.etica]}</span>
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
                {classificaReale.map((s, idx) => (
                  <div key={s.id} className={`flex justify-between items-center py-3 px-4 rounded-2xl text-xs border shadow-sm ${idx === 0 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/20' : 'bg-slate-950/70 border-slate-800 text-slate-200'}`}>
                    <span className="font-extrabold text-emerald-400 w-6 text-sm">{idx + 1}.</span>
                    <span className="font-semibold flex-1 truncate">{nomeSquadra(lang, s)}</span>
                    <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mr-2 ${ETICA_BADGE[s.etica]}`}>{t.eticaNames[s.etica]}</span>
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
        {activeTab === 'impostazioni' && (() => {
          const tx = (it, zh) => (lang === 'zh' ? zh : it);
          const sez = CONFIG_SEZIONI.find(x => x.id === configCategory) || CONFIG_SEZIONI[0];
          const pathsProfilo = GRUPPI_PERSONAGGIO.flatMap(g => g.campi.map(c => `${profiloAttivo}.${c.k}`));
          const pathsSezione = sez.id === 'personaggi' ? pathsProfilo : sez.campi.map(c => c.k);
          const campo = (def, path) => (
            <ConfigField key={path} def={def} lang={lang} value={getVal(params, path)} defaultValue={getVal(DEFAULT_PARAMS, path)} onChange={v => setParam(path, v)} />
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
                    <span className="text-xs text-amber-200">{tx('Hai cambiato le regole dopo l\'avvio: valgono dalla prossima tappa, ma le tappe già giocate usavano le vecchie.', '开局后规则已更改：从下一阶段起生效，已进行的阶段仍使用旧规则。')}</span>
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
                        <button key={e} onClick={() => setProfiloAttivo(e)} className={`px-3 py-3 rounded-2xl border text-xs font-extrabold cursor-pointer transition ${profiloAttivo === e ? PROFILI_INFO[e].stile + ' ring-1 ring-white/10' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                          {tx(PROFILI_INFO[e].it, PROFILI_INFO[e].zh)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3">{PROFILI_INFO[profiloAttivo].d[lang]} <span className="text-slate-500">{tx('Il clima globale (−100% … +100%) è quello impostato nel Tabellone.', '全局气候（−100% … +100%）在面板中设置。')}</span></p>
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
        })()}

      </main>
    </div>
  );
}
