import React from 'react';
import { LayoutDashboard, MessageSquare, Settings, Activity, FileText } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.CHAT, label: 'Chat Assistant', icon: MessageSquare },
    { id: AppView.DASHBOARD, label: 'Health Dashboard', icon: LayoutDashboard },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-20 lg:w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300">
      <div>
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="ml-3 font-bold text-slate-800 hidden lg:block text-lg">Medico</span>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-2 lg:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center p-3 rounded-xl transition-colors duration-200 group
                  ${isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                <Icon size={22} className={isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className={`ml-3 font-medium hidden lg:block ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 hidden lg:block">
        <div className="bg-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center mb-2">
            <Activity size={18} className="mr-2" />
            <span className="font-semibold text-sm">Pro Tip</span>
          </div>
          <p className="text-xs text-teal-100 leading-relaxed">
            Upload your lab reports to get a detailed breakdown of your metrics.
          </p>
        </div>
      </div>
    </div>
  );
};