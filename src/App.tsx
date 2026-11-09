import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Table as TableIcon,
  ToggleRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TAPPA_FEDE = 2;
const TAPPA_CRISI_INTERMEDIA = 3;
const STORAGE_KEY = 'simulatore_squadre_params_v3';
const STORAGE_KEY_V2 = 'simulatore_squadre_params_v2';

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
const temaTappa = (round, max, p) => {
  const base = round === 1 ? TEMI.istruzione
    : round === 2 ? TEMI.fede
    : round === 3 ? TEMI.crisi
    : round === max ? TEMI.finale
    : [TEMI.lavoro, TEMI.salute, TEMI.amicizie, TEMI.eredita][round - 4];
  if (!p) return base;
  // Se una regola è disattivata la descrizione lo dice, invece di raccontare un evento che non accade.
  if (round === 2 && p.usaFede !== 1) return { ...base, d: { it: 'Tappa normale: Fede e Decima sono disattivate.', zh: '普通阶段：信仰与什一税已停用。' } };
  if (round === 3 && p.usaCatastrofi !== 1) return { ...base, d: { it: 'Tappa normale: la catastrofe è disattivata.', zh: '普通阶段：灾难已停用。' } };
  if (round === max && p.usaCatastrofi !== 1) return { ...base, d: { it: 'Ultima tappa: la crisi finale è disattivata.', zh: '最后阶段：终极危机已停用。' } };
  return base;
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
    classificaApparente: "Classifica Pubblica (Monete)",
    classificaReale: "Classifica Nascosta (Punti Misericordia, spareggio: monete)",
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
    badge: "Badge",
    titoloFinaleBadge: "Risultato finale: chi prende il badge?",
    finaleBadge: (n, tot) => `Il badge va alle prime ${n} squadre su ${tot} per Misericordia.`,
    finaleBadgeParita: "Attenzione: c'è un pari merito sull'ultimo posto utile. Le squadre in parità sono segnate con 🏅~.",
    badgeTitle: "Riceve il badge",
    badgeParitaTitle: "Pari merito sul limite del badge: il posto si divide",
    analisiColBadge: "Con badge",
    analisiGraficoBadge: "Squadre del profilo con badge",
    analisiNotaBadge: "Con badge = percentuale delle squadre di quel profilo che arriva tra le prime N per Misericordia. Se più squadre sono pari merito sul limite, i posti rimasti si dividono in parti uguali.",
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
    analisi: "Analisi",
    analisiTitolo: "Analisi su molte partite",
    analisiDesc: (c) => `Una sola partita dipende molto dal caso. Qui vengono simulate molte partite complete con le regole attuali e un clima del ${c}.`,
    analisiNumero: "Numero di partite",
    analisiMescola: "Mescola abilità e profili a ogni partita",
    analisiMescolaHint: "Abilità e profilo etico vengono assegnati a caso alle squadre a ogni partita. Senza mescolare, il calendario è fisso: ogni profilo incontrerebbe sempre gli stessi avversari e avrebbe sempre le stesse combinazioni di abilità.",
    analisiAvvia: "Avvia analisi",
    analisiAnnulla: "Annulla",
    analisiProgresso: (d, tot) => `${d} / ${tot} partite`,
    analisiObsoleta: "Regole o clima sono cambiati dopo questa analisi: rilancia per aggiornarla.",
    analisiDivergenza: (p, n) => `In ${p}% delle ${n} partite la squadra prima per Monete non è la prima per Misericordia.`,
    analisiTabellaTitolo: "Medie per profilo etico (± variazione tra partite)",
    analisiColSquadre: "Squadre",
    analisiColApp: "1° per Monete",
    analisiColReale: "1° per Misericordia",
    analisiGrafico: "Primo posto e badge per profilo etico",
    analisiGraficoApp: "Primo per Monete",
    analisiGraficoReale: "Primo per Misericordia",
    analisiNotaSD: "± indica la deviazione standard della media del profilo tra le partite. Un profilo con più squadre ha più possibilità di arrivare primo: confrontalo con la colonna Squadre. In caso di parità perfetta (stessi punti e stesse monete) il primo posto è diviso in parti uguali tra le squadre a pari merito.",
    avversarioCol: "Ultimo avversario",
    riepilogoLabels: { tentazioni: "tentazioni cedute", donazioni: "donazioni", rifiuti: "aiuti negati", chiesa: "soccorsi della Chiesa", bancarotte: "bancarotte", fede: "scelte di Fede", offerte: "offerte del premio" },
    riepilogoVuoto: "Nessun evento rilevante in questa tappa.",
    simulazioneConclusa: "Simulazione conclusa.",
    vediRisultato: "Vedi chi ha vinto davvero nelle Classifiche",
    titoloFinale: "Risultato finale: chi vince davvero?",
    finaleCoincidono: (n) => `${n} è prima sia per Monete sia per Misericordia: qui apparenza e realtà coincidono.`,
    finaleDivergono: (a, r, b) => `${a} è la più ricca (classifica pubblica), ma è solo ${r}ª per Misericordia. In testa alla classifica nascosta c'è ${b}.`,
    profiliMedie: "Media per profilo etico",
    rangoReale: (n) => `Nascosta #${n}`,
    rangoApp: (n) => `Pubblica #${n}`,
    spostamentoTitle: "Posizioni guadagnate (▲) o perse (▼) rispetto alla classifica pubblica",
    eticaNames: { VIRTUOSA: "VIRTUOSA", OPPORTUNISTA: "OPPORTUNISTA", EGOISTA: "EGOISTA" },
    skillNames: { ALTA: "ALTA", MEDIA: "MEDIA", BASSA: "BASSA" },
    descSquadra: (skill) => `Squadra con abilità nei minigiochi ${skill.toLowerCase()}.`,
    logs: {
      onesto: (m) => `✅ Nessun imbroglio (+${m} misericordia)`,
      imbrogliato: (m) => `🎭 Ha ceduto alla tentazione (-${m} misericordia)`,
      premioVincitore: (m, p) => `🏆 Vittoria (+${m} monete${p ? `, +${p} successo` : ''})`,
      premioPerdente: (m) => `Sconfitto nel minigioco (+${m} monete)`,
      offertaFatta: (c, m) => `🙏 Ha offerto ${c} monete (+${m} misericordia)`,
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
      solidaleVinta: (p, m, mis, nome) => `🤝 Vittoria Solidale: ${p ? `+${p} successo, ` : ''}+${m} monete a sé e a ${nome} (+${mis} misericordia)`,
      solidaleRicevuta: (nome, m) => `🎁 ${nome} ha condiviso la vittoria: +${m} monete`,
      egoistaVinta: (p, m, mis) => `🏆 Vittoria Egoista (${p ? `+${p} successo, ` : ''}+${m} monete${mis ? `, ${mis > 0 ? '+' : ''}${mis} misericordia` : ''})`
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
    misericordia: "良善忠心分",
    attesaTurno: "等待回合中...",
    matriceBerger: "配对矩阵（贝尔格系统）",
    partecipantiBerger: (num, tappe) => `${num}支参赛队伍 • ${tappe}个阶段无轮空`,
    roundTappa: (r) => `阶段 ${r}`,
    correnteBadge: "当前",
    classificaApparente: "公开排行榜（金币）",
    classificaReale: "隐藏排行榜（良善忠心分，平局以金币决胜）",
    moneteMedieEtico: "各伦理档案平均金币",
    successoMedieEtico: "各伦理档案平均成功点数",
    misericordiaMedieEtico: "各伦理档案平均良善忠心分",
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
    misericordiaEgoistaLabel: "良善忠心分",
    puntiSolidaleLabel: "成功点数",
    moneteSolidaleLabel: "金币",
    misericordiaSolidaleLabel: "良善忠心分",
    applicaResetta: "应用并保存配置",
    ripristinaDefault: "恢复默认设置",
    teamPrefix: "队伍",
    badge: "徽章",
    titoloFinaleBadge: "最终结果：谁拿到徽章？",
    finaleBadge: (n, tot) => `徽章授予 ${tot} 支队伍中良善忠心分排名前 ${n} 的队伍。`,
    finaleBadgeParita: "注意：最后一个徽章名额出现并列。并列队伍标记为 🏅~。",
    badgeTitle: "获得徽章",
    badgeParitaTitle: "徽章名额并列：名额平分",
    analisiColBadge: "获得徽章",
    analisiGraficoBadge: "该类型获得徽章的队伍比例",
    analisiNotaBadge: "获得徽章 = 该类型队伍进入良善忠心分前 N 名的比例。若多支队伍在名额边界并列，剩余名额平分。",
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
    analisi: "分析",
    analisiTitolo: "多局对局分析",
    analisiDesc: (c) => `单局结果很大程度取决于运气。这里按当前规则和 ${c} 的气候模拟多局完整对局。`,
    analisiNumero: "对局数量",
    analisiMescola: "每局随机打乱能力与伦理类型",
    analisiMescolaHint: "每局随机把能力和伦理类型分配给各队。不打乱的话，赛程是固定的：各类型总会遇到相同的对手，也总带着固定的能力组合。",
    analisiAvvia: "开始分析",
    analisiAnnulla: "取消",
    analisiProgresso: (d, tot) => `${d} / ${tot} 局`,
    analisiObsoleta: "规则或气候在本次分析后已更改：请重新运行以更新。",
    analisiDivergenza: (p, n) => `在 ${n} 局中，有 ${p}% 的对局里金币第一的队伍不是良善忠心分第一。`,
    analisiTabellaTitolo: "各伦理类型平均值（± 局间波动）",
    analisiColSquadre: "队伍数",
    analisiColApp: "金币第一",
    analisiColReale: "良善忠心分第一",
    analisiGrafico: "各类型夺冠与获徽章比例",
    analisiGraficoApp: "金币第一",
    analisiGraficoReale: "良善忠心分第一",
    analisiNotaSD: "± 表示各局中该类型平均值的标准差。队伍更多的类型更容易夺冠，请与“队伍数”列对照。若出现完全并列（积分与金币都相同），第一名由并列队伍平分。",
    avversarioCol: "上一对手",
    riepilogoLabels: { tentazioni: "次屈服诱惑", donazioni: "次捐助", rifiuti: "次拒绝帮助", chiesa: "次教会救助", bancarotte: "次破产", fede: "人选择信仰", offerte: "次奉献" },
    riepilogoVuoto: "本阶段没有重要事件。",
    simulazioneConclusa: "模拟已结束。",
    vediRisultato: "在排行榜中查看真正的赢家",
    titoloFinale: "最终结果：谁才是真正的赢家？",
    finaleCoincidono: (n) => `${n} 在金币和良善忠心分上均排第一：表象与真实一致。`,
    finaleDivergono: (a, r, b) => `${a} 金币最多（公开排行榜），但良善忠心分仅排第 ${r}。隐藏排行榜第一是 ${b}。`,
    profiliMedie: "各伦理类型平均值",
    rangoReale: (n) => `隐藏 #${n}`,
    rangoApp: (n) => `公开 #${n}`,
    spostamentoTitle: "相对公开排行榜上升(▲)或下降(▼)的名次",
    eticaNames: { VIRTUOSA: "美德", OPPORTUNISTA: "机会主义", EGOISTA: "利己" },
    skillNames: { ALTA: "高", MEDIA: "中", BASSA: "低" },
    descSquadra: (skill) => `具备${skill === 'ALTA' ? '高' : skill === 'MEDIA' ? '中' : '低'}能力的小游戏队伍。`,
    logs: {
      onesto: (m) => `✅ 没有作弊 (+${m} 良善忠心分)`,
      imbrogliato: (m) => `🎭 屈服于诱惑 (-${m} 良善忠心分)`,
      premioVincitore: (m, p) => `🏆 获胜 (+${m} 金币${p ? `，+${p} 成功` : ''})`,
      premioPerdente: (m) => `小游戏败北 (+${m} 金币)`,
      offertaFatta: (c, m) => `🙏 奉献 ${c} 金币 (+${m} 良善忠心分)`,
      inOrario: (b) => `⚡ 准时 (+${b} 金币)`,
      inRitardo: "⏰ 迟到 (0 金币)",
      costoIngresso: (c) => `准入成本 (-${c} 金币)`,
      vendutoSuccesso: (m) => `出售 1 成功 (-1 成功, +${m} 金币)`,
      sceltoFede: "选择了信仰",
      rifiutatoFede: "拒绝了信仰",
      versataDecima: (d) => `缴纳什一税 (-${d} 金币)`,
      decimaNonVersata: "未缴纳什一税",
      tentazioneAcquistata: (c, m) => `购买诱惑 (-${c} 金币, -${m} 良善忠心分)`,
      sconfittoMinigioco: "小游戏败北 (0 收益)",
      crisi3Pagata: (c) => `⚡ 中期灾难 (第3阶段)：缴纳税款 (-${c} 金币)`,
      crisi3Bancarotta: "⚡ 中期灾难 (第3阶段)：破产 (0 金币)",
      crisiProtetto: "🔥 终极危机：获教会庇护 (0 成本)",
      crisiPagata: (c) => `🔥 终极危机：缴纳税款 (-${c} 金币)`,
      crisiBancarotta: "🔥 终极危机：破产 (0 金币)",
      aiutoRicevuto: (m, opp) => `🤝 ${opp} 同意帮助 (+${m} 金币)`,
      aiutoDato: (m, nome, mis) => `🤝 向 ${nome} 捐助 ${m} 金币 (+${mis} 良善忠心分)`,
      aiutoRifiutato: (opp) => `❌ ${opp} 拒绝帮助`,
      aiutoNegato: (nome, pen) => `❌ 拒绝帮助 ${nome} (-${pen} 良善忠心分)`,
      senzaFondi: (opp) => `${opp} 资金不足，无法帮助`,
      soccorsoChiesa: (m) => `⛪ 教会救助 (+${m} 金币)`,
      ingressoNonPagabile: "无法支付准入费：金币清零",
      vantaggio: (p) => `⚡ 优势生效！获胜概率：${p}%`,
      solidaleVinta: (p, m, mis, nome) => `🤝 互助胜利：${p ? `+${p} 成功，` : ''}自己与 ${nome} 各 +${m} 金币 (+${mis} 良善忠心分)`,
      solidaleRicevuta: (nome, m) => `🎁 ${nome} 分享了胜利：+${m} 金币`,
      egoistaVinta: (p, m, mis) => `🏆 利己胜利 (${p ? `+${p} 成功, ` : ''}+${m} 金币${mis ? `, ${mis > 0 ? '+' : ''}${mis} 良善忠心分` : ''})`
    }
  }
};

const PROFILI_DEFAULT = {
  VIRTUOSA: { probFedePerc: 100, fedeSensClima: 0, fedeSicuraSeClimaOltre: 101, tentBasePerc: 0, tentSensClima: 0, tentSempreSeClimaSotto: -60, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 100, solSensClima: 0, solConTentPerc: 15, solConTentClimaMin: 40, solConTentMoneteMin: 0, aiutoPerc: 100, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: -101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 1, offertaProbPerc: 100, offertaSensClima: 0 },
  OPPORTUNISTA: { probFedePerc: 50, fedeSensClima: 50, fedeSicuraSeClimaOltre: 101, tentBasePerc: 20, tentSensClima: 100, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 15, tentReagisce: 1, solSenzaTentPerc: 80, solSensClima: 20, solConTentPerc: 100, solConTentClimaMin: -101, solConTentMoneteMin: 20, aiutoPerc: 100, aiutoSeMoneteOltre: 20, aiutoSeClimaOltre: 20, decimaSaltaSeMoneteSotto: 15, vendeSuccessoPerDecima: 0, offertaProbPerc: 40, offertaSensClima: 60 },
  EGOISTA: { probFedePerc: 0, fedeSensClima: 0, fedeSicuraSeClimaOltre: 80, tentBasePerc: 100, tentSensClima: 0, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 0, solSensClima: 0, solConTentPerc: 0, solConTentClimaMin: -101, solConTentMoneteMin: 0, aiutoPerc: 0, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: 101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 0, offertaProbPerc: 0, offertaSensClima: 0 }
};

const DEFAULT_PARAMS = {
  numSquadre: 14,
  moneteBase: 10,
  iniziaCasuale: 0,
  moneteCasualiMax: 10,
  bonusPuntualita: 4,
  probabilitaPuntualitaPerc: 70,
  costoIngressoTappa: 2,
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
  // --- regole nuove (semplificate) ---
  usaPremiSemplici: 1,
  premioVincitore: 6,
  premioPerdente: 2,
  usaOfferta: 1,
  offertaPerc: 50,
  misericordiaOfferta: 1,
  misericordiaOnesta: 1,
  squadrePremiate: 7,
  // --- interruttori delle regole vecchie (spente di default, i loro valori restano salvati) ---
  usaSuccesso: 0,
  usaCatastrofi: 0,
  usaFede: 0,
  usaPuntualita: 0,
  usaCostoTentazione: 0,
  eticitaGlobalePerc: 0,
  profili: PROFILI_DEFAULT
};

const caricaParams = () => {
  const m = JSON.parse(JSON.stringify(DEFAULT_PARAMS));
  try {
    const nuovo = localStorage.getItem(STORAGE_KEY);
    // Prima volta con le regole nuove: dalle impostazioni vecchie si riprendono solo i comportamenti dei profili.
    // I valori globali (costi, premi...) ripartono dai nuovi default, pensati per il gioco semplificato.
    const raw = nuovo ?? localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return m;
    const o = JSON.parse(raw);
    if (nuovo) Object.keys(DEFAULT_PARAMS).forEach(k => { if (k !== 'profili' && typeof o[k] === 'number') m[k] = o[k]; });
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

// `c` = condizioni di attivazione: se[] = parametri che devono valere 1, seNo[] = parametri che NON devono valere 1.
// Se le condizioni non sono soddisfatte il campo resta modificabile ma viene mostrato come "disattivato".
const f = (k, it, zh, h, min, max, step, u = '', c = {}) => ({ k, it, zh, h, min, max, step, u, ...c });
const bl = (k, it, zh, h, c = {}) => ({ k, it, zh, h, bool: true, min: 0, max: 1, step: 1, ...c });
const SE_FEDE = { se: ['usaFede'] };
const SE_CATASTROFI = { se: ['usaCatastrofi'] };
const SE_SUCCESSO = { se: ['usaSuccesso'] };
const SE_VECCHIE_VITTORIE = { seNo: ['usaPremiSemplici'] };
const SE_OFFERTA = { se: ['usaOfferta'] };
const SE_PREMI_SEMPLICI = { se: ['usaPremiSemplici'] };

const CONFIG_SEZIONI = [
  { id: 'regole', it: 'Regole attive', zh: '启用的规则', icon: ToggleRight, campi: [
    bl('usaPremiSemplici', 'Premio fisso a vincitore e perdente', '胜负方固定奖励', 'Attivo: vincitore e sconfitto ricevono un premio fisso (vedi Economia) e la vittoria solidale non esiste. Disattivo: tornano le vecchie vittorie egoista / solidale.'),
    bl('usaOfferta', 'Offerta di una parte del premio', '奉献部分奖励', 'Attivo: dopo lo scontro una squadra può offrire una percentuale del premio e ottenere Misericordia.'),
    bl('iniziaCasuale', 'Monete iniziali casuali', '随机初始金币', 'Attivo: ogni squadra parte con le monete iniziali ± una variazione casuale (la scegli in Partita). Disattivo: tutte partono dalla stessa cifra.'),
    bl('usaSuccesso', 'Punti Successo', '成功点数', 'Disattivo: nessun punto Successo e nessuna vendita di Successo. I punti Successo non contano in nessuna classifica: la pubblica è per Monete, la nascosta per Misericordia.'),
    bl('usaCatastrofi', 'Catastrofi (tappa 3 e crisi finale)', '灾难（第3阶段与终极危机）', 'Disattivo: nessuna tassa a metà gioco e nessuna crisi finale.'),
    bl('usaFede', 'Fede e Decima', '信仰与什一税', 'Disattivo: nessuna scelta della Fede alla tappa 2 e nessuna Decima.'),
    bl('usaPuntualita', 'Bonus puntualità', '准时奖励', 'Disattivo: nessun bonus per chi arriva in orario.'),
    bl('usaCostoTentazione', 'La Tentazione costa monete', '诱惑需要金币', 'Disattivo: cedere alla tentazione (imbrogliare) non costa monete, toglie solo Misericordia.')
  ] },
  { id: 'partita', it: 'Partita', zh: '对局', icon: Users, campi: [
    f('moneteBase', 'Monete iniziali', '初始金币', 'Uguali per tutte, a meno che l\'inizio casuale sia attivo.', 0, 200, 5, '💰'),
    f('moneteCasualiMax', 'Variazione casuale delle monete iniziali (±)', '初始金币随机浮动（±）', 'Ogni squadra parte con le monete iniziali più un numero casuale intero tra −X e +X (mai sotto 0). Es. base 10 e ±10: ogni squadra parte con un valore da 0 a 20.', 0, 100, 1, '💰', { se: ['iniziaCasuale'] }),
    f('squadrePremiate', 'Squadre che ricevono il badge', '获得徽章的队伍数', 'Le prime N per Misericordia. Nelle analisi, un pari merito sul limite divide il posto in parti uguali.', 1, 16, 1, '🏅'),
    f('probabilitaPuntualitaPerc', 'Probabilità di essere puntuali', '准时概率', 'Ogni squadra, a ogni tappa, può arrivare in orario e prendere il bonus.', 0, 100, 5, '%', { se: ['usaPuntualita'] }),
    f('bonusPuntualita', 'Bonus puntualità', '准时奖励', 'Monete guadagnate arrivando in orario.', 0, 50, 1, '💰', { se: ['usaPuntualita'] })
  ] },
  { id: 'economia', it: 'Economia', zh: '经济', icon: Scale, campi: [
    f('costoIngressoTappa', 'Costo di partecipazione a ogni tappa', '每阶段参与费用', 'Pagato da entrambe le squadre prima dello scontro.', 0, 100, 1, '💰'),
    f('premioVincitore', 'Premio al vincitore', '获胜方奖励', 'Monete che prende chi vince lo scontro.', 0, 100, 1, '💰', SE_PREMI_SEMPLICI),
    f('premioPerdente', 'Premio allo sconfitto', '失败方奖励', 'Monete che prende anche chi perde.', 0, 100, 1, '💰', SE_PREMI_SEMPLICI),
    f('offertaPerc', 'Quota del premio che si può offrire', '可奉献的奖励比例', 'Percentuale del premio dello scontro (non di tutte le monete). Le monete offerte escono dal gioco.', 0, 100, 5, '%', SE_OFFERTA),
    f('valoreDecimaFissa', 'Decima (importo fisso)', '什一税金额', 'Pagata a ogni tappa da chi ha scelto la Fede.', 0, 50, 1, '💰', SE_FEDE),
    f('moneteDaVenditaSuccesso', 'Monete ottenute vendendo 1 punto Successo', '出售成功点数所得金币', 'Usato quando una squadra non riesce a pagare un costo.', 0, 200, 5, '💰', SE_SUCCESSO),
    f('costoCrisiTappa3', 'Catastrofe di metà gioco (tappa 3)', '中期灾难成本', 'Tassa per tutte le squadre alla tappa 3.', 0, 200, 5, '💰', SE_CATASTROFI),
    f('costoCrisiFinale', 'Crisi finale (ultima tappa)', '终极危机成本', 'Non la paga chi ha scelto la Fede e ha versato tutte le decime.', 0, 200, 5, '💰', SE_CATASTROFI)
  ] },
  { id: 'scontri', it: 'Scontri e punti', zh: '对抗与得分', icon: Swords, campi: [
    f('misericordiaOnesta', 'Misericordia a chi resta onesto', '保持诚实所得良善忠心分', 'Assegnata a ogni scontro in cui la squadra non cede alla tentazione. 0 = disattivato.', 0, 10, 1),
    f('costoMisericordiaTentazione', 'Misericordia persa se cede alla tentazione', '屈服诱惑扣除良善忠心分', 'Cedere alla tentazione = imbrogliare.', 0, 20, 1),
    f('misericordiaOfferta', 'Misericordia per l\'offerta', '奉献所得良善忠心分', 'Assegnata a chi offre una parte del premio.', 0, 10, 1, '', SE_OFFERTA),
    f('winAltaMedia', 'Abilità ALTA contro MEDIA', '高对中', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('winMediaBassa', 'Abilità MEDIA contro BASSA', '中对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('winAltaBassa', 'Abilità ALTA contro BASSA', '高对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
    f('probVantaggioPerc', 'Vittoria con Vantaggio (se imbroglia solo una)', '独占优势获胜概率', 'Se imbrogliano entrambe, conta solo l\'abilità.', 0, 100, 5, '%'),
    f('costoTentazione', 'Costo del Vantaggio (Tentazione)', '诱惑成本', 'Monete spese per comprare il Vantaggio.', 0, 50, 1, '💰', { se: ['usaCostoTentazione'] }),
    f('puntiVittoriaEgoista', 'Vittoria: punti Successo', '获胜：成功点数', 'Con il premio fisso vale per ogni vincitore; con le vecchie vittorie, per la vittoria egoista.', 0, 20, 1, '', SE_SUCCESSO),
    f('moneteVittoriaEgoista', 'Vittoria egoista: monete al vincitore', '利己胜利：金币', '', 0, 200, 5, '💰', SE_VECCHIE_VITTORIE),
    f('misericordiaVittoriaEgoista', 'Vittoria egoista: Misericordia', '利己胜利：良善忠心分', 'Può essere negativa.', -20, 20, 1, '', SE_VECCHIE_VITTORIE),
    f('puntiVittoriaSolidale', 'Vittoria solidale: punti Successo', '互助胜利：成功点数', '', 0, 20, 1, '', { se: ['usaSuccesso'], seNo: ['usaPremiSemplici'] }),
    f('moneteVittoriaSolidale', 'Vittoria solidale: monete a testa', '互助胜利：金币', 'Le riceve sia il vincitore sia lo sconfitto.', 0, 200, 5, '💰', SE_VECCHIE_VITTORIE),
    f('misericordiaVittoriaSolidale', 'Vittoria solidale: Misericordia', '互助胜利：良善忠心分', '', -20, 20, 1, '', SE_VECCHIE_VITTORIE),
    f('climaMinSolidale', 'Clima minimo per la vittoria solidale', '互助所需最低气候', 'Sotto questo clima nessuno sceglie la solidarietà.', -100, 100, 5, '%', SE_VECCHIE_VITTORIE)
  ] },
  { id: 'aiuti', it: 'Aiuti e Chiesa', zh: '援助与教会', icon: Heart, campi: [
    bl('chiesaSoccorre', 'La Chiesa copre chi non può pagare', '教会救助无力支付者', 'Se attiva, quando l\'avversario non aiuta (o non può) la Chiesa versa l\'importo mancante. Se spenta, la squadra paga solo quello che ha.'),
    f('misAiutoIngresso', 'Misericordia a chi aiuta (partecipazione)', '帮助者所得良善忠心分（参与费）', 'Gli aiuti sono donazioni: non vanno restituiti. Servono solo se una squadra non riesce a pagare.', 0, 10, 1),
    f('misAiutoCrisi', 'Misericordia a chi aiuta (catastrofe)', '帮助者所得良善忠心分（灾难）', '', 0, 10, 1, '', SE_CATASTROFI),
    f('penalitaRifiuto', 'Misericordia persa se rifiuta di aiutare', '拒绝帮助扣除良善忠心分', 'Vale solo se poteva permetterselo.', 0, 10, 1)
  ] },
  { id: 'personaggi', it: 'Personaggi', zh: '角色', icon: Compass, campi: [] }
];

const GRUPPI_PERSONAGGIO = [
  { id: 'offerta', it: 'Offerta del premio', zh: '奉献奖励', campi: [
    f('offertaProbPerc', 'Probabilità di offrire', '奉献概率', 'Valore di partenza, a clima neutro.', 0, 100, 5, '%', SE_OFFERTA),
    f('offertaSensClima', 'Effetto del clima sull\'offerta', '气候对奉献的影响', 'Punti % aggiunti con clima +100% (negativi se il clima è egoista).', -100, 100, 5, '%', SE_OFFERTA)
  ] },
  { id: 'tentazione', it: 'Tentazione (imbroglio)', zh: '诱惑（作弊）', campi: [
    f('tentBasePerc', 'Probabilità di cedere', '屈服概率', 'Valore di partenza, a clima neutro.', 0, 100, 5, '%'),
    f('tentSensClima', 'Quanto il clima virtuoso la riduce', '美德气候降低程度', '100 = a clima +100% non cede mai (a -100% raddoppia).', -100, 100, 5, '%'),
    f('tentSempreSeClimaSotto', 'Cede sempre se il clima è sotto', '气候低于此值必屈服', '-101 = mai.', -101, 100, 1, '%'),
    f('tentSeMoneteSotto', 'Cede sempre se ha meno di', '金币低于此值必屈服', '0 = disattivato.', 0, 100, 1, '💰'),
    bl('tentReagisce', 'Cede se l\'avversario lo ha fatto', '对手屈服则跟进', 'Reagisce alla scelta dell\'avversario nello stesso scontro.')
  ] },
  { id: 'aiuto', it: 'Aiuto agli altri', zh: '帮助他人', campi: [
    f('aiutoPerc', 'Probabilità di aiutare chi è in difficoltà', '帮助困难者概率', 'Se le condizioni qui sotto sono soddisfatte. Serve solo se una squadra non riesce a pagare.', 0, 100, 5, '%'),
    f('aiutoSeMoneteOltre', 'Aiuta se ha più di', '金币多于此值则帮助', 'Basta una delle due condizioni.', 0, 200, 1, '💰'),
    f('aiutoSeClimaOltre', 'oppure se il clima supera', '或气候高于', '101 = mai, -101 = sempre.', -101, 101, 1, '%')
  ] },
  { id: 'vittoria', it: 'Quando vince (vecchie regole)', zh: '获胜时（旧规则）', campi: [
    f('solSenzaTentPerc', 'Probabilità di vittoria solidale', '互助胜利概率', 'Se ha vinto senza comprare il Vantaggio.', 0, 100, 5, '%', SE_VECCHIE_VITTORIE),
    f('solSensClima', 'Effetto del clima sulla solidarietà', '气候对互助的影响', 'Punti % aggiunti con clima +100%.', -100, 100, 5, '%', SE_VECCHIE_VITTORIE),
    f('solConTentPerc', 'Probabilità di solidarietà dopo aver comprato il Vantaggio', '购买优势后互助概率', '', 0, 100, 5, '%', SE_VECCHIE_VITTORIE),
    f('solConTentClimaMin', '…solo se il clima supera', '…仅当气候高于', '-101 = sempre.', -101, 100, 1, '%', SE_VECCHIE_VITTORIE),
    f('solConTentMoneteMin', '…solo se ha almeno', '…仅当金币不少于', '0 = sempre.', 0, 200, 1, '💰', SE_VECCHIE_VITTORIE)
  ] },
  { id: 'fede', it: 'Fede e Decima', zh: '信仰与什一税', campi: [
    f('probFedePerc', 'Probabilità di scegliere la Fede', '选择信仰概率', 'Valore di partenza, a clima neutro.', 0, 100, 5, '%', SE_FEDE),
    f('fedeSensClima', 'Effetto del clima sulla Fede', '气候对信仰的影响', 'Punti % aggiunti con clima +100% (negativi se il clima è egoista).', -100, 100, 5, '%', SE_FEDE),
    f('fedeSicuraSeClimaOltre', 'Sceglie sempre la Fede se il clima è almeno', '气候不低于此值则必选信仰', '101 = mai.', -100, 101, 1, '%', SE_FEDE),
    f('decimaSaltaSeMoneteSotto', 'Salta la Decima se ha meno di', '金币低于此值则不缴什一税', '0 = la paga sempre che possa.', 0, 100, 1, '💰', SE_FEDE),
    bl('vendeSuccessoPerDecima', 'Vende Successo pur di pagare la Decima', '为缴什一税出售成功点数', 'Altrimenti rinuncia alla Decima.', { se: ['usaFede', 'usaSuccesso'] })
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

function ConfigField({ def, value, defaultValue, onChange, lang, inattivo = false }) {
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
    <div className={`rounded-2xl border p-4 space-y-2.5 ${modificato ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/60 border-slate-800'} ${inattivo ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-semibold text-slate-200 leading-snug">{lang === 'zh' ? def.zh : def.it}{inattivo && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 align-middle">{lang === 'zh' ? '已停用' : 'Disattivata'}</span>}</span>
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
  const [configCategory, setConfigCategory] = useState('regole');
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
  const [nPartite, setNPartite] = useState(100);
  const [mescolaSkill, setMescolaSkill] = useState(true);
  const [batch, setBatch] = useState({ running: false, done: 0, total: 0, risultati: null });
  const batchAnnulla = useRef(false);

  // Regole attive: derivate dai parametri
  const succOn = params.usaSuccesso === 1;
  const ordEff = !succOn && ordinaPer === 'successo' ? 'misericordia' : ordinaPer;
  // Spareggio sulle monete (usato dalla classifica nascosta, quella per Misericordia).
  const tieMonete = (a, b) => b.monete - a.monete;
  // Quanto del badge spetta a ogni squadra (1 = lo ha, 0 = no, in mezzo = pari merito sul limite).
  const badgeFrazioni = (squadreFinali) => {
    const out = new Map();
    const cmp = (a, b) => b.puntiMisericordia - a.puntiMisericordia || tieMonete(a, b);
    const ord = [...squadreFinali].sort(cmp);
    const N = Math.min(params.squadrePremiate, ord.length);
    ord.forEach(x => out.set(x.id, 0));
    if (N <= 0) return out;
    const soglia = ord[N - 1];
    const sopra = ord.filter(x => cmp(x, soglia) < 0);
    const pari = ord.filter(x => cmp(x, soglia) === 0);
    sopra.forEach(x => out.set(x.id, 1));
    pari.forEach(x => out.set(x.id, (N - sopra.length) / pari.length));
    return out;
  };

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

  // Squadre di partenza di una nuova partita (usata dal Reset e dall'analisi su molte partite).
  const creaSquadre = useCallback(() => {
    const n = params.numSquadre;
    return generateDefaultArchetipi(n).map(arch => {
      // Variazione intera uniforme tra -X e +X; le monete di partenza non scendono mai sotto 0.
      const X = Math.max(0, Math.round(params.moneteCasualiMax));
      const randCoins = params.iniziaCasuale === 1 ? Math.floor(Math.random() * (2 * X + 1)) - X : 0;
      return {
        ...arch,
        etica: getEticaEffettivaSquadra(arch.id - 1, n, params.eticitaGlobalePerc),
        monete: Math.max(0, params.moneteBase + randCoins),
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
  }, [params, getEticaEffettivaSquadra]);

  const initializeTeams = useCallback(() => {
    const newSquadre = creaSquadre();

    setSquadre(newSquadre);
    setParamsAvvio(firma(params));
    setCurrentTappa(0);
    setViewedTappa(0);
    setHistory([{ tappa: 0, squadre: newSquadre.map(s => ({ ...s })) }]);
    setEventLogs([{ tappa: 0, testo: `Simulazione inizializzata!` }]);
  }, [params, creaSquadre]);

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

    const usaPunt = params.usaPuntualita === 1;
    map.forEach((t) => {
      t.ePuntualeInQuestaTappa = usaPunt && rnd(params.probabilitaPuntualitaPerc);
      if (t.ePuntualeInQuestaTappa) {
        t.monete += params.bonusPuntualita;
        t.bonusPuntualitaAccumulati = (t.bonusPuntualitaAccumulati || 0) + 1;
      }
    });

    scheduleMatchmaking[tappaNumber - 1].matches.forEach(match => {
      const tA = map.get(match.teamAId), tB = map.get(match.teamBId);
      if (!tA || !tB) return;
      // `eticaFissa` è impostata solo dall'analisi su molte partite (profili mescolati tra le posizioni del calendario);
      // nella partita normale non esiste e l'etica resta quella prevista dal clima per quell'id.
      const mk = (t, opp) => ({ t, opp, log: [], cede: false, etica: t.eticaFissa || getEticaEffettivaSquadra(t.id - 1, tot, clima), oppS: null });
      const A = mk(tA, tB), B = mk(tB, tA);
      A.oppS = B; B.oppS = A;
      const entrambi = [A, B];
      const ref = (S) => ({ __team: true, id: S.t.id, skill: S.t.skill, etica: S.etica });
      // l'ordine casuale evita che la squadra "A" sia sempre avvantaggiata nelle fasi sequenziali
      const ordineCasuale = () => (Math.random() < 0.5 ? [A, B] : [B, A]);
      if (usaPunt) entrambi.forEach(S => S.log.push(S.t.ePuntualeInQuestaTappa ? L.inOrario(params.bonusPuntualita) : L.inRitardo));

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
      if (params.usaCatastrofi === 1 && tappaNumber === TAPPA_CRISI_INTERMEDIA) {
        ordineCasuale().forEach(S => pagaCosto(S, params.costoCrisiTappa3, params.misAiutoCrisi, L.crisi3Pagata(params.costoCrisiTappa3), L.crisi3Bancarotta));
      }

      if (params.usaFede === 1 && tappaNumber === TAPPA_FEDE) {
        entrambi.forEach(S => {
          const pf = profiloDi(S.etica);
          S.t.haSceltoDiCredere = clima >= pf.fedeSicuraSeClimaOltre || rnd(clamp(pf.probFedePerc + pf.fedeSensClima * clima / 100, 0, 100));
          if (S.t.haSceltoDiCredere) S.log.push(L.sceltoFede);
          else { S.t.haPagatoTutteLeDecime = false; S.log.push(L.rifiutatoFede); }
        });
      }

      // Tentazione: UNA sola estrazione casuale per squadra; poi l'eventuale reazione all'avversario
      const costoT = params.usaCostoTentazione === 1 ? params.costoTentazione : 0;
      const vuoleBase = (S) => {
        const pf = profiloDi(S.etica);
        if (S.t.monete < costoT) return false;
        if (clima < pf.tentSempreSeClimaSotto || S.t.monete < pf.tentSeMoneteSotto) return true;
        if (pf.tentBasePerc <= 0) return false;
        return rnd(clamp(pf.tentBasePerc * (1 - (pf.tentSensClima / 100) * (clima / 100)), 0, 100));
      };
      const base = [vuoleBase(A), vuoleBase(B)];
      entrambi.forEach((S, i) => {
        S.cede = base[i] || (profiloDi(S.etica).tentReagisce === 1 && base[1 - i] && S.t.monete >= costoT);
        if (!S.cede) {
          if (params.misericordiaOnesta > 0) {
            S.t.puntiMisericordia += params.misericordiaOnesta;
            S.log.push(L.onesto(params.misericordiaOnesta));
          }
          return;
        }
        S.t.monete -= costoT;
        S.t.puntiMisericordia -= params.costoMisericordiaTentazione;
        S.t.tentazioniCedute += 1;
        S.log.push(costoT > 0 ? L.tentazioneAcquistata(costoT, params.costoMisericordiaTentazione) : L.imbrogliato(params.costoMisericordiaTentazione));
      });

      const pA = probVittoria(tA, tB, A.cede, B.cede);
      entrambi.forEach((S, i) => { if (S.cede) S.log.push(L.vantaggio(Math.round((i === 0 ? pA : 1 - pA) * 100))); });

      const aVince = Math.random() < pA;
      const W = aVince ? A : B, X = aVince ? B : A;
      const succ = params.usaSuccesso === 1;
      W.guadagno = 0; X.guadagno = 0; // monete ricevute da questo scontro (base dell'eventuale offerta)
      if (params.usaPremiSemplici === 1) {
        const pts = succ ? params.puntiVittoriaEgoista : 0;
        W.t.puntiSuccesso += pts;
        W.t.monete += params.premioVincitore;
        X.t.monete += params.premioPerdente;
        W.guadagno = params.premioVincitore;
        X.guadagno = params.premioPerdente;
        W.log.push(L.premioVincitore(params.premioVincitore, pts));
        X.log.push(L.premioPerdente(params.premioPerdente));
      } else {
        X.log.push(L.sconfittoMinigioco);
        const pw = profiloDi(W.etica);
        const probSol = W.cede
          ? (clima > pw.solConTentClimaMin && W.t.monete >= pw.solConTentMoneteMin ? pw.solConTentPerc : 0)
          : clamp(pw.solSenzaTentPerc + pw.solSensClima * clima / 100, 0, 100);
        if (clima > params.climaMinSolidale && rnd(probSol)) {
          const pts = succ ? params.puntiVittoriaSolidale : 0;
          W.t.puntiSuccesso += pts;
          W.t.monete += params.moneteVittoriaSolidale;
          X.t.monete += params.moneteVittoriaSolidale;
          W.t.puntiMisericordia += params.misericordiaVittoriaSolidale;
          W.t.donazioniEffettuate += 1;
          W.guadagno = params.moneteVittoriaSolidale;
          X.guadagno = params.moneteVittoriaSolidale;
          W.log.push(L.solidaleVinta(pts, params.moneteVittoriaSolidale, params.misericordiaVittoriaSolidale, ref(X)));
          X.log.push(L.solidaleRicevuta(ref(W), params.moneteVittoriaSolidale));
        } else {
          const pts = succ ? params.puntiVittoriaEgoista : 0;
          W.t.puntiSuccesso += pts;
          W.t.monete += params.moneteVittoriaEgoista;
          W.t.puntiMisericordia += params.misericordiaVittoriaEgoista;
          W.guadagno = params.moneteVittoriaEgoista;
          W.log.push(L.egoistaVinta(pts, params.moneteVittoriaEgoista, params.misericordiaVittoriaEgoista));
        }
      }

      // Offerta: una parte del premio ricevuto esce dal gioco in cambio di Misericordia
      if (params.usaOfferta === 1) {
        entrambi.forEach(S => {
          const pf = profiloDi(S.etica);
          const importo = Math.round((S.guadagno || 0) * params.offertaPerc / 100);
          if (importo <= 0 || S.t.monete < importo) return;
          if (!rnd(clamp(pf.offertaProbPerc + pf.offertaSensClima * clima / 100, 0, 100))) return;
          S.t.monete -= importo;
          S.t.puntiMisericordia += params.misericordiaOfferta;
          S.t.offerteFatte = (S.t.offerteFatte || 0) + 1;
          S.log.push(L.offertaFatta(importo, params.misericordiaOfferta));
        });
      }

      if (params.usaFede === 1 && tappaNumber >= TAPPA_FEDE && tappaNumber < maxTappe) {
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

      if (params.usaCatastrofi === 1 && tappaNumber === maxTappe) {
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

  const media = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const devStd = (a) => { const m = media(a); return Math.sqrt(media(a.map(v => (v - m) ** 2))); };
  const mescola = (a) => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  // Squadre al primo posto a pari merito. Non si sceglie in base all'ordine dell'array:
  // ordinando, vincerebbe sempre l'id più basso, cioè una virtuosa.
  // Classifica pubblica: contano solo le monete.
  const inTestaPubblica = (finali) => {
    const max = Math.max(...finali.map(x => x.monete));
    return finali.filter(x => x.monete === max);
  };
  // Classifica nascosta: punti Misericordia, con le monete come spareggio.
  const inTestaNascosta = (finali) => {
    const ord = [...finali].sort((a, b) => b.puntiMisericordia - a.puntiMisericordia || tieMonete(a, b));
    return ord.filter(x => x.puntiMisericordia === ord[0].puntiMisericordia && x.monete === ord[0].monete);
  };

  const eseguiBatch = () => {
    if (batch.running) return;
    const totale = nPartite;
    const chiave = JSON.stringify(params) + '|' + mescolaSkill;
    const perProfilo = {};
    PROFILI_ETICI.forEach(e => { perProfilo[e] = { n: 0, monete: [], successo: [], misericordia: [], primoApp: 0, primoReale: 0, badge: 0 }; });
    let divergenze = 0;
    let fatte = 0;
    batchAnnulla.current = false;
    setBatch({ running: true, done: 0, total: totale, risultati: null });

    const unaPartita = () => {
      const iniziali = creaSquadre();
      if (mescolaSkill) {
        // Abilità e profilo etico vengono assegnati a caso alle posizioni del calendario (indipendentemente tra loro).
        // Il numero di squadre per profilo resta quello deciso dal clima.
        const skills = mescola(iniziali.map(x => x.skill));
        const etiche = mescola(iniziali.map(x => x.etica));
        iniziali.forEach((x, i) => { x.skill = skills[i]; x.etica = etiche[i]; x.eticaFissa = etiche[i]; });
      }
      let mappa = new Map(iniziali.map(x => [x.id, x]));
      for (let tp = 1; tp <= maxTappe; tp++) mappa = simulateSingleTappa(tp, mappa).updatedMap;
      const finali = Array.from(mappa.values());
      // Pareggio perfetto: il primo posto si divide in parti uguali tra le squadre a pari merito.
      const topApp = inTestaPubblica(finali);
      const topReale = inTestaNascosta(finali);
      // Probabilità che i due "primi" siano la stessa squadra, scegliendo a caso tra i pari merito.
      const stessaSquadra = topApp.filter(x => topReale.some(y => y.id === x.id)).length / (topApp.length * topReale.length);
      divergenze += 1 - stessaSquadra;
      topApp.forEach(x => { perProfilo[x.etica].primoApp += 1 / topApp.length; });
      topReale.forEach(x => { perProfilo[x.etica].primoReale += 1 / topReale.length; });
      const bf = badgeFrazioni(finali);
      finali.forEach(x => { perProfilo[x.etica].badge += bf.get(x.id) || 0; });
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
      const stat = (arr) => (arr.length ? { m: media(arr), sd: devStd(arr) } : null);
      const risultati = {
        chiave,
        n: totale,
        divergenzaPerc: Math.round((divergenze / totale) * 100),
        profili: PROFILI_ETICI.map(e => {
          const q = perProfilo[e];
          return { etica: e, n: q.n, monete: stat(q.monete), successo: stat(q.successo), misericordia: stat(q.misericordia), primoApp: Math.round((q.primoApp / totale) * 100), primoReale: Math.round((q.primoReale / totale) * 100), badgePerc: q.n ? Math.round((q.badge / (q.n * totale)) * 100) : 0 };
        })
      };
      setBatch({ running: false, done: totale, total: totale, risultati });
    };
    setTimeout(passo, 0);
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

  // Classifica pubblica: solo monete.
  const classificaApparente = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.monete - a.monete);
  }, [displayedSquadre]);

  // Classifica nascosta: Misericordia, spareggio monete.
  const classificaReale = useMemo(() => {
    return [...displayedSquadre].sort((a, b) => b.puntiMisericordia - a.puntiMisericordia || tieMonete(a, b));
  }, [displayedSquadre]);

  const badgeMap = useMemo(() => badgeFrazioni(displayedSquadre), [displayedSquadre, params.squadrePremiate]);

  const rangoApp = useMemo(() => new Map(classificaApparente.map((x, i) => [x.id, i + 1])), [classificaApparente]);
  const rangoReale = useMemo(() => new Map(classificaReale.map((x, i) => [x.id, i + 1])), [classificaReale]);

  const squadreVisibili = useMemo(() => {
    const l = filtroEtica === 'TUTTE' ? [...displayedSquadre] : displayedSquadre.filter(x => x.etica === filtroEtica);
    const cmp = {
      id: (a, b) => a.id - b.id,
      successo: (a, b) => b.puntiSuccesso - a.puntiSuccesso || tieMonete(a, b),
      misericordia: (a, b) => b.puntiMisericordia - a.puntiMisericordia || tieMonete(a, b),
      monete: (a, b) => b.monete - a.monete
    };
    return l.sort(cmp[ordEff]);
  }, [displayedSquadre, filtroEtica, ordEff]);

  // Cosa è successo nella tappa visualizzata, contando i log strutturati di tutte le squadre.
  const riepilogoTappa = useMemo(() => {
    if (viewedTappa === 0) return null;
    const r = { tentazioni: 0, offerte: 0, donazioni: 0, rifiuti: 0, chiesa: 0, bancarotte: 0, fede: 0 };
    displayedSquadre.forEach(x => {
      const st = x.storiaTappe.find(e => e.tappa === viewedTappa);
      if (!st) return;
      st.logs.forEach(l => {
        switch (l && l.k) {
          case 'tentazioneAcquistata': case 'imbrogliato': r.tentazioni++; break;
          case 'offertaFatta': r.offerte++; break;
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
      return { etica: e, n: g.length, monete: avg(x => x.monete), successo: avg(x => x.puntiSuccesso), misericordia: avg(x => x.puntiMisericordia), badge: g.reduce((a, x) => a + (badgeMap.get(x.id) || 0), 0) };
    });
    const badgeTot = Math.min(params.squadrePremiate, displayedSquadre.length);
    const parita = Array.from(badgeMap.values()).some(v => v > 0 && v < 1);
    return { primoApp, primoReale, rangoRealeDelPrimoApp: rangoReale.get(primoApp.id), profili, badgeTot, parita };
  }, [finito, classificaApparente, classificaReale, displayedSquadre, rangoReale, badgeMap, params.squadrePremiate]);

  const renderFinale = () => {
    if (!riepilogoFinale) return null;
    const { primoApp, primoReale, rangoRealeDelPrimoApp, profili, badgeTot, parita } = riepilogoFinale;
    const coincidono = primoApp.id === primoReale.id;
    const fmt = (v) => (v === null ? '—' : v.toFixed(1));
    const fb = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
    return (
      <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        <h2 className="text-xl font-extrabold text-white">{t.titoloFinale}</h2>
        <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
          {coincidono
            ? t.finaleCoincidono(nomeSquadra(lang, primoApp))
            : t.finaleDivergono(nomeSquadra(lang, primoApp), rangoRealeDelPrimoApp, nomeSquadra(lang, primoReale))}
        </p>
        <p className="text-xs text-slate-300">{t.finaleBadge(badgeTot, displayedSquadre.length)}</p>
        {parita && <p className="text-xs text-amber-300">{t.finaleBadgeParita}</p>}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-2">{t.profiliMedie}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {profili.map(pr => (
              <div key={pr.etica} className={`rounded-2xl border p-4 ${ETICA_BADGE[pr.etica]}`}>
                <div className="text-xs font-extrabold">{t.eticaNames[pr.etica]} · {pr.n} {t.squadreWord}</div>
                <div className={`grid ${succOn ? 'grid-cols-4' : 'grid-cols-3'} gap-2 mt-3 text-center`}>
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.monete}</span><span className={`text-base font-extrabold text-white`}>{fmt(pr.monete)}</span></div>
                  {succOn && <div><span className="text-[10px] text-slate-400 font-bold block">{t.successo}</span><span className="text-base font-extrabold text-white">{fmt(pr.successo)}</span></div>}
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.misericordia}</span><span className="text-base font-extrabold text-white">{fmt(pr.misericordia)}</span></div>
                  <div><span className="text-[10px] text-slate-400 font-bold block">{t.badge}</span><span className="text-base font-extrabold text-white">🏅 {fb(pr.badge)}/{pr.n}</span></div>
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
              const tema = temaTappa(viewedTappa, maxTappe, params);
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
                {[['id', t.ordId], ...(succOn ? [['successo', t.successo]] : []), ['misericordia', t.misericordia], ['monete', t.monete]].map(([k, label]) => (
                  <button key={k} aria-pressed={ordEff === k} onClick={() => setOrdinaPer(k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${ordEff === k ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{label}</button>
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
                      {succOn && <th className="px-3 py-3 font-bold text-right">{t.successo}</th>}
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
                          <td className={`px-3 py-2.5 text-right font-extrabold text-amber-400`}>{s.monete}<Delta v={s.delta?.monete} /></td>
                          {succOn && <td className="px-3 py-2.5 text-right font-extrabold text-indigo-400">{s.puntiSuccesso}<Delta v={s.delta?.successo} /></td>}
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

                  <div className={`grid ${succOn ? 'grid-cols-3' : 'grid-cols-2'} gap-2 py-3 border-y border-slate-800 text-center bg-slate-950/50 rounded-2xl px-2`}>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.monete}</span>
                      <span className={`text-base font-extrabold text-amber-400`}>{s.monete}<Delta v={s.delta?.monete} /></span>
                    </div>
                    {succOn && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{t.successo}</span>
                        <span className="text-base font-extrabold text-indigo-400">{s.puntiSuccesso}<Delta v={s.delta?.successo} /></span>
                      </div>
                    )}
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
                const tema = temaTappa(roundObj.round, maxTappe, params);
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
                    {succOn && <span className="text-[10px] text-slate-500 mr-2 shrink-0">{s.puntiSuccesso} {t.successo}</span>}
                    <span className="text-amber-400 font-bold px-3 py-1 bg-amber-500/10 rounded-xl">{s.monete} 💰</span>
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
                    <span className="font-semibold flex-1 truncate">{nomeSquadra(lang, s)}{badgeMap.get(s.id) > 0 && <span title={badgeMap.get(s.id) < 1 ? t.badgeParitaTitle : t.badgeTitle} className="ml-2">🏅{badgeMap.get(s.id) < 1 ? '~' : ''}</span>}</span>
                    <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mr-2 ${ETICA_BADGE[s.etica]}`}>{t.eticaNames[s.etica]}</span>
                    <span className="text-[10px] text-slate-500 mr-1 shrink-0">{t.rangoApp(rangoApp.get(s.id))}</span>
                    <Delta v={rangoApp.get(s.id) - (idx + 1)} title={t.spostamentoTitle} />
                    <span className="ml-2 text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-xl mr-2">{s.puntiMisericordia} {t.misericordia}</span>
                    <span className={`text-amber-400 font-extrabold w-20 text-right`}>{s.monete} 💰</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* TAB 4. GRAFICI */}
        {activeTab === 'grafici' && (
          <div className={`grid grid-cols-1 ${succOn ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
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

            {succOn && (
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
            )}

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

        {/* TAB 4b. ANALISI SU MOLTE PARTITE */}
        {activeTab === 'analisi' && (() => {
          const r = batch.risultati;
          const obsoleta = r && r.chiave !== JSON.stringify(params) + '|' + mescolaSkill;
          const pm = (x) => (x ? `${x.m.toFixed(1)} ± ${x.sd.toFixed(1)}` : '—');
          const datiGrafico = r ? r.profili.filter(x => x.n > 0).map(x => ({ nome: t.eticaNames[x.etica], app: x.primoApp, reale: x.primoReale, badge: x.badgePerc })) : [];
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
                            {succOn && <th className="px-3 py-3 font-bold text-right">{t.successo}</th>}
                            <th className="px-3 py-3 font-bold text-right">{t.misericordia}</th>
                            <th className="px-3 py-3 font-bold text-right">{t.analisiColApp}</th>
                            <th className="px-3 py-3 font-bold text-right">{t.analisiColReale}</th>
                            <th className="px-4 py-3 font-bold text-right">{t.analisiColBadge}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.profili.map(x => (
                            <tr key={x.etica} className="border-b border-slate-800/60">
                              <td className="px-4 py-2.5"><span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${ETICA_BADGE[x.etica]}`}>{t.eticaNames[x.etica]}</span></td>
                              <td className="px-3 py-2.5 text-right text-slate-300">{x.n}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-amber-400">{pm(x.monete)}</td>
                              {succOn && <td className="px-3 py-2.5 text-right font-bold text-indigo-400">{pm(x.successo)}</td>}
                              <td className="px-3 py-2.5 text-right font-bold text-emerald-400">{pm(x.misericordia)}</td>
                              <td className="px-3 py-2.5 text-right text-slate-200">{x.n ? `${x.primoApp}%` : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-slate-200">{x.n ? `${x.primoReale}%` : '—'}</td>
                              <td className="px-4 py-2.5 text-right text-slate-200">{x.n ? `${x.badgePerc}%` : '—'}</td>
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
                          <Bar dataKey="badge" name={t.analisiGraficoBadge} fill="#F59E0B" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">{t.analisiNotaSD}</p>
                  <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">{t.analisiNotaBadge}</p>
                </section>
              )}
            </div>
          );
        })()}

        {/* TAB 5. CONFIGURAZIONE */}
        {activeTab === 'impostazioni' && (() => {
          const tx = (it, zh) => (lang === 'zh' ? zh : it);
          const sez = CONFIG_SEZIONI.find(x => x.id === configCategory) || CONFIG_SEZIONI[0];
          const pathsProfilo = GRUPPI_PERSONAGGIO.flatMap(g => g.campi.map(c => `${profiloAttivo}.${c.k}`));
          const pathsSezione = sez.id === 'personaggi' ? pathsProfilo : sez.campi.map(c => c.k);
          const attivo = (def) => (def.se || []).every(k => params[k] === 1) && (def.seNo || []).every(k => params[k] !== 1);
          const campo = (def, path) => (
            <ConfigField key={path} def={def} lang={lang} inattivo={!attivo(def)} value={getVal(params, path)} defaultValue={getVal(DEFAULT_PARAMS, path)} onChange={v => setParam(path, v)} />
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

                {sez.id === 'regole' && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3">{tx('Qui si accendono e si spengono le regole. Quelle spente non influiscono sulla simulazione, ma i loro valori restano salvati nelle altre sezioni (mostrati come "Disattivata") e tornano utili se le riattivi.', '在这里开启或关闭规则。关闭的规则不影响模拟，其数值仍保存在其他分区（显示为“已停用”），重新开启后即可使用。')}</p>
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
