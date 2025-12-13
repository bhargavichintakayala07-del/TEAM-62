import React from 'react';
import { LayoutDashboard, MessageSquareText, CalendarClock, FileText, Activity, ShieldCheck, Pill, Coffee, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.CHAT, label: 'AI Chatbot', icon: MessageSquareText },
    { id: ViewState.MEDICINE, label: 'Medicine Finder', icon: Pill },
    { id: ViewState.REMEDY, label: 'Remedy Suggester', icon: Coffee },
    { id: ViewState.REMINDERS, label: 'Reminders', icon: CalendarClock },
    { id: ViewState.DOCUMENTS, label: 'My Reports', icon: FileText },
  ];

  return (
    <div className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <Activity size={20} />
        </div>
        <span className="font-bold text-lg text-slate-800 hidden md:block">Medico</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
              currentView === item.id
                ? 'bg-emerald-50 text-emerald-600 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon size={22} />
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors mb-4"
        >
            <LogOut size={22} />
            <span className="hidden md:block">Logout</span>
        </button>

        <div className="bg-slate-50 p-4 rounded-xl hidden md:block">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Secure</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your health data is processed locally or securely via encrypted channels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;