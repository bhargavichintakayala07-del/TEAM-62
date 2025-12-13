import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Message, MessageRole, Attachment, HealthMetric } from '../types';
import { sendMessageToGemini, extractHealthMetrics } from '../services/geminiService';
import { LoadingDots } from './ui/LoadingDots';
import { Chat as GeminiChat } from "@google/genai";

interface ChatAreaProps {
  chatSession: GeminiChat | null;
  onNewMetricsFound: (metrics: HealthMetric[]) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chatSession, onNewMetricsFound }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: MessageRole.MODEL,
      text: "Hello! I'm Medico, your AI healthcare companion. I can help explain medical reports, check symptoms, or track your health metrics. How can I help you today?",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: base64String,
            name: file.name
          }]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isProcessing || !chatSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: inputText,
      attachments: [...attachments],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      // 1. Send to Chat for response
      const responseText = await sendMessageToGemini(chatSession, userMessage.text, userMessage.attachments);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMessage]);

      // 2. Parallel agentic task: Check for metrics in the background if attachments exist or text looks like data
      // We do this silently to update the dashboard
      if (userMessage.attachments?.length || userMessage.text.toLowerCase().includes('cholesterol') || userMessage.text.toLowerCase().includes('glucose')) {
         const foundMetrics = await extractHealthMetrics(userMessage.text, userMessage.attachments?.[0]);
         if (foundMetrics.length > 0) {
            onNewMetricsFound(foundMetrics);
            // Optional: Notify user
            /* 
            const notifyMsg: Message = {
               id: (Date.now() + 2).toString(),
               role: MessageRole.SYSTEM,
               text: `I've extracted ${foundMetrics.length} health metric(s) from your input and updated your dashboard.`,
               timestamp: Date.now()
            };
            setMessages(prev => [...prev, notifyMsg]);
            */
         }
      }

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Disclaimer Banner */}
      <div className="bg-orange-50 border-b border-orange-100 p-2 flex items-center justify-center text-xs text-orange-700">
        <AlertTriangle size={14} className="mr-2" />
        <span>Medico Assistant provides information, not medical diagnosis. Always consult a doctor.</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === MessageRole.USER
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : msg.role === MessageRole.SYSTEM
                  ? 'bg-gray-200 text-gray-800 text-sm'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {msg.attachments.map((att, i) => (
                     <div key={i} className="relative group">
                       <img 
                         src={`data:${att.mimeType};base64,${att.data}`} 
                         alt="attachment" 
                         className="h-32 w-auto object-cover rounded-lg border border-white/20"
                       />
                     </div>
                  ))}
                </div>
              )}
              <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap leading-relaxed">
                  {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
                <LoadingDots />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative bg-slate-100 rounded-lg p-2 flex items-center pr-8">
                <ImageIcon size={16} className="text-slate-500 mr-2" />
                <span className="text-xs text-slate-600 truncate max-w-[100px]">{att.name || 'Image'}</span>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
           <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Upload medical report"
          >
            <Paperclip size={20} />
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your symptoms or ask about a report..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 py-2"
            rows={1}
            style={{ minHeight: '40px' }}
          />

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && attachments.length === 0) || isProcessing}
            className={`p-2 rounded-lg mb-0.5 transition-all ${
              (!inputText.trim() && attachments.length === 0) || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
            AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};