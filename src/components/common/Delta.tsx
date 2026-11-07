import React from 'react';

export function Delta({ v, title }: { v?: number; title?: string }) {
  if (!v) return null;
  return (
    <span title={title} className={`ml-1 text-[10px] font-bold ${v > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
      {v > 0 ? '▲' : '▼'}{Math.abs(v)}
    </span>
  );
}
