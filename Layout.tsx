import React from 'react';
import { ViewState } from '../types';
import { Activity, MessageSquare, FileText, Bell, Settings, User, Watch } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: Activity },
    { id: ViewState.CHAT, label: 'Consultation', icon: MessageSquare },
    { id: ViewState.REPORTS, label: 'Report Analysis', icon: FileText },
    { id: ViewState.REMINDERS, label: 'Reminders', icon: Bell },
    { id: ViewState.DEVICES, label: 'Devices', icon: Watch },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="hidden lg:block ml-3 font-bold text-slate-800 text-lg">Medico AI</span>
          </div>

          <nav className="mt-6 px-2 lg:px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                  currentView === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
            <div className="flex items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <User className="w-6 h-6" />
                </div>
                <div className="hidden lg:block ml-3">
                    <p className="text-sm font-semibold text-slate-700">John Doe</p>
                    <p className="text-xs text-slate-500">Patient ID: 8492</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-slate-800">
                {currentView === ViewState.DASHBOARD && 'Health Overview'}
                {currentView === ViewState.CHAT && 'AI Consultation'}
                {currentView === ViewState.REPORTS && 'Medical Report Analysis'}
                {currentView === ViewState.REMINDERS && 'Medication Reminders'}
                {currentView === ViewState.DEVICES && 'Connected Devices'}
            </h2>
            <div className="flex items-center space-x-4">
                <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    System Online
                </span>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};