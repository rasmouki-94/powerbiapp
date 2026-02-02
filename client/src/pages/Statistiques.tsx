import { useEffect, useState } from 'react';
import { api } from '../api';
import { STATUT_LABELS, PIPELINE_ORDER } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#10a37f', '#8b5cf6', '#f97316', '#f59e0b', '#22d3ee', '#ec4899', '#3b82f6', '#84cc16', '#14b8a6', '#f97316', '#a855f7', '#22d3ee', '#a855f7', '#64748b'];

export default function Statistiques() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { api.getStats().then(setStats); }, []);

  if (!stats) return <div className="p-8 text-[var(--chatgpt-muted)]">Chargement...</div>;

  const { countsByStatus, countsByAvatar, weeklyStats, avgTimeInStatus } = stats;

  // Pipeline funnel data
  const funnelData = PIPELINE_ORDER.map((s, i) => {
    const found = countsByStatus.find((c: any) => c.statut === s);
    return { name: STATUT_LABELS[s], count: found?.count || 0, statut: s };
  }).filter(d => d.count > 0);

  // Conversion rates between sequential steps
  const conversionData = [];
  for (let i = 0; i < funnelData.length - 1; i++) {
    if (funnelData[i].count > 0) {
      const rate = ((funnelData[i + 1].count / funnelData[i].count) * 100);
      conversionData.push({
        name: `${funnelData[i].name} → ${funnelData[i + 1].name}`,
        taux: Math.round(rate * 10) / 10,
      });
    }
  }

  // Pie chart data
  const pieData = funnelData.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  // Weekly timeline
  const weekMap: Record<string, Record<string, number>> = {};
  weeklyStats.forEach((w: any) => {
    if (!weekMap[w.week]) weekMap[w.week] = {};
    weekMap[w.week][w.statut] = w.count;
  });
  const timelineData = Object.entries(weekMap).map(([week, statuts]) => ({
    week, ...statuts,
    total: Object.values(statuts).reduce((a, b) => a + b, 0),
  }));

  // Performance by avatar
  const avatarMap: Record<string, Record<string, number>> = {};
  countsByAvatar.forEach((c: any) => {
    const name = c.avatar_nom || 'Sans avatar';
    if (!avatarMap[name]) avatarMap[name] = {};
    avatarMap[name][c.statut] = c.count;
  });
  const avatarData = Object.entries(avatarMap).map(([nom, statuts]) => {
    const total = Object.values(statuts).reduce((a, b) => a + b, 0);
    const gagnes = statuts['close_gagne'] || 0;
    return { nom, total, gagnes, taux: total > 0 ? Math.round((gagnes / total) * 100) : 0 };
  });

  const totalProspects = countsByStatus.reduce((a: number, c: any) => a + c.count, 0);
  const totalGagnes = countsByStatus.find((c: any) => c.statut === 'close_gagne')?.count || 0;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <a href="/api/prospects/export/csv" className="px-3 py-2 border border-[var(--chatgpt-border)] rounded text-sm hover:bg-[var(--chatgpt-surface-elevated)]">Export CSV</a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <div className="text-sm text-[var(--chatgpt-muted)]">Total prospects</div>
          <div className="text-3xl font-bold">{totalProspects}</div>
        </div>
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <div className="text-sm text-[var(--chatgpt-muted)]">Closés (gagnés)</div>
          <div className="text-3xl font-bold text-emerald-300">{totalGagnes}</div>
        </div>
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <div className="text-sm text-[var(--chatgpt-muted)]">Taux de closing global</div>
          <div className="text-3xl font-bold">{totalProspects > 0 ? Math.round((totalGagnes / totalProspects) * 100) : 0}%</div>
        </div>
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <div className="text-sm text-[var(--chatgpt-muted)]">En cours</div>
          <div className="text-3xl font-bold text-[var(--chatgpt-accent)]">
            {totalProspects - totalGagnes - (countsByStatus.find((c: any) => c.statut === 'perdu')?.count || 0) - (countsByStatus.find((c: any) => c.statut === 'pas_interesse')?.count || 0)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Funnel bar chart */}
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <h2 className="font-semibold mb-4">Répartition par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chatgpt-border)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10, fill: 'var(--chatgpt-muted)' }} />
              <YAxis tick={{ fill: 'var(--chatgpt-muted)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chatgpt-surface-elevated)', borderColor: 'var(--chatgpt-border)', color: 'var(--chatgpt-text)' }} />
              <Bar dataKey="count" fill="var(--chatgpt-accent)" name="Prospects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <h2 className="font-semibold mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--chatgpt-surface-elevated)', borderColor: 'var(--chatgpt-border)', color: 'var(--chatgpt-text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion rates */}
      {conversionData.length > 0 && (
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4 mb-8">
          <h2 className="font-semibold mb-4">Taux de conversion entre étapes</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chatgpt-border)" />
              <XAxis type="number" unit="%" tick={{ fill: 'var(--chatgpt-muted)' }} />
              <YAxis dataKey="name" type="category" width={250} tick={{ fontSize: 11, fill: 'var(--chatgpt-muted)' }} />
              <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ backgroundColor: 'var(--chatgpt-surface-elevated)', borderColor: 'var(--chatgpt-border)', color: 'var(--chatgpt-text)' }} />
              <Bar dataKey="taux" fill="#8b5cf6" name="Taux (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      {timelineData.length > 0 && (
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4 mb-8">
          <h2 className="font-semibold mb-4">Evolution hebdomadaire</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chatgpt-border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--chatgpt-muted)' }} />
              <YAxis tick={{ fill: 'var(--chatgpt-muted)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chatgpt-surface-elevated)', borderColor: 'var(--chatgpt-border)', color: 'var(--chatgpt-text)' }} />
              <Line type="monotone" dataKey="total" stroke="var(--chatgpt-accent)" strokeWidth={2} name="Nouveaux prospects" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance by avatar */}
      {avatarData.length > 0 && (
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4 mb-8">
          <h2 className="font-semibold mb-4">Performance par avatar</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--chatgpt-border)]">
              <th className="text-left py-2">Avatar</th>
              <th className="text-right py-2">Total</th>
              <th className="text-right py-2">Gagnés</th>
              <th className="text-right py-2">Taux closing</th>
            </tr></thead>
            <tbody>
              {avatarData.map(a => (
                <tr key={a.nom} className="border-b border-[var(--chatgpt-border)]">
                  <td className="py-2 font-medium">{a.nom}</td>
                  <td className="py-2 text-right">{a.total}</td>
                  <td className="py-2 text-right text-emerald-300">{a.gagnes}</td>
                  <td className="py-2 text-right font-semibold">{a.taux}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Avg time in status */}
      {avgTimeInStatus.length > 0 && (
        <div className="bg-[var(--chatgpt-surface)] rounded-lg border border-[var(--chatgpt-border)] p-4">
          <h2 className="font-semibold mb-4">Temps moyen par étape (jours)</h2>
          <div className="space-y-2">
            {avgTimeInStatus.map((s: any) => (
              <div key={s.from_status} className="flex items-center gap-3 text-sm">
                <span className="w-48 text-[var(--chatgpt-muted)]">{STATUT_LABELS[s.from_status] || s.from_status}</span>
                <div className="flex-1 bg-[var(--chatgpt-surface-elevated)] rounded-full h-4 overflow-hidden border border-[var(--chatgpt-border)]">
                  <div className="bg-[var(--chatgpt-accent)] h-full rounded-full" style={{ width: `${Math.min(100, (s.avg_days / 30) * 100)}%` }} />
                </div>
                <span className="font-medium w-16 text-right">{Math.round(s.avg_days * 10) / 10}j</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
