import { useState, useEffect } from 'react';
import { Crown, DollarSign, Clock, RefreshCw, Hash } from 'lucide-react';
import api from '../api/axios';

const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

export default function TopCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/analytics/top-customers')
      .then(r => setCustomers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const maxMonetary = customers[0]?.monetary || 1;

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Top Customers</h1>
          <p className="text-muted text-sm mt-1">10 pelanggan dengan nilai transaksi tertinggi</p>
        </div>
        <button onClick={fetch}
          className="p-2.5 rounded-xl text-muted hover:text-white transition-all hover:bg-white/5"
          style={{ border: '1px solid #2a2d3a' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Podium Top 3 */}
      {!loading && customers.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-2">
          {[1, 0, 2].map((idx) => {
            const c = customers[idx];
            const rank = idx + 1;
            const medalColor = { 1: '#f59e0b', 2: '#94a3b8', 3: '#cd7f32' }[rank];
            const heights = { 1: 'pt-8', 2: 'pt-14', 3: 'pt-16' };
            return (
              <div key={c.customer_id} className={`rounded-2xl border p-5 text-center ${heights[rank]}`}
                style={{
                  background: rank === 1 ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))' : '#1a1d27',
                  borderColor: rank === 1 ? 'rgba(245,158,11,0.4)' : '#2a2d3a',
                }}>
                <div className="text-3xl mb-2">
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
                <p className="text-white font-semibold text-sm truncate">{c.customer_name}</p>
                <p className="text-muted text-xs mt-0.5">{c.segment}</p>
                <p className="font-bold mt-2 text-sm" style={{ color: medalColor }}>{fmt(c.monetary)}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium"
                  style={c.cluster === 2
                    ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                    : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  {c.cluster_name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranked list */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#13161f', borderBottom: '1px solid #2a2d3a' }}>
                {['#', 'Customer', 'Segment', 'Recency', 'Frequency', 'Monetary', 'Proporsi', 'Cluster'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(10)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2d3a' }}>
                  {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3.5"><div className="h-4 animate-pulse rounded" style={{ background: '#2a2d3a' }} /></td>)}
                </tr>
              )) : customers.map((c, i) => {
                const pct = (c.monetary / maxMonetary) * 100;
                const badges = { 1: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' }, 2: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' }, 3: { bg: 'rgba(205,127,50,0.15)', color: '#cd7f32' } };
                const b = badges[i + 1] || { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' };
                return (
                  <tr key={c.customer_id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #2a2d3a' }}>
                    <td className="px-4 py-3.5">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: b.bg, color: b.color }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-medium">{c.customer_name}</p>
                      <p className="text-muted text-xs">{c.customer_id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{c.segment}</td>
                    <td className="px-4 py-3.5 text-white">{c.recency}h</td>
                    <td className="px-4 py-3.5 text-white">{c.frequency}x</td>
                    <td className="px-4 py-3.5 text-white font-semibold">{fmt(c.monetary)}</td>
                    <td className="px-4 py-3.5" style={{ minWidth: '100px' }}>
                      <div className="h-1.5 rounded-full" style={{ background: '#2a2d3a' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                      </div>
                      <span className="text-muted text-xs">{pct.toFixed(0)}%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={c.cluster === 2
                          ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                          : { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.cluster === 2 ? '#34d399' : '#f87171' }} />
                        {c.cluster_name}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
