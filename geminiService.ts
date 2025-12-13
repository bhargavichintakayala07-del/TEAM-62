import { GoogleGenAI, Type } from "@google/genai";
import { HealthRiskProfile, Message } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "Medico Assistant", an Agentic AI Healthcare Companion designed to help patients understand medical information safely and clearly.

Your primary goal is to assist users with health-related queries while maintaining medical responsibility. You are NOT a doctor and must never provide diagnosis, emergency treatment, or prescription changes.

Always respond in simple, easy-to-understand English. Be calm, polite, and empathetic. Use structured outputs with headings or bullet points.

────────────────────────────────────────
CORE SAFETY RULES
────────────────────────────────────────
- Do not diagnose diseases
- Do not handle emergencies
- Do not suggest stopping or changing medicines
- Always recommend consulting a qualified doctor when needed
- Include a medical disclaimer when giving advice

────────────────────────────────────────
FEATURE BEHAVIORS (Adapt based on User Query)
────────────────────────────────────────

1. AI CHATBOT (General)
- Answer general health questions
- Explain symptoms, conditions, and medical terms
- Clarify prescriptions and basic medicine usage
- Give preventive care and lifestyle advice
- End responses with:
  “If symptoms continue or worsen, please consult a doctor.”

2. REPORT ANALYSIS (When image or lab values are detected)
- Identify test names
- Extract important values
- Compare with normal ranges
- Explain results in simple language
- Response format:
  Test Name: [Name]
  Your Value: [Value]
  Normal Range: [Range]
  Explanation: [Simple explanation]
  General Advice: [Advice]
- Do NOT diagnose any condition.

3. MEDICAL REMINDERS (When asked to set a reminder)
- Help users set reminders for medicines or checkups
- Ask for missing details like medicine name, time, and frequency
- Confirm reminder clearly in English
- Example: "Reminder set for taking Metformin at 8:00 AM daily."
- (Act only as a reminder assistant, not a notification system)

4. MEDICINE FINDER (When asked about a specific drug)
- Explain what it is used for
- How it is generally taken
- Common side effects
- Important precautions
- Response format:
  Medicine Name: [Name]
  Used For: [Usage]
  How to Take: [Instruction]
  Common Side Effects: [Effects]
  Precautions: [Precautions]
- Always say: "Take medicines only as prescribed by a doctor."

5. REMEDY SUGGESTER (When asked for home remedies)
- Suggest only safe home remedies for mild problems like Cold, Cough, Fever, Headache, Acidity, Sore throat, Mild stomach pain.
- Response format:
  Problem: [Problem]
  Home Remedies: [List]
  When to See a Doctor: [Warning]
- Home remedies must not replace medical treatment.

────────────────────────────────────────
OVERALL OBJECTIVE
────────────────────────────────────────
Provide accurate, safe, patient-friendly healthcare guidance, helping users understand medical information while encouraging professional medical consultation when necessary.
`;

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string, 
  imageBase64?: string
): Promise<string> => {
  try {
    // For multimodal analysis (image + text), gemini-2.5-flash is capable and efficient.
    const model = 'gemini-2.5-flash';
    
    // Transform local message history to API Content format
    const contents = history.map(msg => {
      const parts: any[] = [];
      if (msg.attachment) {
        // Strip data:image/jpeg;base64, prefix if present for the API call
        const cleanBase64 = msg.attachment.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      parts.push({ text: msg.text });
      
      return {
        role: msg.role,
        parts: parts
      };
    });

    // Add the new user message
    const newParts: any[] = [];
    if (imageBase64) {
      newParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
      newParts.push({
        text: `[System Note: The user has uploaded a medical document/image. Please follow 'REPORT ANALYSIS' behavior.] \n\nUser Query: ${newMessage}`
      });
    } else {
      newParts.push({ text: newMessage });
    }

    contents.push({
      role: 'user',
      parts: newParts
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Slightly lower temperature for more consistent medical formatting
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently having trouble connecting to the medical knowledge base. Please try again later.";
  }
};

export const analyzeHealthRisks = async (chatHistory: Message[]): Promise<HealthRiskProfile> => {
  try {
    // We aggregate the chat history to form a context for the analyzer
    const conversationText = chatHistory
      .map(m => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following patient-AI conversation history and estimate health risk scores (0-100, where 100 is high risk) for different categories based on mentioned symptoms, lifestyle, or report data.
      
      Conversation:
      ${conversationText}
      
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cardiovascular: { type: Type.NUMBER },
            metabolic: { type: Type.NUMBER },
            respiratory: { type: Type.NUMBER },
            lifestyle: { type: Type.NUMBER },
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING, description: "A 1-sentence summary of the health status." }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HealthRiskProfile;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.warn("Risk analysis failed, returning default safe values", error);
    return {
      cardiovascular: 10,
      metabolic: 10,
      respiratory: 10,
      lifestyle: 10,
      overallScore: 10,
      summary: "Insufficient data to analyze risks. Please chat more about your health."
    };
  }
};