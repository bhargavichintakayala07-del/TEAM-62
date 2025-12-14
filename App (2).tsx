import React, { useState } from 'react';
import { ViewState } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { ReportUploader } from './components/ReportUploader';
import { Reminders } from './components/Reminders';
import { DeviceIntegration } from './components/DeviceIntegration';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case ViewState.CHAT:
        return <ChatInterface />;
      case ViewState.REPORTS:
        return <ReportUploader />;
      case ViewState.REMINDERS:
        return <Reminders />;
      case ViewState.DEVICES:
        return <DeviceIntegration />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
