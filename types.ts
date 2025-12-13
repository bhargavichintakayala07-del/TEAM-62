export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: string; // Base64 string for images
  isRiskAnalysis?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  type: 'medication' | 'appointment' | 'checkup';
  active: boolean;
}

export interface HealthRiskProfile {
  cardiovascular: number;
  metabolic: number;
  respiratory: number;
  lifestyle: number;
  overallScore: number;
  summary: string;
}

export interface UserProfile {
  name: string;
  age: number;
  conditions: string[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  MEDICINE = 'MEDICINE',
  REMEDY = 'REMEDY',
  REMINDERS = 'REMINDERS',
  DOCUMENTS = 'DOCUMENTS'
}