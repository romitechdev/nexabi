import { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { TrendingUp, Users, Activity } from 'lucide-react';
import api from '../api/axios';

const CLUSTER_COLORS = { 1: '#ef4444', 2: '#10b981' };
const SEGMENT_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981'];

const CustomTooltipScatter = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="px-3 py-2 rounded-xl text-xs border" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
      <p className="text-white font-semibold mb-1">{d?.name}</p>
      <p className="text-muted">Recency: {d?.x}</p>
      <p className="text-muted">Frequency: {d?.y}</p>
      <p className="text-muted">Monetary: Rp {Number(d?.monetary).toLocaleString('id-ID')}</p>
      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
        style={d?.cluster === 2
          ? { background: 'rgba(16,185,129,0.2)', color: '#34d399' }
          : { background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
        {d?.cluster === 2 ? 'Loyal' : 'Pasif'}
      </span>
    </div>
  );
};

export default function AnalyticsPage() {
  const [scatter, setScatter] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/rfm-scatter'),
      api.get('/analytics/segment-stats'),
    ]).then(([s, sg]) => {
      setScatter(s.data);
      setSegments(sg.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loyal  = scatter.filter(d => d.cluster === 2);
  const pasif  = scatter.filter(d => d.cluster === 1);

  const pieData = segments.map(s => ({ name: s.segment, value: s.total }));

  const radarData = segments.map(s => ({
    segment: s.segment,
    'Avg Monetary (rb)': Math.round(s.avg_monetary / 1000),
    'Avg Frequency': s.avg_frequency,
    '% Loyal': s.pct_loyal,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted text-sm mt-1">Visualisasi distribusi RFM dan segmentasi klaster pelanggan</p>
      </div>

      {/* RFM Scatter Plot */}
      <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" style={{ color: '#818cf8' }} />
          <h2 className="text-white font-semibold">RFM Cluster Scatter Plot</h2>
        </div>
        <p className="text-muted text-xs mb-5">Recency (X) vs Frequency (Y) — Semua {scatter.length} pelanggan</p>

        <div className="flex gap-4 mb-3">
          {[{ label: 'Loyal', color: '#10b981' }, { label: 'Pasif', color: '#ef4444' }].map(c => (
            <div key={c.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
              <span className="text-muted text-xs">{c.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="x" name="Recency" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Recency (scaled)', fill: '#94a3b8', fontSize: 11, position: 'insideBottom', offset: -2 }} />
              <YAxis dataKey="y" name="Frequency" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Frequency', fill: '#94a3b8', fontSize: 11, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltipScatter />} />
              <Scatter name="Loyal" data={loyal} fill="#10b981" opacity={0.7} r={4} />
              <Scatter name="Pasif" data={pasif} fill="#ef4444" opacity={0.7} r={4} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + Radar row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut Pie */}
        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: '#818cf8' }} />
            <h2 className="text-white font-semibold">Distribusi per Segment</h2>
          </div>
          {loading ? <div className="h-52 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#94a3b8' }}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Avg RFM per Segment Bar */}
        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: '#818cf8' }} />
            <h2 className="text-white font-semibold">% Loyal per Segment</h2>
          </div>
          {loading ? <div className="h-52 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={segments} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }} itemStyle={{ color: '#fff' }}
                  formatter={(v) => [`${v}%`, '% Loyal']} />
                <Bar dataKey="pct_loyal" radius={[6, 6, 0, 0]}>
                  {segments.map((_, i) => <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Segment detail table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
          <h2 className="text-white font-semibold">Detail Statistik per Segment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2d3a' }}>
                {['Segment', 'Total', 'Loyal', 'Pasif', '% Loyal', 'Avg Recency', 'Avg Frequency', 'Avg Monetary'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2d3a' }}>
                  {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded" style={{ background: '#2a2d3a' }} /></td>)}
                </tr>
              )) : segments.map((s, i) => (
                <tr key={s.segment} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #2a2d3a' }}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                      <span className="text-white font-medium">{s.segment}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{s.total.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3" style={{ color: '#34d399' }}>{s.loyal.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3" style={{ color: '#f87171' }}>{s.pasif.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full flex-1" style={{ background: '#2a2d3a', maxWidth: '60px' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${s.pct_loyal}%`, background: '#10b981' }} />
                      </div>
                      <span className="text-white text-xs">{s.pct_loyal}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.avg_recency}h</td>
                  <td className="px-4 py-3 text-muted">{s.avg_frequency}x</td>
                  <td className="px-4 py-3 text-white">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(s.avg_monetary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
