export default function StatCard({ title, value, subtitle, icon: Icon, color = 'accent', loading = false }) {
  const colorMap = {
    accent: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', icon: '#818cf8' },
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '#34d399' },
    danger: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '#f87171' },
    violet: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', icon: '#a78bfa' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '#fbbf24' },
  };
  const c = colorMap[color];

  return (
    <div className="rounded-2xl p-5 border transition-all hover:border-opacity-60"
      style={{ background: '#1a1d27', borderColor: '#2a2d3a' }}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted text-sm font-medium">{title}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          {Icon && <Icon style={{ width: '18px', height: '18px', color: c.icon }} />}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 rounded-lg w-3/4 animate-pulse" style={{ background: '#2a2d3a' }} />
          <div className="h-4 rounded w-1/2 animate-pulse" style={{ background: '#2a2d3a' }} />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-muted text-xs">{subtitle}</p>}
        </>
      )}
    </div>
  );
}
