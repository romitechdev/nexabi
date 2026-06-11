import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, BarChart3, Loader2, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const msg = sessionStorage.getItem('nexabi_auth_msg');
    if (msg) {
      setSessionMsg(msg);
      sessionStorage.removeItem('nexabi_auth_msg');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm membutuhkan form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await api.post(
        '/auth/login',
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      localStorage.setItem('nexabi_token', res.data.access_token);
      localStorage.setItem('nexabi_username', username);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)' }}>

      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NexaBI</h1>
          <p className="text-muted mt-1 text-sm">Business Intelligence Dashboard</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8 border"
          style={{ background: 'rgba(26,29,39,0.8)', borderColor: '#2a2d3a', backdropFilter: 'blur(20px)' }}>
          <h2 className="text-xl font-semibold text-white mb-2">Selamat Datang</h2>
          <p className="text-muted text-sm mb-6">Masuk ke NexaBI Platform</p>

          {/* Session expired notification */}
          {sessionMsg && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-5"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
              <Info className="w-4 h-4 flex-shrink-0" />
              {sessionMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Username</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
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
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
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
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: loading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center mt-4">
              <span className="text-muted text-sm">Belum punya akun? </span>
              <button type="button" onClick={goToRegister} className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                Daftar sekarang
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          NexaBI © 2026 ·
        </p>
      </div>
    </div>
  );
}
