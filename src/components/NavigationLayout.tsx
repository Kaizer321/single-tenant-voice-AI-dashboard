import React from 'react';
import { useAuth } from '../context/AuthContext';
import { businessConfig } from '../config/business';
import { LayoutDashboard, Phone, CheckCircle2, LogOut, Radio } from 'lucide-react';

export type NavTab = 'overview' | 'calls' | 'followups';

interface NavigationLayoutProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const NavigationLayout: React.FC<NavigationLayoutProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const { userEmail, logout } = useAuth();
  const isDev = import.meta.env.VITE_ENABLE_DEV !== 'false';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Business Branding Header */}
          <div className="p-5 border-b border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-600/20 shrink-0">
                {businessConfig.logoUrl ? (
                  <img src={businessConfig.logoUrl} alt={businessConfig.name} className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                  businessConfig.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-100 truncate">{businessConfig.name}</h1>
                <p className="text-xs text-slate-400 truncate">{businessConfig.tagline}</p>
              </div>
            </div>

            {/* Voice Agent Status Indicator */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span className="font-medium">Voice Agent: Online</span>
              </div>
            </div>
          </div>

          {/* Nav Items (EXACTLY 3 ITEMS: Overview, Call History, Follow-ups) */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onSelectTab('overview')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onSelectTab('calls')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'calls'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call History</span>
            </button>

            <button
              onClick={() => onSelectTab('followups')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'followups'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Follow-ups</span>
            </button>
          </nav>
        </div>

        {/* User Account & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {isDev && (
            <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300 flex items-center justify-between">
              <span>Dev Simulator Mode</span>
              <a href="#/dev/simulator" className="underline font-semibold hover:text-purple-200">Open</a>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="truncate max-w-[140px]" title={userEmail || ''}>
              <span className="block text-slate-300 font-medium truncate">{userEmail || 'Admin User'}</span>
              <span className="text-[11px] text-slate-500">{businessConfig.phone}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
