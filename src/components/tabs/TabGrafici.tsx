import React from 'react';
import { BarChart2, Award, Heart } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function TabGrafici({ chartData, t }: any) {
  return (
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
  );
}
