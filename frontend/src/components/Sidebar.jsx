import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BrainCircuit, LogOut, BarChart3,
  ChevronRight, TrendingUp, Crown, AlertTriangle, PackageOpen
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/dashboard/market-basket', icon: PackageOpen, label: 'Market Basket' },
  { to: '/dashboard/top-customers', icon: Crown, label: 'Top Customers' },
  { to: '/dashboard/churn-risk', icon: AlertTriangle, label: 'Churn Risk' },
  { to: '/dashboard/customers', icon: Users, label: 'Customers' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('nexabi_token');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="flex flex-col w-60 flex-shrink-0 border-r"
      style={{ background: '#13161f', borderColor: '#2a2d3a', minHeight: '100vh' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: '#2a2d3a' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">NexaBI</p>
          <p className="text-muted text-xs">Analytics Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider px-2 mb-3">Menu Utama</p>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'text-white' : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', color: '#818cf8' }
              : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }}
                  className={isActive ? 'text-indigo-400' : ''} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* AI Advisor label */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted mt-1">
          <BrainCircuit style={{ width: '18px', height: '18px' }} />
          <span className="flex-1">AI Advisor</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
            Live
          </span>
        </div>
      </nav>

      {/* Footer Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#2a2d3a' }}>
        <button id="sidebar-logout" onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut style={{ width: '18px', height: '18px' }} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
