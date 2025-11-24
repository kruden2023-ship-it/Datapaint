
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiConsultation } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { FullEstimate } from '../types';

interface AiConsultantProps {
  currentEstimate: FullEstimate | null;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const AiConsultant: React.FC<AiConsultantProps> = ({ currentEstimate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'สวัสดีครับ ผมคือผู้ช่วย AI สำหรับงานสีโรงเรียน มีข้อสงสัยเรื่องการเลือกสี, ขั้นตอนการทำงาน หรืออยากให้ช่วยวิเคราะห์งบประมาณ สอบถามได้เลยครับ!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    let context = "";
    if (currentEstimate) {
      context = `งบประมาณรวมปัจจุบัน: ${currentEstimate.grandTotal.toLocaleString()} บาท. `;
      if (currentEstimate.interior) {
        context += `พื้นที่ภายใน: ${currentEstimate.interior.netArea} ตรม. `;
      }
      if (currentEstimate.exterior) {
        context += `พื้นที่ภายนอก: ${currentEstimate.exterior.netArea} ตรม. `;
      }
    }

    const response = await getGeminiConsultation(userMessage, context);

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-white border border-slate-100' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              
              {/* Bubble */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
              }`}>
                {msg.text.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-500 border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                กำลังคิดคำตอบ...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="พิมพ์คำถามที่นี่..."
            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-full transition-all shadow-sm hover:shadow-md transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">AI อาจให้ข้อมูลคลาดเคลื่อน โปรดตรวจสอบก่อนนำไปใช้งาน</p>
      </div>
    </div>
  );
};
