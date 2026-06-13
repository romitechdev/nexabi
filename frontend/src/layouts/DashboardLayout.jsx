import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setSidebarOpen(false);
    window.addEventListener('sidebar-close', handleClose);
    return () => window.removeEventListener('sidebar-close', handleClose);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with mobile slide-in */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 lg:justify-end lg:px-6 flex-shrink-0" style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all"
            style={{ border: '1px solid #2a2d3a' }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium leading-none">
                  {localStorage.getItem('nexabi_username') || 'Administrator'}
                </p>
                <p className="text-muted text-xs mt-1">NexaBI Platform</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {(localStorage.getItem('nexabi_username') || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
