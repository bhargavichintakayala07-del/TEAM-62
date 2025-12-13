import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HealthMetric } from '../types';
import { Activity, Heart, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  metrics: HealthMetric[];
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  // Group metrics by type for display
  const groupedMetrics = metrics.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, HealthMetric[]>);

  // Sort metrics by date
  Object.keys(groupedMetrics).forEach(key => {
    groupedMetrics[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  const hasData = metrics.length > 0;

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Health Overview</h1>
        <p className="text-slate-500">Track your vital metrics extracted from your reports.</p>
      </header>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="text-teal-500" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No Data Available</h3>
          <p className="text-slate-500 max-w-md mt-2">
            Upload a medical report or mention your health stats in the chat to see your health dashboard populate automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                <div className="p-3 bg-red-50 rounded-xl mr-4">
                    <Heart className="text-red-500" size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Metrics Tracked</p>
                    <p className="text-2xl font-bold text-slate-800">{metrics.length}</p>
                </div>
            </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                <div className="p-3 bg-blue-50 rounded-xl mr-4">
                    <Activity className="text-blue-500" size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Latest Update</p>
                    <p className="text-lg font-bold text-slate-800">
                        {metrics.length > 0 ? metrics[metrics.length - 1].date : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                <div className="p-3 bg-amber-50 rounded-xl mr-4">
                    <TrendingUp className="text-amber-500" size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Categories</p>
                    <p className="text-2xl font-bold text-slate-800">{Object.keys(groupedMetrics).length}</p>
                </div>
            </div>
          </div>

          {/* Charts */}
          {Object.entries(groupedMetrics).map(([type, data]) => (
            <div key={type} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">{type}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                   {data[0]?.unit}
                </span>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}}
                        tickMargin={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{fill: '#94a3b8', fontSize: 12}}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0d9488" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#color${type})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};