import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users, BarChart2, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';

const SEG_COLORS  = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const DIST_COLORS = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#312e81'];

const fmt = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs border" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#818cf8' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? fmtShort(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const StatBox = ({ icon: Icon, title, value, sub, color, loading }) => (
  <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-muted text-sm">{title}</p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    {loading ? (
      <div className="h-8 animate-pulse rounded" style={{ background: '#2a2d3a' }} />
    ) : (
      <>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-muted text-xs mt-1">{sub}</p>
      </>
    )}
  </div>
);

export default function SalesPage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [forecast, setForecast] = useState('');
  const [loadingFC, setLoadingFC] = useState(false);
  const [fcError, setFcError]   = useState('');
  const [fcContext, setFcContext] = useState(null);

  useEffect(() => {
    api.get('/analytics/sales-performance')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const generateForecast = async () => {
    setLoadingFC(true);
    setFcError('');
    setForecast('');
    try {
      const r = await api.get('/analytics/sales-forecast');
      setForecast(r.data.forecast);
      setFcContext(r.data.context);
    } catch (e) {
      setFcError(e.response?.data?.detail || 'Gagal mengambil forecast AI. Coba lagi.');
    } finally {
      setLoadingFC(false);
    }
  };

  const summary     = data?.summary;
  const segRevenue  = data?.revenue_by_segment || [];
  const moneyDist   = data?.monetary_distribution || [];
  const recencyDist = data?.recency_distribution || [];

  // Revenue per segment enriched with avg order
  const segChart = segRevenue.map(s => ({
    ...s,
    avg_order: s.total_orders > 0 ? Math.round(s.total_revenue / s.total_orders) : 0,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Performance</h1>
        <p className="text-muted text-sm mt-1">
          Performa revenue, distribusi transaksi, dan top pelanggan — Global Superstore
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatBox
          icon={DollarSign} title="Total Revenue"
          value={summary ? `$${fmtShort(summary.total_revenue)}` : '—'}
          sub="Akumulasi seluruh pelanggan"
          color="#6366f1" loading={loading}
        />
        <StatBox
          icon={ShoppingCart} title="Total Orders"
          value={summary ? summary.total_orders.toLocaleString('id-ID') : '—'}
          sub="Total frekuensi transaksi"
          color="#10b981" loading={loading}
        />
        <StatBox
          icon={TrendingUp} title="Avg Revenue/Customer"
          value={summary ? `$${fmtShort(summary.avg_order_value)}` : '—'}
          sub="Rata-rata per pelanggan"
          color="#f59e0b" loading={loading}
        />
        <StatBox
          icon={Users} title="Avg Order Frequency"
          value={summary ? `${summary.avg_frequency}x` : '—'}
          sub="Rata-rata frekuensi beli"
          color="#8b5cf6" loading={loading}
        />
      </div>

      {/* Revenue per Segment (Bar) + Avg Order Value per Segment (ComposedChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Total Revenue per Segment */}
        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-semibold">Total Revenue per Segment</h2>
          </div>
          <p className="text-muted text-xs mb-5">Akumulasi revenue (USD) tiap segmen pelanggan</p>
          {loading ? (
            <div className="h-52 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={segChart} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${fmtShort(v)}`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_revenue" name="Revenue ($)" radius={[6, 6, 0, 0]}>
                  {segChart.map((_, i) => <Cell key={i} fill={SEG_COLORS[i % SEG_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders per Segment */}
        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-semibold">Total Orders per Segment</h2>
          </div>
          <p className="text-muted text-xs mb-5">Jumlah total transaksi yang dilakukan tiap segmen pelanggan</p>
          {loading ? (
            <div className="h-52 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={segChart} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_orders" name="Total Orders" radius={[6, 6, 0, 0]}>
                  {segChart.map((_, i) => <Cell key={i} fill={['#10b981', '#34d399', '#6ee7b7'][i] || '#10b981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monetary Distribution + Recency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-semibold">Distribusi Revenue per Pelanggan</h2>
          </div>
          <p className="text-muted text-xs mb-5">Sebaran nilai transaksi kumulatif per pelanggan (USD)</p>
          {loading ? (
            <div className="h-48 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moneyDist} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Pelanggan" radius={[5, 5, 0, 0]}>
                  {moneyDist.map((_, i) => <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-semibold">Distribusi Recency Pelanggan</h2>
          </div>
          <p className="text-muted text-xs mb-5">Hari sejak transaksi terakhir — semakin kecil semakin aktif</p>
          {loading ? (
            <div className="h-48 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recencyDist} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Pelanggan" radius={[5, 5, 0, 0]}>
                  {recencyDist.map((_, i) => (
                    <Cell key={i} fill={['#10b981','#34d399','#f59e0b','#f97316','#ef4444'][i] || '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue Contribution (Pareto) */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <h2 className="text-white font-semibold">Kontribusi Revenue per Segment</h2>
          <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>Pareto View</span>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="h-16 animate-pulse rounded-xl" style={{ background: '#2a2d3a' }} />
          ) : (
            <div className="space-y-4">
              {segRevenue.map((s, i) => {
                const totalRev = segRevenue.reduce((acc, x) => acc + x.total_revenue, 0);
                const cumulative = segRevenue.slice(0, i + 1).reduce((acc, x) => acc + x.total_revenue, 0);
                const cumulativePct = totalRev > 0 ? (cumulative / totalRev * 100).toFixed(1) : 0;
                return (
                  <div key={s.segment} className="flex items-center gap-4">
                    <div className="w-28 flex-shrink-0">
                      <p className="text-white text-sm font-medium">{s.segment}</p>
                      <p className="text-muted text-xs">{s.customer_count} pelanggan</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted">${fmtShort(s.total_revenue)}</span>
                        <span className="text-xs font-semibold" style={{ color: SEG_COLORS[i % SEG_COLORS.length] }}>{s.revenue_pct}%</span>
                      </div>
                      <div className="h-3 rounded-full" style={{ background: '#2a2d3a' }}>
                        <div className="h-3 rounded-full transition-all"
                          style={{ width: `${s.revenue_pct}%`, background: SEG_COLORS[i % SEG_COLORS.length] }} />
                      </div>
                    </div>
                    <div className="w-24 flex-shrink-0 text-right">
                      <p className="text-xs text-muted">Kumulatif</p>
                      <p className="text-sm font-bold text-white">{cumulativePct}%</p>
                    </div>
                    <div className="w-20 flex-shrink-0 text-right">
                      <p className="text-xs text-muted">Avg Order</p>
                      <p className="text-sm font-semibold text-white">${fmtShort(s.avg_order_value)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t mt-2" style={{ borderColor: '#2a2d3a' }}>
                <div className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <p className="text-white text-sm font-bold">Total</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #10b981, #f59e0b)' }} />
                  </div>
                  <div className="w-24 flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-white">100%</p>
                  </div>
                  <div className="w-20 flex-shrink-0 text-right">
                    <p className="text-sm font-bold" style={{ color: '#818cf8' }}>${fmtShort(segRevenue.reduce((a, s) => a + s.total_revenue, 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Sales Forecast Panel */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: '#2a2d3a', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Sales Forecast</h2>
              <p className="text-muted text-xs">Proyeksi penjualan bulan depan berbasis data RFM oleh NexaBI AI</p>
            </div>
          </div>
          <button
            onClick={generateForecast}
            disabled={loadingFC}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {loadingFC
              ? <><Loader2 className="w-4 h-4 animate-spin" />Menganalisis...</>
              : <><Sparkles className="w-4 h-4" />{forecast ? 'Refresh Forecast' : 'Generate Forecast'}</>
            }
          </button>
        </div>

        {/* Context chips */}
        {fcContext && !loadingFC && (
          <div className="flex flex-wrap gap-2 px-6 pt-4">
            {[
              { label: 'Total Customers', value: fcContext.total_customers.toLocaleString('id-ID'), color: '#818cf8' },
              { label: 'Loyal',           value: fcContext.loyal_count.toLocaleString('id-ID'),    color: '#34d399' },
              { label: 'At Risk',         value: fcContext.at_risk_count.toLocaleString('id-ID'),  color: '#f87171' },
              { label: 'Total Revenue',   value: `$${fmtShort(fcContext.total_revenue)}`,           color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                style={{ background: '#13161f', border: '1px solid #2a2d3a' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-muted">{label}:</span>
                <span className="font-semibold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {!forecast && !loadingFC && !fcError && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <TrendingUp className="w-8 h-8" style={{ color: '#6366f1' }} />
              </div>
              <p className="text-white font-medium mb-1">Belum Ada Forecast</p>
              <p className="text-muted text-sm">Klik "Generate Forecast" untuk mendapatkan proyeksi penjualan bulan depan dari AI.</p>
              <p className="text-muted text-xs mt-2 italic">* Forecast bersifat estimasi naratif berbasis pola data RFM historis</p>
            </div>
          )}

          {loadingFC && (
            <div className="space-y-3 py-4">
              {[100, 88, 94, 76, 82, 65].map((w, i) => (
                <div key={i} className="h-4 rounded-lg animate-pulse" style={{ background: '#2a2d3a', width: `${w}%` }} />
              ))}
            </div>
          )}

          {fcError && (
            <div className="px-4 py-4 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              ⚠️ {fcError}
            </div>
          )}

          {forecast && !loadingFC && (
            <div className="markdown-content animate-fade-in">
              <ReactMarkdown>{forecast}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
