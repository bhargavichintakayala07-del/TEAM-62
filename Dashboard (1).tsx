import React from 'react';
import { HealthRiskProfile } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Heart, Activity, Wind, Flame, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  riskProfile: HealthRiskProfile;
}

const MetricCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string; 
  subtext: string 
}> = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <span className={`text-2xl font-bold ${value > 50 ? 'text-amber-500' : 'text-slate-700'}`}>
        {value}
        <span className="text-sm text-slate-400 font-normal">/100</span>
      </span>
    </div>
    <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
    <p className="text-slate-400 text-xs mt-1">{subtext}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ riskProfile }) => {
  const radarData = [
    { subject: 'Cardio', A: riskProfile.cardiovascular, fullMark: 100 },
    { subject: 'Metabolic', A: riskProfile.metabolic, fullMark: 100 },
    { subject: 'Respiratory', A: riskProfile.respiratory, fullMark: 100 },
    { subject: 'Lifestyle', A: riskProfile.lifestyle, fullMark: 100 },
    { subject: 'Immunity', A: 100 - riskProfile.overallScore, fullMark: 100 }, // Inverse for visual balance
  ];

  // Simulated trend data
  const trendData = [
    { name: 'Mon', score: 20 },
    { name: 'Tue', score: 22 },
    { name: 'Wed', score: 18 },
    { name: 'Thu', score: 25 },
    { name: 'Fri', score: riskProfile.overallScore },
  ];

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Hello, Patient</h1>
        <p className="text-slate-500">Here is your daily health overview based on your recent check-ups.</p>
        
        {riskProfile.overallScore > 50 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">Action Required: Your health risk analysis suggests attention is needed for Metabolic factors.</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Cardiovascular Risk" 
          value={riskProfile.cardiovascular} 
          icon={Heart} 
          color="bg-rose-500" 
          subtext="Based on BP & HR trends"
        />
        <MetricCard 
          title="Metabolic Score" 
          value={riskProfile.metabolic} 
          icon={Flame} 
          color="bg-orange-500" 
          subtext="Sugar & BMI correlation"
        />
        <MetricCard 
          title="Respiratory Health" 
          value={riskProfile.respiratory} 
          icon={Wind} 
          color="bg-cyan-500" 
          subtext="Breathing patterns"
        />
        <MetricCard 
          title="Overall Risk Score" 
          value={riskProfile.overallScore} 
          icon={Activity} 
          color="bg-emerald-500" 
          subtext={riskProfile.summary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Risk Factor Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false}/>
                <Radar
                  name="Risk"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Health Score Trend (7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;