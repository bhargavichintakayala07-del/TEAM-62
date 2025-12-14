export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  type?: 'text' | 'analysis' | 'alert';
  analysisData?: HealthRiskAnalysis;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  days: string[]; // ['Mon', 'Tue', ...]
  active: boolean;
}

export interface HealthRiskAnalysis {
  riskScore: number; // 0-100
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  vitalSigns?: {
    name: string;
    value: string;
    status: 'Normal' | 'Warning' | 'Critical';
  }[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  REMINDERS = 'REMINDERS',
  REPORTS = 'REPORTS',
  DEVICES = 'DEVICES'
}

export interface UserProfile {
  name: string;
  age: number;
  conditions: string[];
}

export interface HealthStats {
  heartRate: number;
  steps: number;
  sleepHours: number;
  bloodPressure: string;
  spo2: number;
  temperature: number;
  lastSynced: number;
  source: string;
  history: { name: string; bp: number; heartRate: number }[];
}
