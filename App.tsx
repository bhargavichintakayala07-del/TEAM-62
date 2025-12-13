import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Dashboard } from './components/Dashboard';
import { SettingsView } from './components/SettingsView';
import { AppView, HealthMetric } from './types';
import { startChatSession } from './services/geminiService';
import { Chat } from "@google/genai";

// Mock initial data for demonstration if none provided
const MOCK_METRICS: HealthMetric[] = [
    { date: '2023-10-01', value: 180, unit: 'mg/dL', type: 'Total Cholesterol' },
    { date: '2023-11-15', value: 175, unit: 'mg/dL', type: 'Total Cholesterol' },
    { date: '2024-01-10', value: 168, unit: 'mg/dL', type: 'Total Cholesterol' },
    { date: '2024-03-20', value: 95, unit: 'mg/dL', type: 'Glucose (Fasting)' },
    { date: '2024-04-05', value: 92, unit: 'mg/dL', type: 'Glucose (Fasting)' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  // Initialize Chat Session
  useEffect(() => {
    try {
      const session = startChatSession();
      setChatSession(session);
    } catch (e) {
      console.error("Failed to initialize chat session", e);
    }
  }, []);

  // Load metrics from local storage on mount (simulating database)
  useEffect(() => {
    const savedMetrics = localStorage.getItem('medico_metrics');
    if (savedMetrics) {
      setMetrics(JSON.parse(savedMetrics));
    } else {
        // Load some mock data for empty state visualization immediately for the user
        setMetrics(MOCK_METRICS); 
        localStorage.setItem('medico_metrics', JSON.stringify(MOCK_METRICS));
    }
  }, []);

  // Update metrics handler
  const handleNewMetrics = (newMetrics: HealthMetric[]) => {
    setMetrics(prev => {
        const updated = [...prev, ...newMetrics];
        localStorage.setItem('medico_metrics', JSON.stringify(updated));
        return updated;
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatArea chatSession={chatSession} onNewMetricsFound={handleNewMetrics} />;
      case AppView.DASHBOARD:
        return <Dashboard metrics={metrics} />;
      case AppView.SETTINGS:
        return <SettingsView />;
      default:
        return <ChatArea chatSession={chatSession} onNewMetricsFound={handleNewMetrics} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 h-full relative flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
            <span className="font-bold text-teal-600">Medico Assistant</span>
            <span className="text-xs text-slate-400 capitalize">{currentView}</span>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;