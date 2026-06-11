import { useNavigate } from 'react-router-dom';
import { BarChart3, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)' }}>

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="relative z-10 text-center max-w-md mx-4 animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <BarChart3 className="w-8 h-8 text-white" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-black mb-2"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-muted text-sm mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted transition-all hover:text-white hover:bg-white/5"
            style={{ border: '1px solid #2a2d3a' }}>
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Home className="w-4 h-4" />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
