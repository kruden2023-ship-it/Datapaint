import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiConsultation = async (
  query: string, 
  contextData?: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      คุณคือ "ผู้เชี่ยวชาญงานสีอาคารโรงเรียน" (School Paint Consultant)
      หน้าที่ของคุณคือให้คำแนะนำทางเทคนิคเกี่ยวกับการทาสีโรงเรียน การเลือกสีที่เหมาะสมกับห้องเรียน (จิตวิทยาสี) การแก้ปัญหางานปูน และการประมาณการ
      
      ข้อมูลราคากลางที่คุณใช้อ้างอิง:
      - สีรองพื้นปูนเก่า: 2,500 บาท/ถัง
      - สีรองพื้นปูนใหม่: 1,800 บาท/ถัง
      - สีทับหน้าภายใน: 2,500 บาท/ถัง
      - สีทับหน้าภายนอก: 3,500 บาท/ถัง
      
      ตอบคำถามให้กระชับ เข้าใจง่าย และเน้นความเป็นมืออาชีพ
    `;

    const prompt = contextData 
      ? `ข้อมูลโครงการปัจจุบัน:\n${contextData}\n\nคำถามของผู้ใช้: ${query}` 
      : query;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Consultant กรุณาลองใหม่อีกครั้ง";
  }
};