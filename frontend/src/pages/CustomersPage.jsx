import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, RefreshCw, Download } from 'lucide-react';
import api from '../api/axios';
import CustomerModal from '../components/CustomerModal';

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit'|'delete', customer? }

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    api.get('/customers')
      .then((res) => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleModalSuccess = () => {
    setModal(null);
    fetchCustomers();
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Customer ID', 'Customer Name', 'Segment', 'Recency', 'Frequency', 'Monetary', 'Cluster'];
    const rows = customers.map(c => 
      [c.customer_id, `"${c.customer_name}"`, c.segment, c.recency, c.frequency, c.monetary, c.cluster].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nexabi_customers.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clusterBadge = (cluster) =>
    cluster === 2
      ? { label: 'Loyal', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' }
      : { label: 'Pasif', bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-7xl">
      {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Customer</h1>
          <p className="text-muted text-sm mt-1">
            {loading ? 'Memuat...' : `${filtered.length.toLocaleString('id-ID')} dari ${customers.length.toLocaleString('id-ID')} pelanggan`}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={handleExportCSV} disabled={customers.length === 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/5 disabled:opacity-50 flex-shrink-0"
            style={{ border: '1px solid #2a2d3a', background: '#1a1d27' }}>
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button onClick={fetchCustomers}
            className="p-2 rounded-xl sm:p-2.5 text-muted hover:text-white transition-all hover:bg-white/5 flex-shrink-0"
            style={{ border: '1px solid #2a2d3a' }}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-add-customer"
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Tambah Customer</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
        <div className="relative max-w-sm w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#cbd5e1' }} />
        <input
          id="customer-search"
          type="text"
          placeholder="Cari nama atau ID pelanggan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-muted outline-none"
          style={{ background: '#1a1d27', border: '1px solid #2a2d3a' }}
        />
      </div>

      {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr style={{ background: '#13161f', borderBottom: '1px solid #2a2d3a' }}>
                {['Customer ID', 'Nama', 'Segment', 'Recency', 'Frequency', 'Monetary', 'Cluster', 'Aksi'].map((h) => (
                  <th key={h} className="px-3 py-3 sm:px-4 sm:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #2a2d3a' }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-3 py-3 sm:px-4 sm:py-3.5">
                        <div className="h-4 rounded animate-pulse" style={{ background: '#2a2d3a', width: j === 7 ? '64px' : '100%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 sm:py-12 text-muted">
                    {search ? 'Tidak ada pelanggan yang cocok.' : 'Belum ada data pelanggan.'}
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const badge = clusterBadge(c.cluster);
                  return (
                    <tr key={c.id}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid #2a2d3a' }}>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-muted font-mono text-xs whitespace-nowrap">{c.customer_id}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-white font-medium text-xs sm:text-sm">{c.customer_name}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-muted whitespace-nowrap">{c.segment}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-white whitespace-nowrap">{c.recency}h</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-white whitespace-nowrap">{c.frequency}x</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 text-white whitespace-nowrap">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(c.monetary)}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.color }} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-edit-${c.customer_id}`}
                            onClick={() => setModal({ mode: 'edit', customer: c })}
                            className="p-1.5 rounded-lg text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                            title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${c.customer_id}`}
                            onClick={() => setModal({ mode: 'delete', customer: c })}
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-t gap-3"
            style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
            <p className="text-muted text-xs text-center sm:text-left">
              Halaman {page} dari {totalPages} · {filtered.length} total
            </p>
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-muted hover:text-white transition-all disabled:opacity-30"
                style={{ border: '1px solid #2a2d3a' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pg = i + Math.max(1, page - 2);
                if (pg > totalPages) return null;
                return (
                  <button key={pg}
                    onClick={() => setPage(pg)}
                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                    style={pg === page
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }
                      : { color: '#cbd5e1', border: '1px solid #2a2d3a' }
                    }>
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-muted hover:text-white transition-all disabled:opacity-30"
                style={{ border: '1px solid #2a2d3a' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <CustomerModal
          mode={modal.mode}
          customer={modal.customer}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
