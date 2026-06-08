import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../api/axios';

const defaultForm = {
  customer_id: '', customer_name: '', segment: '',
  recency: '', frequency: '', monetary: '', cluster: 1,
  recency_log: 0, frequency_log: 0, monetary_log: 0,
  recency_scaled: 0, frequency_scaled: 0, monetary_scaled: 0,
};

export default function CustomerModal({ mode, customer, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const isDelete = mode === 'delete';
  const [form, setForm] = useState(isEdit ? { ...customer } : { ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        recency: parseInt(form.recency) || 0,
        frequency: parseInt(form.frequency) || 0,
        monetary: parseFloat(form.monetary) || 0,
        cluster: parseInt(form.cluster) || 1,
      };
      if (isEdit) {
        await api.put(`/customers/${customer.customer_id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/customers/${customer.customer_id}`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menghapus.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl border animate-slide-up"
        style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#2a2d3a' }}>
          <h3 className="text-lg font-semibold text-white">
            {isDelete ? '🗑️ Hapus Customer' : isEdit ? '✏️ Edit Customer' : '➕ Tambah Customer'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {isDelete ? (
            <div>
              <p className="text-gray-300 mb-2">
                Apakah kamu yakin ingin menghapus customer berikut?
              </p>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <p className="text-white font-semibold">{customer.customer_name}</p>
                <p className="text-muted text-sm">ID: {customer.customer_id}</p>
              </div>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
              <div className="flex gap-3 mt-5">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-white transition-all"
                  style={{ border: '1px solid #2a2d3a', background: '#13161f' }}>
                  Batal
                </button>
                <button onClick={handleDelete} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#dc2626' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'modal-customer-id', key: 'customer_id', label: 'Customer ID', disabled: isEdit },
                  { id: 'modal-customer-name', key: 'customer_name', label: 'Nama Customer' },
                  { id: 'modal-segment', key: 'segment', label: 'Segment' },
                  { id: 'modal-recency', key: 'recency', label: 'Recency (hari)', type: 'number' },
                  { id: 'modal-frequency', key: 'frequency', label: 'Frequency', type: 'number' },
                  { id: 'modal-monetary', key: 'monetary', label: 'Monetary (Rp)', type: 'number' },
                ].map(({ id, key, label, type = 'text', disabled = false }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
                    <input
                      id={id}
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      disabled={disabled}
                      required
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                      style={{
                        background: '#0f1117',
                        border: '1px solid #2a2d3a',
                        opacity: disabled ? 0.6 : 1,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Cluster selector */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Cluster</label>
                <select
                  id="modal-cluster"
                  value={form.cluster}
                  onChange={(e) => setForm({ ...form, cluster: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#0f1117', border: '1px solid #2a2d3a' }}>
                  <option value={1}>Cluster 1 — Pelanggan Pasif</option>
                  <option value={2}>Cluster 2 — Pelanggan Loyal</option>
                </select>
              </div>

              {error && (
                <p className="text-red-400 text-sm px-1">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-white transition-all"
                  style={{ border: '1px solid #2a2d3a', background: '#13161f' }}>
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : isEdit ? 'Simpan Perubahan' : 'Tambah Customer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
