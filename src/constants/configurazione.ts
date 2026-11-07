// src/constants/configurazione.ts

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

// Funzione di supporto per definire i parametri più rapidamente
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
