export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isThinking?: boolean;
}

export interface HealthMetric {
  date: string;
  value: number;
  unit: string;
  type: string; // e.g., 'Cholesterol', 'Glucose', 'Blood Pressure'
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  history: string[]; // Summary of past interactions/conditions
  metrics: HealthMetric[];
}

export enum AppView {
  CHAT = 'chat',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings'
}