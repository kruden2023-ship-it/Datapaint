
import React, { useState } from 'react';
import { EstimatorForm } from './components/EstimatorForm';
import { BoqResult } from './components/BoqResult';
import { AiConsultant } from './components/AiConsultant';
import { FullEstimate } from '../types';
import { PaintBucket, MessageSquare, X, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [estimate, setEstimate] = useState<FullEstimate | null>(null);
  const [showAi, setShowAi] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar - Minimal White Style */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <PaintBucket className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">ระบบประมาณราคางานสีโรงเรียน</h1>
                <p className="text-sm text-slate-500 font-medium">เพื่อนำข้อมูลไปใช้ใน ปร.4 ปร.5 และ ปร.6 (งานทาสี)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            {/* Left Column: Input */}
          <div className="lg:col-span-7 no-print">
              <EstimatorForm onEstimateChange={setEstimate} />
          </div>

          {/* Right Column: Result (Printable) */}
          <div className="lg:col-span-5 print:w-full h-full">
            <div className="sticky top-28 h-full">
              <BoqResult estimate={estimate} /> 
            </div>
          </div>
        </div>

      </main>
      
      {/* AI Floating Action Button - Modern Style */}
      <div className="fixed bottom-8 right-8 z-50 no-print flex flex-col items-end gap-4">
        {showAi ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-[360px] md:w-[420px] flex flex-col overflow-hidden animate-slide-in-up ring-1 ring-black/5">
             <div className="bg-white p-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-50 p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                   </div>
                   <div>
                      <span className="font-bold text-base block text-slate-800">AI Consultant</span>
                      <span className="text-xs text-slate-500">ผู้ช่วยอัจฉริยะ (Gemini 2.5)</span>
                   </div>
                </div>
                <button 
                  onClick={() => setShowAi(false)} 
                  className="hover:bg-slate-50 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                   <X className="w-5 h-5" />
                </button>
             </div>
             <div className="h-[550px] bg-slate-50">
                <AiConsultant currentEstimate={estimate} />
             </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAi(true)}
            className="group relative flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-5 pr-6 py-4 rounded-full shadow-xl shadow-slate-200 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold text-base tracking-wide">ปรึกษา AI</span>
          </button>
        )}
      </div>

      <footer className="bg-white border-t border-slate-100 mt-20 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium">© 2025 ระบบประมาณราคางานสีโรงเรียน</p>
          <p className="text-slate-400 text-sm mt-1">พัฒนาโดย นายศิริชัย จันทะขาล</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
