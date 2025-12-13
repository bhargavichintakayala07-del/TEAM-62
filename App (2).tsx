import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Reminders from './components/Reminders';
import Documents from './components/Documents';
import AuthScreen from './components/AuthScreen';
import { ViewState, Message, HealthRiskProfile } from './types';
import { analyzeHealthRisks } from './services/geminiService';
import { storageService } from './services/storageService';

function App() {
  // Authentication State
  const [userEmail, setUserEmail] = useState<string | null>(storageService.getCurrentUser());

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Separate message histories for different modes
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [medicineMessages, setMedicineMessages] = useState<Message[]>([]);
  const [remedyMessages, setRemedyMessages] = useState<Message[]>([]);
  
  const [isTyping, setTyping] = useState(false);
  
  // Default Risk Profile
  const [riskProfile, setRiskProfile] = useState<HealthRiskProfile>({
    cardiovascular: 15,
    metabolic: 20,
    respiratory: 10,
    lifestyle: 30,
    overallScore: 25,
    summary: "Health status is generally good. Maintain regular activity."
  });

  // Load User Data on Login/Mount
  useEffect(() => {
    if (userEmail) {
      storageService.setCurrentUser(userEmail);
      const data = storageService.getUserData(userEmail);
      
      setChatMessages(data.chats[ViewState.CHAT] || []);
      setMedicineMessages(data.chats[ViewState.MEDICINE] || []);
      setRemedyMessages(data.chats[ViewState.REMEDY] || []);
      
      if (data.riskProfile) {
        setRiskProfile(data.riskProfile);
      }
    }
  }, [userEmail]);

  // Persist State Changes
  useEffect(() => {
    if (userEmail) {
        storageService.saveChats(userEmail, ViewState.CHAT, chatMessages);
    }
  }, [chatMessages, userEmail]);

  useEffect(() => {
    if (userEmail) {
        storageService.saveChats(userEmail, ViewState.MEDICINE, medicineMessages);
    }
  }, [medicineMessages, userEmail]);

  useEffect(() => {
    if (userEmail) {
        storageService.saveChats(userEmail, ViewState.REMEDY, remedyMessages);
    }
  }, [remedyMessages, userEmail]);

  useEffect(() => {
    if (userEmail) {
        storageService.saveRiskProfile(userEmail, riskProfile);
    }
  }, [riskProfile, userEmail]);


  const handleLogout = () => {
      setUserEmail(null);
      storageService.setCurrentUser(null);
      // Clear local state
      setChatMessages([]);
      setMedicineMessages([]);
      setRemedyMessages([]);
      setCurrentView(ViewState.DASHBOARD);
  };

  // When general chat messages update, trigger a risk analysis in the background
  useEffect(() => {
    // Only analyze if there's a new message from the model in the main chat
    if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'model') {
       // Debounce or check interval could be added here to avoid too many API calls
       // For now, we analyze when conversation depth increases
       if (chatMessages.length % 4 === 0) { // Analyze every 4 messages
          const runAnalysis = async () => {
            try {
              const newProfile = await analyzeHealthRisks(chatMessages);
              setRiskProfile(newProfile);
            } catch (e) {
              console.error("Failed to update risk profile", e);
            }
          };
          runAnalysis();
       }
    }
  }, [chatMessages]);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard riskProfile={riskProfile} />;
      case ViewState.CHAT:
        return (
          <ChatInterface 
            messages={chatMessages} 
            onSendMessage={(msg) => setChatMessages(prev => [...prev, msg])}
            isTyping={isTyping}
            setTyping={setTyping}
            mode={ViewState.CHAT}
          />
        );
      case ViewState.MEDICINE:
        return (
          <ChatInterface 
            messages={medicineMessages} 
            onSendMessage={(msg) => setMedicineMessages(prev => [...prev, msg])}
            isTyping={isTyping}
            setTyping={setTyping}
            mode={ViewState.MEDICINE}
          />
        );
      case ViewState.REMEDY:
        return (
          <ChatInterface 
            messages={remedyMessages} 
            onSendMessage={(msg) => setRemedyMessages(prev => [...prev, msg])}
            isTyping={isTyping}
            setTyping={setTyping}
            mode={ViewState.REMEDY}
          />
        );
      case ViewState.REMINDERS:
        return <Reminders userEmail={userEmail!} />;
      case ViewState.DOCUMENTS:
        return <Documents messages={chatMessages} onChangeView={setCurrentView} />;
      default:
        return <Dashboard riskProfile={riskProfile} />;
    }
  };

  // APP ENTRY RULE: If not authenticated, show AuthScreen
  if (!userEmail) {
      return <AuthScreen onAuthenticated={setUserEmail} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
      />
      <main className="flex-1 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;