import { useState, useEffect } from 'react';
import { Network, Sparkles, Tag, ArrowRight, PackageOpen } from 'lucide-react';
import api from '../api/axios';

export default function MarketBasketPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/market-basket')
      .then(res => setRules(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Basket Analysis</h1>
        <p className="text-muted text-sm mt-1">Rekomendasi bundling produk berdasarkan algoritma Apriori pada dataset Global Superstore (12.778 transaksi).</p>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border p-6 flex flex-col md:flex-row items-center gap-6"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', borderColor: 'rgba(99,102,241,0.2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Network className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Product Recommendation Engine
          </h2>
          <p className="text-muted text-sm">
            Mesin rekomendasi menemukan pola pembelian tersembunyi dari pelanggan ritel.
            Gunakan data di bawah ini untuk membuat paket promosi (bundling) yang optimal dan tingkatkan <i>Cross-Selling</i>!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bundling Cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-indigo-400" />
            Top Bundling Ideas
          </h3>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl" style={{ background: '#1a1d27', border: '1px solid #2a2d3a' }} />
            ))
          ) : (
            rules.slice(0, 3).map((r, i) => (
              <div key={r.id} className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                    Match #{i + 1}
                  </span>
                  <span className="text-xs text-muted">Conf: {(r.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-xl border text-center" style={{ background: '#13161f', borderColor: '#2a2d3a' }}>
                    <p className="text-white text-xs font-medium">{r.antecedents}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                  <div className="flex-1 p-3 rounded-xl border text-center" style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <p className="text-indigo-400 text-xs font-bold">{r.consequents}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Association Rules Table */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
            <PackageOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-white font-semibold">Tabel Association Rules (Apriori)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2d3a' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Jika membeli (Antecedents)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Maka akan membeli (Consequents)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Support</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Lift</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #2a2d3a' }}>
                      {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded" style={{ background: '#2a2d3a' }} /></td>)}
                    </tr>
                  ))
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted">Belum ada data association rules.</td>
                  </tr>
                ) : rules.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #2a2d3a' }}>
                    <td className="px-4 py-3 text-white font-medium">{r.antecedents}</td>
                    <td className="px-4 py-3 text-indigo-400 font-medium">{r.consequents}</td>
                    <td className="px-4 py-3 text-muted">{(r.support * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full" style={{ background: '#2a2d3a' }}>
                          <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${r.confidence * 100}%` }} />
                        </div>
                        <span className="text-white">{(r.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        {r.lift.toFixed(2)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
