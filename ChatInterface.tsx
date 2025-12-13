import React, { useState, useRef, useEffect } from 'react';
import { Message, HealthStats } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Send, User, Bot, Upload, X, Loader2, Watch } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm Medico Assistant. I can help explain medical reports, check symptoms, or track your health history. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [healthContext, setHealthContext] = useState<HealthStats | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load health context on mount
  useEffect(() => {
      const savedStats = localStorage.getItem('medico_health_data');
      if (savedStats) {
          setHealthContext(JSON.parse(savedStats));
      }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Convert history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // If there's an image, strip the prefix for the API
      let imageBase64 = undefined;
      if (selectedImage) {
        imageBase64 = selectedImage.split(',')[1];
      }

      const responseText = await sendMessageToGemini(history, userMsg.text || (selectedImage ? "Analyze this image" : ""), imageBase64, healthContext);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, something went wrong. Please check your connection and try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Context Indicator */}
      {healthContext && (
          <div className="bg-teal-50 px-4 py-2 border-b border-teal-100 flex items-center justify-between text-xs text-teal-700">
              <div className="flex items-center">
                  <Watch className="w-3 h-3 mr-1" />
                  <span>Syncing with {healthContext.source}</span>
              </div>
              <span>HR: {healthContext.heartRate} bpm • Steps: {healthContext.steps}</span>
          </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-100 ml-3' : 'bg-teal-100 mr-3'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-teal-600" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                 {msg.role === 'model' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                 ) : (
                    msg.text
                 )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="flex max-w-[70%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-100 mr-3 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-teal-600" />
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {selectedImage && (
            <div className="mb-3 flex items-center bg-slate-100 w-fit p-2 rounded-lg">
                <span className="text-xs text-slate-600 mr-2">Image attached</span>
                <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageSelect}
          />
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms or ask a question..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700 placeholder-slate-400"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || (!input && !selectedImage)}
            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};