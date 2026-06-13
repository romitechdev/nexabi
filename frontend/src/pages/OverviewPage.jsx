import { useState, useEffect } from 'react';
import {
  Users, Crown, UserX, DollarSign, TrendingUp, BrainCircuit,
  Loader2, RefreshCw, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import StatCard from '../components/StatCard';

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState('');

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => setOverview(res.data))
      .catch(console.error)
      .finally(() => setLoadingOverview(false));
  }, []);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    setInsightError('');
    setInsight('');
    try {
      const res = await api.get('/analytics/ai-insight');
      setInsight(res.data.insight);
    } catch (err) {
      setInsightError(err.response?.data?.detail || 'Gagal mengambil insight AI. Coba lagi.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const chartData = overview ? [
    { name: 'Pelanggan Loyal', value: overview.cluster_loyal_count, color: '#10b981' },
    { name: 'Pelanggan Pasif', value: overview.cluster_pasif_count, color: '#ef4444' },
  ] : [];

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Overview Dashboard</h1>
        <p className="text-muted text-xs sm:text-sm mt-1">Ringkasan performa & segmentasi pelanggan retail</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Pelanggan"
          value={overview ? overview.total_customers.toLocaleString('id-ID') : '—'}
          subtitle="Dari seluruh data RFM"
          icon={Users}
          color="accent"
          loading={loadingOverview}
        />
        <StatCard
          title="Pelanggan Loyal"
          value={overview ? overview.cluster_loyal_count.toLocaleString('id-ID') : '—'}
          subtitle={overview ? `${((overview.cluster_loyal_count / overview.total_customers) * 100).toFixed(1)}% dari total` : ''}
          icon={Crown}
          color="success"
          loading={loadingOverview}
        />
        <StatCard
          title="Pelanggan Pasif"
          value={overview ? overview.cluster_pasif_count.toLocaleString('id-ID') : '—'}
          subtitle={overview ? `${((overview.cluster_pasif_count / overview.total_customers) * 100).toFixed(1)}% dari total` : ''}
          icon={UserX}
          color="danger"
          loading={loadingOverview}
        />
        <StatCard
          title="Avg. Monetary"
          value={overview ? formatRupiah(overview.average_monetary) : '—'}
          subtitle="Rata-rata per pelanggan"
          icon={DollarSign}
          color="violet"
          loading={loadingOverview}
        />
      </div>

      {/* Chart + Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-2xl border p-4 sm:p-5"
          style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#818cf8' }} />
            <h2 className="text-white font-semibold text-sm sm:text-base">Distribusi Segmen Pelanggan</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: '12px', color: '#f1f5f9' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4"
          style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <h2 className="text-white font-semibold text-sm sm:text-base">Ringkasan Cepat</h2>
          {loadingOverview ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#2a2d3a' }} />
              ))}
            </div>
          ) : overview ? (
            <div className="space-y-3">
              {[
                { label: 'Total Customer', value: overview.total_customers.toLocaleString('id-ID'), color: '#818cf8' },
                { label: 'Cluster Loyal', value: overview.cluster_loyal_count.toLocaleString('id-ID'), color: '#34d399' },
                { label: 'Cluster Pasif', value: overview.cluster_pasif_count.toLocaleString('id-ID'), color: '#f87171' },
                { label: 'Avg Monetary', value: formatRupiah(overview.average_monetary), color: '#a78bfa' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: '#13161f', border: '1px solid #2a2d3a' }}>
                  <span className="text-muted text-sm">{label}</span>
                  <span className="font-semibold text-sm" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* AI Insight Panel */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        {/* Panel header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b gap-3"
          style={{
            borderColor: '#2a2d3a',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm sm:text-base">NexaBI AI Smart Advisor</h2>
              <p className="text-muted text-xs">Analisis bisnis & rekomendasi berbasis data real-time</p>
            </div>
          </div>
          <button
            id="btn-generate-insight"
            onClick={fetchInsight}
            disabled={loadingInsight}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {loadingInsight ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...</>
            ) : (
              <><Sparkles className="w-4 h-4" />{insight ? 'Refresh Insight' : 'Generate Insight'}</>
            )}
          </button>
        </div>

        {/* Panel body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {!insight && !loadingInsight && !insightError && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <BrainCircuit className="w-8 h-8" style={{ color: '#6366f1' }} />
              </div>
              <p className="text-white font-medium mb-1">Belum Ada Insight</p>
              <p className="text-muted text-sm">Klik tombol "Generate Insight" untuk mendapatkan analisis AI berbasis data pelanggan kamu.</p>
            </div>
          )}

          {loadingInsight && (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 rounded-lg animate-pulse"
                  style={{ background: '#2a2d3a', width: `${[100, 85, 92, 78, 65][i]}%` }} />
              ))}
            </div>
          )}

          {insightError && (
            <div className="px-4 py-4 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              ⚠️ {insightError}
            </div>
          )}

          {insight && (
            <div className="markdown-content animate-fade-in">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
