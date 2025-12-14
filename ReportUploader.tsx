import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Activity, ChevronRight, X } from 'lucide-react';
import { analyzeMedicalReport } from '../services/geminiService';
import { HealthRiskAnalysis } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const ReportUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthRiskAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null); // Reset previous result
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    try {
      const base64 = imagePreview.split(',')[1];
      const data = await analyzeMedicalReport(base64);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze report. Please ensure the image is clear.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Mock data for radar chart based on risk score
  const getRiskChartData = (score: number) => [
    { subject: 'Overall Risk', A: score, fullMark: 100 },
    { subject: 'Vitals', A: score > 50 ? score - 10 : score + 10, fullMark: 100 },
    { subject: 'Urgency', A: score, fullMark: 100 },
    { subject: 'Complexity', A: Math.min(score + 20, 100), fullMark: 100 },
    { subject: 'Health Impact', A: score, fullMark: 100 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Medical Report Analysis</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">
            Upload a photo of your lab report, prescription, or medical summary. Our AI agent will extract key values, explain the medical jargon, and assess risk factors.
          </p>
        </div>

        {!result && (
          <div className="max-w-xl mx-auto">
            <div 
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                imagePreview ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
              }`}
            >
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-48 rounded-lg shadow-md object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setImagePreview(null); }}
                    className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-400 mt-2">Supports JPG, PNG (Max 5MB)</p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!imagePreview || analyzing}
                className={`w-full max-w-xs py-3 px-6 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center ${
                  !imagePreview || analyzing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md'
                }`}
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Report <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Summary */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Executive Summary</h3>
                    <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Activity className="w-5 h-5 text-teal-600 mr-2" />
                        Extracted Vitals & Values
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.vitalSigns?.map((vital, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{vital.name}</p>
                                    <p className="text-lg font-bold text-slate-800">{vital.value}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    vital.status === 'Normal' ? 'bg-green-100 text-green-700' :
                                    vital.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {vital.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Key Findings</h3>
                    <ul className="space-y-2">
                        {result.keyFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{finding}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4">Recommendations</h3>
                    <ul className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                                <ArrowRight className="w-4 h-4 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-indigo-800">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                 <div className="flex justify-end pt-4">
                    <button 
                        onClick={() => {setResult(null); setImagePreview(null); setFile(null);}}
                        className="text-slate-500 hover:text-slate-800 text-sm font-medium"
                    >
                        Analyze another report
                    </button>
                </div>
            </div>

            {/* Right Col: Risk Score */}
            <div className="lg:col-span-1 space-y-6">
                <div className={`p-6 rounded-2xl border-2 ${
                    result.riskScore < 40 ? 'bg-green-50 border-green-200' :
                    result.riskScore < 70 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                }`}>
                    <h3 className="text-center text-lg font-semibold text-slate-700 mb-2">Overall Health Risk Score</h3>
                    <div className="flex justify-center items-end">
                        <span className={`text-6xl font-bold ${
                            result.riskScore < 40 ? 'text-green-600' :
                            result.riskScore < 70 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>{result.riskScore}</span>
                        <span className="text-xl text-slate-500 mb-2">/100</span>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-2">
                        {result.riskScore < 40 ? 'Low Risk' :
                        result.riskScore < 70 ? 'Moderate Risk - Monitor Closely' :
                        'High Risk - Consult Doctor Immediately'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRiskChartData(result.riskScore)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Risk"
                            dataKey="A"
                            stroke="#0d9488"
                            fill="#0d9488"
                            fillOpacity={0.4}
                        />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}