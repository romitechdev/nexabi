import { useState, useEffect } from 'react';
import { AlertTriangle, BrainCircuit, Sparkles, Loader2, RefreshCw, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';

const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

export default function ChurnRiskPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    api.get('/analytics/churn-risk')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchAI = async () => {
    setLoadingAI(true);
    setAiError('');
    setAiAnalysis('');
    try {
      const r = await api.get('/analytics/churn-ai');
      setAiAnalysis(r.data.analysis);
    } catch (e) {
      setAiError(e.response?.data?.detail || 'Gagal mengambil analisis AI.');
    } finally {
      setLoadingAI(false);
    }
  };

  const riskLevel = data
    ? data.total_at_risk > 300 ? { label: 'TINGGI', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
      : data.total_at_risk > 150 ? { label: 'SEDANG', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
      : { label: 'RENDAH', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' }
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Churn Risk Monitor</h1>
        <p className="text-muted text-xs sm:text-sm mt-1">Pelanggan pasif yang sudah lama tidak bertransaksi — berisiko hilang</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4 sm:p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <p className="text-muted text-xs sm:text-sm mb-2 sm:mb-3">Total Berisiko Churn</p>
          {loading ? <div className="h-7 sm:h-8 animate-pulse rounded" style={{ background: '#2a2d3a' }} /> : (
            <>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: riskLevel?.color }}>{data?.total_at_risk.toLocaleString('id-ID')}</p>
              <p className="text-muted text-xs mt-1">pelanggan perlu perhatian</p>
            </>
          )}
        </div>
        <div className="rounded-2xl border p-4 sm:p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <p className="text-muted text-xs sm:text-sm mb-2 sm:mb-3">Avg Recency (Keseluruhan)</p>
          {loading ? <div className="h-7 sm:h-8 animate-pulse rounded" style={{ background: '#2a2d3a' }} /> : (
            <>
              <p className="text-2xl sm:text-3xl font-bold text-white">{data?.avg_recency} <span className="text-base sm:text-lg font-normal text-muted">hari</span></p>
              <p className="text-muted text-xs mt-1">sejak transaksi terakhir rata-rata</p>
            </>
          )}
        </div>
        <div className="rounded-2xl border p-4 sm:p-5" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
          <p className="text-muted text-xs sm:text-sm mb-2 sm:mb-3">Level Risiko</p>
          {loading ? <div className="h-7 sm:h-8 animate-pulse rounded" style={{ background: '#2a2d3a' }} /> : (
            <>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl"
                style={{ background: riskLevel?.bg, border: `1px solid ${riskLevel?.border}` }}>
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: riskLevel?.color }} />
                <span className="font-bold text-xs sm:text-sm" style={{ color: riskLevel?.color }}>{riskLevel?.label}</span>
              </div>
              <p className="text-muted text-xs mt-2">berdasarkan jumlah pelanggan berisiko</p>
            </>
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b gap-3"
          style={{ borderColor: '#2a2d3a', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Analisis Churn AI</p>
              <p className="text-muted text-xs">Strategi retensi dari NexaBI AI Advisor</p>
            </div>
          </div>
          <button onClick={fetchAI} disabled={loadingAI}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white disabled:opacity-60 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            {loadingAI ? <><Loader2 className="w-4 h-4 animate-spin" />Menganalisis...</> : <><Sparkles className="w-4 h-4" />{aiAnalysis ? 'Refresh' : 'Analisis AI'}</>}
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {!aiAnalysis && !loadingAI && !aiError && (
            <p className="text-muted text-sm text-center py-6">Klik "Analisis AI" untuk mendapatkan strategi retensi dari AI.</p>
          )}
          {loadingAI && <div className="space-y-2 py-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded" style={{ background: '#2a2d3a', width: `${[100, 80, 90, 70][i]}%` }} />)}</div>}
          {aiError && <p className="text-red-400 text-sm">{aiError}</p>}
          {aiAnalysis && <div className="markdown-content animate-fade-in"><ReactMarkdown>{aiAnalysis}</ReactMarkdown></div>}
        </div>
      </div>

      {/* At-risk table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
            <h2 className="text-white font-semibold text-sm sm:text-base">Daftar Pelanggan Berisiko (Top 50)</h2>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            Cluster Pasif · Recency {'>'} Avg
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2d3a' }}>
                {['Nama', 'Segment', 'Recency', 'Frequency', 'Monetary', 'Risk Score'].map(h => (
                  <th key={h} className="px-3 py-3 sm:px-4 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2d3a' }}>
                  {[...Array(6)].map((_, j) => <td key={j} className="px-3 py-3 sm:px-4 sm:py-3"><div className="h-4 animate-pulse rounded" style={{ background: '#2a2d3a' }} /></td>)}
                </tr>
              )) : data?.customers.map((c) => {
                // Risk score sederhana berdasarkan recency relatif terhadap avg
                const riskPct = Math.min(100, Math.round((c.recency / (data.avg_recency * 2)) * 100));
                const riskColor = riskPct > 70 ? '#ef4444' : riskPct > 40 ? '#f59e0b' : '#10b981';
                return (
                  <tr key={c.customer_id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #2a2d3a' }}>
                    <td className="px-3 py-3 sm:px-4 sm:py-3">
                      <p className="text-white font-medium text-xs sm:text-sm">{c.customer_name}</p>
                      <p className="text-muted text-xs">{c.customer_id}</p>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3 text-muted whitespace-nowrap">{c.segment}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" style={{ color: riskColor }} />
                        <span className="font-semibold" style={{ color: riskColor }}>{c.recency}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3 text-white whitespace-nowrap">{c.frequency}x</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3 text-white whitespace-nowrap">{fmt(c.monetary)}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 sm:w-16 rounded-full" style={{ background: '#2a2d3a' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${riskPct}%`, background: riskColor }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: riskColor }}>{riskPct}%</span>
                      </div>
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
