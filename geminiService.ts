import { GoogleGenAI, Type } from "@google/genai";
import { HealthRiskAnalysis, HealthStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Medico Assistant, an expert AI healthcare companion. 
Your goal is to explain medical concepts, analyze reports, and check symptoms with empathy and accuracy.
ALWAYS start by clarifying you are an AI and not a doctor.
If the user uploads a medical report, extract key findings, explain them in simple terms, and flag any abnormal values.
If the user describes symptoms, perform a preliminary risk assessment and suggest whether they should see a doctor immediately.
Keep responses concise but informative. Use Markdown for formatting.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string, 
  imageBase64?: string,
  healthContext?: HealthStats
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Construct content parts
    let parts: any[] = [{ text: newMessage }];
    
    if (imageBase64) {
      parts = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        },
        { text: newMessage }
      ];
    }

    // Append health context to system instruction for this specific call
    let effectiveSystemInstruction = SYSTEM_INSTRUCTION;
    if (healthContext) {
      effectiveSystemInstruction += `\n\n[CONTEXT] The user has connected a wearable device (${healthContext.source}). 
      Current Live Vitals:
      - Heart Rate: ${healthContext.heartRate} bpm
      - Steps Today: ${healthContext.steps}
      - Sleep: ${healthContext.sleepHours} hours
      - SpO2: ${healthContext.spo2}%
      - Body Temp: ${healthContext.temperature} F
      Use this data to provide more personalized advice if relevant to their question.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: parts }
      ],
      config: {
        systemInstruction: effectiveSystemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
};

export const analyzeMedicalReport = async (imageBase64: string): Promise<HealthRiskAnalysis> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Analyze this medical report image. 
      Extract the following structured data:
      1. A risk score from 0-100 (0 being healthy, 100 being critical) based on findings.
      2. A brief summary of the report.
      3. Key findings (bullet points).
      4. Actionable recommendations.
      5. Extracted vital signs or lab values with their status (Normal, Warning, Critical).
      
      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            keyFindings: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            vitalSigns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["Normal", "Warning", "Critical"] }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HealthRiskAnalysis;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Report Analysis Error:", error);
    throw error;
  }
};