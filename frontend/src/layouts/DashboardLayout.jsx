import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b flex items-center justify-end px-6 flex-shrink-0" style={{ borderColor: '#2a2d3a', background: '#13161f' }}>
          <div className="flex items-center gap-4">
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
