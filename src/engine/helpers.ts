import { DEFAULT_PARAMS, STORAGE_KEY, DIZIONARIO, NOMI_FISSI_PER_ETICA_E_SKILL, SKILL_LEVELS, PROFILI_ETICI } from '../constants/dizionario';

export const caricaParams = () => {
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

export const getVal = (p: any, path: string) => {
  if (!path.includes('.')) return p[path];
  const [e, k] = path.split('.');
  return p.profili[e][k];
};

export const firma = (p: any) => JSON.stringify({ ...p, eticitaGlobalePerc: 0 });

export const generateDefaultArchetipi = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, skill: SKILL_LEVELS[i % SKILL_LEVELS.length] }));

export const nomeSquadra = (lang: 'it' | 'zh', s: any) => 
  `${(DIZIONARIO as any)[lang].teamPrefix} ${s.id} (${(NOMI_FISSI_PER_ETICA_E_SKILL as any)[s.etica][s.skill][lang]})`;

export const testoLog = (lang: 'it' | 'zh', log: any) => {
  if (typeof log === 'string') return log;
  const v = (DIZIONARIO as any)[lang].logs[log.k];
  if (typeof v !== 'function') return v;
  return v(...log.a.map((x: any) => (x && x.__team ? nomeSquadra(lang, x) : x)));
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const rnd = (perc: number) => Math.random() * 100 < perc;
export const media = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
export const devStd = (a: number[]) => { const m = media(a); return Math.sqrt(media(a.map(v => (v - m) ** 2))); };
export const mescola = (a: any[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
