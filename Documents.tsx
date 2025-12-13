import React from 'react';
import { Message } from '../types';
import { FileText, Calendar, Eye, Download } from 'lucide-react';

interface DocumentsProps {
  messages: Message[];
  onChangeView: (view: any) => void;
}

const Documents: React.FC<DocumentsProps> = ({ messages, onChangeView }) => {
  // Filter messages that have attachments
  const documents = messages.filter(m => m.attachment && m.role === 'user');

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Medical Reports</h1>
          <p className="text-slate-500">Access your history of uploaded lab reports and prescriptions.</p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-emerald-500 opacity-60" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 max-w-md mb-8">
            Upload a photo of your lab report or prescription in the chat to get started. Medico will analyze it for you.
          </p>
          <button 
            onClick={() => onChangeView('CHAT')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Go to Chat & Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                 <img 
                   src={doc.attachment} 
                   alt={`Report ${index + 1}`} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
                        <Eye size={16} /> View
                    </button>
                 </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                        Lab Report
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {doc.timestamp.toLocaleDateString()}
                    </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Medical Document #{index + 1}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                    {doc.text.substring(0, 100) || "Uploaded via Chat Interface"}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Processed by Gemini</span>
                    <button className="text-emerald-600 hover:text-emerald-700">
                        <Download size={20} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;