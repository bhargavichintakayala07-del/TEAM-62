import React, { useEffect, useState } from 'react';
import { ViewState, HealthStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Heart, Thermometer, Droplets, AlertCircle, ArrowRight, Watch } from 'lucide-react';

interface DashboardProps {
    setView: (view: ViewState) => void;
}

const defaultMockData = [
  { name: 'Mon', bp: 120, heartRate: 72 },
  { name: 'Tue', bp: 118, heartRate: 75 },
  { name: 'Wed', bp: 122, heartRate: 71 },
  { name: 'Thu', bp: 125, heartRate: 78 },
  { name: 'Fri', bp: 119, heartRate: 74 },
  { name: 'Sat', bp: 121, heartRate: 73 },
  { name: 'Sun', bp: 120, heartRate: 72 },
];

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [healthData, setHealthData] = useState<HealthStats | null>(null);
  const [chartData, setChartData] = useState(defaultMockData);

  useEffect(() => {
      const savedStats = localStorage.getItem('medico_health_data');
      if (savedStats) {
          const parsed: HealthStats = JSON.parse(savedStats);
          setHealthData(parsed);
          if (parsed.history && parsed.history.length > 0) {
              setChartData(parsed.history);
          }
      }
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Medico Assistant is an AI tool for informational purposes only. Always consult a professional doctor for medical diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {healthData && (
          <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center">
                  <Watch className="w-5 h-5 text-teal-600 mr-3" />
                  <span className="text-teal-800 font-medium">Syncing with {healthData.source}</span>
              </div>
              <span className="text-xs text-teal-600 bg-white px-3 py-1 rounded-full border border-teal-100">
                  Last updated: {new Date(healthData.lastSynced).toLocaleTimeString()}
              </span>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">Today</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            {healthData ? healthData.heartRate : 72} <span className="text-sm font-normal text-slate-500">bpm</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">Heart Rate (Resting)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">Avg</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
             {healthData ? healthData.bloodPressure : '120/80'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">Blood Pressure</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Thermometer className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">Current</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
             {healthData ? healthData.temperature.toFixed(1) : 98.6} <span className="text-sm font-normal text-slate-500">°F</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">Body Temperature</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Droplets className="w-6 h-6 text-cyan-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">Latest</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
             {healthData ? healthData.spo2 : 98} <span className="text-sm font-normal text-slate-500">%</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">SpO2 Levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Vitals History</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        />
                        <Area type="monotone" dataKey="bp" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorBp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <p className="text-slate-500 mb-6">Select an action to get started with your health assistant.</p>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => setView(ViewState.CHAT)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-teal-50 rounded-xl transition-all group"
                    >
                        <div className="flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Activity className="w-5 h-5 text-teal-600" />
                            </div>
                            <span className="ml-3 font-medium text-slate-700 group-hover:text-teal-700">Check Symptoms</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500" />
                    </button>

                    <button 
                         onClick={() => setView(ViewState.REPORTS)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-teal-50 rounded-xl transition-all group"
                    >
                        <div className="flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="ml-3 font-medium text-slate-700 group-hover:text-blue-700">Analyze Report</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    </button>
                    
                     <button 
                        onClick={() => setView(ViewState.DEVICES)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-teal-50 rounded-xl transition-all group"
                    >
                        <div className="flex items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Watch className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="ml-3 font-medium text-slate-700 group-hover:text-purple-700">Connect Device</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500" />
                    </button>
                </div>
            </div>
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm font-medium text-indigo-900">Next Reminder</p>
                <p className="text-indigo-700 text-xs mt-1">Metformin 500mg • 2:00 PM</p>
            </div>
        </div>
      </div>
    </div>
  );
};