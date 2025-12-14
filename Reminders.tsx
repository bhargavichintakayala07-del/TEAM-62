import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Plus, Bell, Trash2, Clock, Calendar } from 'lucide-react';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
      const saved = localStorage.getItem('medico_reminders');
      return saved ? JSON.parse(saved) : [
          { id: '1', title: 'Metformin 500mg', time: '09:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], active: true },
          { id: '2', title: 'Vitamin D', time: '20:00', days: ['Mon', 'Thu'], active: true },
      ];
  });
  
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
      title: '',
      time: '',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('medico_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!newReminder.title || !newReminder.time) return;
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      days: newReminder.days || [],
      active: true
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder({ title: '', time: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
    setIsAdding(false);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleActive = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">Medication Reminders</h2>
                 <p className="text-slate-500">Track your daily intake and schedules.</p>
            </div>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
            >
                <Plus className="w-5 h-5 mr-2" />
                Add New
            </button>
        </div>

        {isAdding && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-slate-700">New Reminder</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Medication Name</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="e.g. Aspirin"
                            value={newReminder.title}
                            onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
                        <input 
                            type="time" 
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={newReminder.time}
                            onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                    <button onClick={addReminder} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save Reminder</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 gap-4">
            {reminders.map((reminder) => (
                <div key={reminder.id} className={`bg-white p-4 rounded-xl shadow-sm border ${reminder.active ? 'border-l-4 border-l-teal-500 border-slate-100' : 'border-slate-100 border-l-4 border-l-slate-300 opacity-70'} flex flex-col sm:flex-row sm:items-center justify-between transition-all`}>
                    <div className="flex items-start sm:items-center mb-4 sm:mb-0">
                        <div className={`p-3 rounded-full mr-4 ${reminder.active ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${reminder.active ? 'text-slate-800' : 'text-slate-500'}`}>{reminder.title}</h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {reminder.time}</span>
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {reminder.days.length === 7 ? 'Everyday' : reminder.days.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 justify-end">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={reminder.active} onChange={() => toggleActive(reminder.id)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                        <button onClick={() => deleteReminder(reminder.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
            
            {reminders.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700">No reminders yet</h3>
                    <p className="text-slate-500 mt-2">Add a medication reminder to stay on track.</p>
                </div>
            )}
        </div>
    </div>
  );
};