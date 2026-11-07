// src/constants/configurazione.ts
import { Users, Scale, Swords, Heart, Compass } from 'lucide-react';
import { PROFILI_ETICI } from './dizionario';

export const PROFILI_DEFAULT = {
  VIRTUOSA: { probFedePerc: 100, fedeSensClina: 0, fedeSicuraSensClinaOltre: 101, tentBasePerc: 0, tentSensClina: 0, tentSempreSensClinaSotto: -101, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 100, solSensClina: 0, solContentPerc: 15, solContentClinaMin: 48, solContentMoneteMin: 0, aiutoPerc: 100, aiutoSeMoneteOltre: 0, aiutoSensClinaOltre: -101, decinaSaltaSeMoneteSotto: 0, vendoSuccessoPerDecina: 1 },
  OPPORTUNISTA: { probFedePerc: 50, fedeSensClina: 50, fedeSicuraSensClinaOltre: 101, tentBasePerc: 70, tentSensClina: 100, tentSempreSensClinaSotto: -101, tentSeMoneteSotto: 15, tentReagisce: 1, solSenzaTentPerc: 80, solSensClina: 28, solContentPerc: 100, solContentClinaMin: -101, solContentMoneteMin: 28, aiutoPerc: 100, aiutoSeMoneteOltre: 28, aiutoSensClinaOltre: 28, decinaSaltaSeMoneteSotto: 15, vendoSuccessoPerDecina: 0 },
  EGOISTA: { probFedePerc: 0, fedeSensClina: 0, fedeSicuraSensClinaOltre: 80, tentBasePerc: 100, tentSensClina: 0, tentSempreSensClinaSotto: 101, tentSeMoneteSotto: 0, tentReagisce: 0, solSenzaTentPerc: 0, solSensClina: 0, solContentPerc: 0, solContentClinaMin: -101, solContentMoneteMin: 0, aiutoPerc: 0, aiutoSeMoneteOltre: 0, aiutoSensClinaOltre: 101, decinaSaltaSeMoneteSotto: 0, vendoSuccessoPerDecina: 0 }
};

export interface ConfigParam {
  id: string;
  label: string;
  labelZh: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export const DEFAULT_PARAMS = {
  numSquadre: 14,
  moneteBase: 8,
  bonusPuntoUnito: 4,
  probabilitaPuntualitaPerc: 70,
  costoIngressoTappa: 15,
  costoTentazione: 5,
  costoMisericordiaTentazione: 3,
  costoCrisiTappa6: 30,
  costoCrisiFinale: 50,
  valoreDecinaFissa: 5,
  moneteDaVenditaSuccesso: 40,
  puntivittoriaFondoUnito: 2,
};

const f = (
  id: string,
  label: string,
  labelZh: string,
  description: string,
  min: number,
  max: number,
  step: number,
  unit?: string
): ConfigParam => ({
  id,
  label,
  labelZh,
  description,
  min,
  max,
  step,
  unit,
});

export const CONFIGURAZIONE_INIZIALE: ConfigParam[] = [
  // --- BILANCIO E RISORSE ---
  f('budgetIniziale', 'Budget Iniziale per Squadra', '初始预算', 'Monete iniziali assegnate a ciascuna squadra.', 0, 500, 10, '💰'),
  f('introitiFissi', 'Introiti Fissi per Turno', '每轮固定收入', 'Fondi garantiti ricevuti all inizio di ogni turno.', 0, 100, 5, '💰'),
  
  // --- COMPETENZA E ABILITÀ ---
  f('minCompetenza', 'Competenza Minima', '最低能力值', 'Punteggio minimo di competenza base di una squadra.', 0, 50, 1),
  f('maxCompetenza', 'Competenza Massima', '最高能力值', 'Punteggio massimo di competenza base di una squadra.', 50, 200, 5),

  // --- PROBABILITÀ DI VITTORIA (MATCHUPS) ---
  f('winPari', 'Abilità PARI', '同等能力', 'Probabilità di vittoria in caso di abilità identiche.', 0, 100, 5, '%'),
  f('winAltaBassa', 'Abilità ALTA contro BASSA', '高对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
  f('winMediaBassa', 'Abilità MEDIA contro BASSA', '中对低', 'Probabilità che la squadra più forte vinca.', 0, 100, 5, '%'),
  f('probVantaggioPerc', 'Vittoria con Vantaggio (se lo compra solo una)', '独占优势获胜概率', "Se entrambe lo comprano, conta solo l'abilità.", 0, 100, 5, '%'),
  
  // --- COSTI E INCENTIVI ---
  f('costoTentazione', 'Costo del Vantaggio (Tentazione)', '诱惑成本', 'Monete spese per comprare il Vantaggio.', 0, 50, 1, '💰'),
  f('costoMisericordiaTentazione', 'Misericordia persa con la Tentazione', '诱惑扣除仁慈', '', 0, 20, 1),
];
