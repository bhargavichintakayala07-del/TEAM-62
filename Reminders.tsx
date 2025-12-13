import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Plus, Trash2, Clock, Calendar, CheckCircle, Circle, Pill } from 'lucide-react';
import { storageService } from '../services/storageService';

interface RemindersProps {
  userEmail: string;
}

const Reminders: React.FC<RemindersProps> = ({ userEmail }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<Reminder['type']>('medication');

  // Load from storage service on mount or user change
  useEffect(() => {
    if (userEmail) {
      const saved = storageService.getReminders(userEmail);
      if (saved.length > 0) {
        setReminders(saved);
      } else {
        // Default sample data only if completely empty (first time)
        // Check if we want to give default data or just empty. 
        // For a new user, getting empty is probably better, but let's keep one sample if desired.
        // Actually, let's start fresh for new users to be clean.
        setReminders([]); 
      }
    }
  }, [userEmail]);

  // Save to storage service whenever reminders change
  useEffect(() => {
    if (userEmail) {
      storageService.saveReminders(userEmail, reminders);
    }
  }, [reminders, userEmail]);

  const addReminder = () => {
    if (!newTitle || !newTime) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      type: newType,
      active: true
    };
    setReminders([...reminders, reminder]);
    setNewTitle('');
    setNewTime('');
    setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Health Reminders</h1>
          <p className="text-slate-500">Never miss a medication or appointment.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-lg mb-8 animate-fade-in-down">
          <h3 className="font-semibold text-slate-800 mb-4">Create Reminder</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Reminder Title (e.g., Aspirin)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Reminder['type'])}
              className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="medication">Medication</option>
              <option value="appointment">Appointment</option>
              <option value="checkup">Routine Checkup</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={addReminder} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Reminder</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reminders.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No reminders set yet. Add one above.</p>
          </div>
        )}
        
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`bg-white p-5 rounded-xl border ${reminder.active ? 'border-slate-200' : 'border-slate-100 bg-slate-50 opacity-75'} shadow-sm flex items-center justify-between group transition-all`}>
            <div className="flex items-center gap-4">
              <button onClick={() => toggleActive(reminder.id)} className={`text-2xl ${reminder.active ? 'text-emerald-500' : 'text-slate-300'}`}>
                 {reminder.active ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              
              <div className={`p-3 rounded-lg ${
                reminder.type === 'medication' ? 'bg-blue-50 text-blue-500' : 
                reminder.type === 'appointment' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'
              }`}>
                {reminder.type === 'medication' ? <Pill size={20} /> : <Calendar size={20} />}
              </div>

              <div>
                <h4 className={`font-semibold ${reminder.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{reminder.title}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} />
                  <span>{reminder.time}</span>
                  <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-xs">{reminder.type}</span>
                </div>
              </div>
            </div>

            <button onClick={() => deleteReminder(reminder.id)} className="text-slate-300 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reminders;