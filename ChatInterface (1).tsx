import React, { useState, useRef, useEffect } from 'react';
import { Message, ViewState } from '../types';
import { Send, Image as ImageIcon, Loader2, Bot, User, X, Pill, Coffee, Activity } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  mode: ViewState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, setTyping, mode }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    let userText = input;
    // Inject specific intent context if needed, but the System Instruction handles "When asked..." well.
    // We can rely on user input naturally.

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
      attachment: selectedImage || undefined
    };

    onSendMessage(userMsg);
    setInput('');
    const currentImage = selectedImage; // Capture current image for the API call
    setSelectedImage(null);
    setTyping(true);

    try {
      const imageBase64 = currentImage ? currentImage.split(',')[1] : undefined;
      const responseText = await sendMessageToGemini(messages, userMsg.text, imageBase64);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      onSendMessage(botMsg);
    } catch (error) {
      console.error(error);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Custom UI Config based on Mode
  const getUIConfig = () => {
    switch (mode) {
      case ViewState.MEDICINE:
        return {
          title: "Medicine Finder",
          subtitle: "Safety & Usage Info",
          icon: Pill,
          placeholder: "Enter medicine name (e.g., Paracetamol)...",
          welcomeTitle: "Medicine Information",
          welcomeText: "Enter any medicine name to get details on usage, side effects, and precautions."
        };
      case ViewState.REMEDY:
        return {
          title: "Remedy Suggester",
          subtitle: "Safe Home Remedies",
          icon: Coffee,
          placeholder: "Describe your problem (e.g., Sore throat)...",
          welcomeTitle: "Natural Home Remedies",
          welcomeText: "Feeling unwell? Tell me your symptoms for safe, natural home remedy suggestions."
        };
      default: // CHAT
        return {
          title: "Medico Companion",
          subtitle: "Agentic AI • Powered by Gemini 2.5",
          icon: Activity,
          placeholder: "Type symptoms, ask questions, or upload reports...",
          welcomeTitle: "Hello! I'm Medico.",
          welcomeText: "Upload a lab report, ask about symptoms, or discuss your treatment plan. I'm here to guide you."
        };
    }
  };

  const config = getUIConfig();
  const HeaderIcon = config.icon;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <HeaderIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{config.title}</h2>
            <p className="text-xs text-slate-500">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <Bot size={64} className="mb-4 text-emerald-300" />
            <p className="text-center text-lg font-medium">{config.welcomeTitle}</p>
            <p className="text-center text-sm max-w-md mt-2">
              {config.welcomeText}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-500 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.attachment && (
                    <div className="mb-3">
                       <img src={msg.attachment} alt="Upload" className="max-w-full h-auto rounded-lg border border-white/20" style={{ maxHeight: '200px' }} />
                    </div>
                  )}
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-emerald-500" />
                <span className="text-sm text-slate-500">Processing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {selectedImage && (
          <div className="mb-3 flex items-start">
            <div className="relative inline-block">
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm" />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          {mode === ViewState.CHAT && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Upload Medical Report"
            >
              <ImageIcon size={24} />
            </button>
          )}
          
          <div className="flex-1 bg-slate-100 rounded-xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white border border-transparent focus-within:border-emerald-200 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder}
              className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-slate-700 placeholder:text-slate-400 max-h-32 py-2"
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              (!input.trim() && !selectedImage) || isTyping
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
            }`}
          >
            {isTyping ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Medico Assistant is an AI tool. Information provided is for guidance only, not a medical diagnosis.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;