import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, BarChart3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.post(
        '/auth/register',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrasi gagal. Username mungkin sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)' }}>

      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md mx-3 sm:mx-4 animate-fade-in">
        {/* Header branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">NexaBI</h1>
          <p className="text-muted mt-1 text-xs sm:text-sm">Buat akun untuk mengakses platform</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-5 sm:p-8 border"
          style={{ background: 'rgba(26,29,39,0.8)', borderColor: '#2a2d3a', backdropFilter: 'blur(20px)' }}>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Daftar Akun Baru</h2>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Registrasi Berhasil!</h3>
              <p className="text-sm text-muted">Mengarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Username</label>
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Pilih username"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-muted text-sm outline-none transition-all focus:ring-2"
                  style={{
                    background: '#0f1117',
                    border: '1px solid #2a2d3a',
                    '--tw-ring-color': '#6366f1',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Buat password (min. 6 karakter)"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-muted text-sm outline-none transition-all focus:ring-2"
                    style={{
                      background: '#0f1117',
                      border: '1px solid #2a2d3a',
                      '--tw-ring-color': '#6366f1',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: loading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...</>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center mt-3 sm:mt-4">
                <span className="text-muted text-sm">Sudah punya akun? </span>
                <button type="button" onClick={goToLogin} className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                  Masuk di sini
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-muted text-xs mt-6">
          NexaBI © 2026 · Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
