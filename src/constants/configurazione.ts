import { Users, Scale, Swords, Heart, Compass } from 'lucide-react';
import { PROFILI_ETICI } from './dizionario';

export const PROFILI_DEFAULT = {
  VIRTUOSA: { probFedePerc: 100, fedeSensClima: 0, fedeSicuraSeClimaOltre: 101, tentBasePerc: 0, tentSensClima: 0, tentSempreSeClimaSotto: -60, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 100, solSensClima: 0, solConTentPerc: 15, solConTentClimaMin: 40, solConTentMoneteMin: 0, aiutoPerc: 100, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: -101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 1 },
  OPPORTUNISTA: { probFedePerc: 50, fedeSensClima: 50, fedeSicuraSeClimaOltre: 101, tentBasePerc: 20, tentSensClima: 100, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 15, tentReagisce: 1, solSenzaTentPerc: 80, solSensClima: 20, solConTentPerc: 100, solConTentClimaMin: -101, solConTentMoneteMin: 20, aiutoPerc: 100, aiutoSeMoneteOltre: 20, aiutoSeClimaOltre: 20, decimaSaltaSeMoneteSotto: 15, vendeSuccessoPerDecima: 0 },
  EGOISTA: { probFedePerc: 0, fedeSensClima: 0, fedeSicuraSeClimaOltre: 80, tentBasePerc: 100, tentSensClima: 0, tentSempreSeClimaSotto: -101, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 0, solSensClima: 0, solConTentPerc: 0, solConTentClimaMin: -101, solConTentMoneteMin: 0, aiutoPerc: 0, aiutoSeMoneteOltre: 0, aiutoSeClimaOltre: 101, decimaSaltaSeMoneteSotto: 0, vendeSuccessoPerDecima: 0 }
};

export const DEFAULT_PARAMS = {
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

const f = (k: string, it: string, zh: string, h: string, min: number, max: number, step: number, u = '') => ({ k, it, zh, h, min, max, step, u });
const bl = (k: string, it: string, zh: string, h: string) => ({ k, it, zh, h, bool: true, min: 0, max: 1, step: 1 });

export const CONFIG_SEZIONI = [
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
    f('probVantaggioPerc', 'Vittoria con Vantaggio (se lo compra solo una)', '独占优势获胜概率', 'Se entrambe lo comprano, conta solo l'abilità.', 0, 100, 5, '%'),
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
    bl('chiesaSoccorre', 'La Chiesa copre chi non può pagare', '教会救助无力支付者', 'Se attiva, quando l'avversario non aiuta (o non può) la Chiesa versa l'importo mancante. Se spenta, la squadra paga solo quello che ha.'),
    f('misAiutoIngresso', 'Misericordia a chi aiuta (ingresso)', '帮助者所得仁慈（准入）', 'Gli aiuti sono donazioni: non vanno restituiti.', 0, 10, 1),
    f('misAiutoCrisi', 'Misericordia a chi aiuta (catastrofe)', '帮助者所得仁慈（灾难）', '', 0, 10, 1),
    f('penalitaRifiuto', 'Misericordia persa se rifiuta di aiutare', '拒绝帮助扣除仁慈', 'Vale solo se poteva permetterselo.', 0, 10, 1)
  ] },
  { id: 'personaggi', it: 'Personaggi', zh: '角色', icon: Compass, campi: [] }
];

export const GRUPPI_PERSONAGGIO = [
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
    bl('tentReagisce', 'Cede se l'avversario lo ha fatto', '对手屈服则跟进', 'Reagisce alla scelta dell'avversario nello stesso scontro.')
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

export const PROFILI_INFO = {
  VIRTUOSA: { it: 'Virtuosi', zh: '美德队', d: { it: 'Cercano solidarietà: aiutano, dividono le vittorie e resistono alle tentazioni.', zh: '寻求团结：帮助他人、分享胜利、抵制诱惑。' }, stile: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
  OPPORTUNISTA: { it: 'Opportunisti', zh: '机会主义队', d: { it: 'Si adattano: cedono alle tentazioni se sono in difficoltà o se lo fa l'avversario.', zh: '随机应变：处境困难或对手屈服时会屈服。' }, stile: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
  EGOISTA: { it: 'Egoisti', zh: '利己队', d: { it: 'Puntano al proprio vantaggio: tentazione sempre, mai solidali, non aiutano.', zh: '只顾自身利益：总是屈服、从不互助、不帮助他人。' }, stile: 'bg-rose-500/20 text-rose-300 border-rose-500/50' }
};

export const ETICA_BADGE = {
  VIRTUOSA: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  OPPORTUNISTA: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  EGOISTA: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
};
