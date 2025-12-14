import React, { useState, useEffect } from 'react';
import { Watch, Smartphone, Check, RefreshCw, Plus, X, Activity, Heart, Moon } from 'lucide-react';
import { HealthStats } from '../types';

export const DeviceIntegration: React.FC = () => {
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [stats, setStats] = useState<HealthStats | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem('medico_health_data');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setConnectedDevice(parsed.source);
      setLastSynced(parsed.lastSynced);
      setStats(parsed);
    }
  }, []);

  const handleConnect = (device: string) => {
    setLoading(device);
    // Simulate API connection delay
    setTimeout(() => {
      setConnectedDevice(device);
      setLoading(null);
      handleSync(device);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
    setStats(null);
    setLastSynced(null);
    localStorage.removeItem('medico_health_data');
  };

  const handleSync = (device: string) => {
    setLoading('sync');
    // Simulate fetching data from API
    setTimeout(() => {
      const now = Date.now();
      
      // Generate mock history for the chart
      const mockHistory = Array.from({ length: 7 }, (_, i) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayIndex = (new Date().getDay() + i + 1) % 7;
        return {
          name: days[dayIndex],
          bp: 115 + Math.floor(Math.random() * 15),
          heartRate: 68 + Math.floor(Math.random() * 12)
        };
      });

      const newStats: HealthStats = {
        heartRate: 72 + Math.floor(Math.random() * 10),
        steps: 6500 + Math.floor(Math.random() * 5000),
        sleepHours: 6 + Math.random() * 3,
        bloodPressure: '120/80',
        spo2: 96 + Math.floor(Math.random() * 4),
        temperature: 98.4 + Math.random(),
        lastSynced: now,
        source: device,
        history: mockHistory
      };

      setStats(newStats);
      setLastSynced(now);
      localStorage.setItem('medico_health_data', JSON.stringify(newStats));
      setLoading(null);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Wearable Devices</h2>
            <p className="text-slate-500 mt-1">Connect your health apps to sync vitals and activity data automatically.</p>
          </div>
          {connectedDevice && (
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <span className="text-sm text-slate-500">
                Last synced: {lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'Never'}
              </span>
              <button 
                onClick={() => handleSync(connectedDevice)}
                disabled={loading === 'sync'}
                className="p-2 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading === 'sync' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apple Health Card */}
          <div className={`p-6 rounded-xl border-2 transition-all ${connectedDevice === 'Apple Health' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-800">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg text-slate-800">Apple Health</h3>
                  <p className="text-sm text-slate-500">iOS Devices</p>
                </div>
              </div>
              {connectedDevice === 'Apple Health' ? (
                <button onClick={handleDisconnect} className="text-red-500 hover:text-red-600 p-2">
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => handleConnect('Apple Health')}
                  disabled={loading !== null || connectedDevice !== null}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'Apple Health' ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
            {connectedDevice === 'Apple Health' && (
              <div className="mt-4 flex items-center text-teal-700 text-sm font-medium">
                <Check className="w-4 h-4 mr-2" /> Connected & Syncing
              </div>
            )}
          </div>

          {/* Google Fit Card */}
          <div className={`p-6 rounded-xl border-2 transition-all ${connectedDevice === 'Google Fit' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-800">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg text-slate-800">Google Fit</h3>
                  <p className="text-sm text-slate-500">Android & WearOS</p>
                </div>
              </div>
              {connectedDevice === 'Google Fit' ? (
                <button onClick={handleDisconnect} className="text-red-500 hover:text-red-600 p-2">
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => handleConnect('Google Fit')}
                  disabled={loading !== null || connectedDevice !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'Google Fit' ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
            {connectedDevice === 'Google Fit' && (
              <div className="mt-4 flex items-center text-teal-700 text-sm font-medium">
                <Check className="w-4 h-4 mr-2" /> Connected & Syncing
              </div>
            )}
          </div>
        </div>

        {/* Mock Synced Data Display */}
        {stats && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Synced Data Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">Heart Rate</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.heartRate} <span className="text-xs font-normal">bpm</span></p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">Steps</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.steps.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">Sleep</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.sleepHours.toFixed(1)} <span className="text-xs font-normal">hrs</span></p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">SpO2</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.spo2}%</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start">
               <Activity className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
               <p>This data is now available to the Medico AI Agent. The risk analysis and chat consultation will use this live data for better accuracy.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};