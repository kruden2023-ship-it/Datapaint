
import React from 'react';
import { FullEstimate, CalculationResult, BuildingCondition } from '../types';
import { LABELS } from '../constants';
import { Download, CheckCircle2, AlertTriangle, FileText, Layers, Banknote } from 'lucide-react';

interface BoqResultProps {
  estimate: FullEstimate | null;
}

const CostRow = ({ label, qty, unit, unitPrice, total, isSubHeader = false, isLast = false }: { label: string, qty?: number | string, unit?: string, unitPrice?: number, total: number, isSubHeader?: boolean, isLast?: boolean }) => (
  <div className={`flex justify-between items-center py-3 ${isSubHeader ? 'bg-slate-50 px-3 rounded-lg mt-2 mb-1 font-semibold border border-slate-100' : 'px-3'} ${!isLast && !isSubHeader ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
    <div className={`flex-1 ${isSubHeader ? 'text-slate-800' : 'text-slate-600 text-sm'}`}>{label}</div>
    
    <div className="flex items-center gap-4">
        {qty && (
            <div className="text-right text-slate-400 text-xs font-medium tabular-nums hidden sm:block">
                {Number(qty).toLocaleString()} {unit} <span className="text-slate-300 mx-1">×</span> {unitPrice?.toLocaleString()}
            </div>
        )}
        <div className={`w-28 text-right tabular-nums ${isSubHeader ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
        {total.toLocaleString()}
        </div>
    </div>
  </div>
);

const SectionBOQ = ({ title, data, colorClass }: { title: string, data: CalculationResult, colorClass: string }) => (
  <div className="mb-8 last:mb-0">
    <div className={`flex items-center gap-3 mb-4 pb-2 border-b ${colorClass}`}>
        <Layers className="w-5 h-5 opacity-80" />
        <h4 className="text-lg font-bold uppercase tracking-wide">{title}</h4>
    </div>
    
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 flex justify-between items-center border-b border-slate-100">
             <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                พื้นที่ผนัง: {data.netArea.toLocaleString()} ตร.ม.
             </span>
             {data.ceiling && (
                 <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    + ฝ้า {data.ceiling.area.toLocaleString()} ตร.ม.
                 </span>
             )}
        </div>
        
        <div className="p-2">
            <CostRow 
                label={`1. ${data.primer.name} (${data.primer.coats} เที่ยว)`} 
                qty={data.primer.buckets} unit="ถัง" unitPrice={data.primer.pricePerBucket} 
                total={data.primer.cost} 
            />
            <CostRow 
                label={`2. ${data.topcoat.name} (${data.topcoat.coats} เที่ยว)`} 
                qty={data.topcoat.buckets} unit="ถัง" unitPrice={data.topcoat.pricePerBucket} 
                total={data.topcoat.cost} 
            />
            {data.ceiling && (
               <>
                 {data.ceiling.primer.coats > 0 && (
                     <CostRow 
                        label={`3. ${data.ceiling.primer.name} (${data.ceiling.primer.coats} เที่ยว)`} 
                        qty={data.ceiling.primer.buckets} unit="ถัง" unitPrice={data.ceiling.primer.pricePerBucket} 
                        total={data.ceiling.primer.cost} 
                    />
                 )}
                 <CostRow 
                    label={`4. ${data.ceiling.topcoat.name} (${data.ceiling.topcoat.coats} เที่ยว)`} 
                    qty={data.ceiling.topcoat.buckets} unit="ถัง" unitPrice={data.ceiling.topcoat.pricePerBucket} 
                    total={data.ceiling.topcoat.cost} 
                  />
               </>
            )}

             <CostRow 
                label="รวมค่าวัสดุ (Materials)" 
                total={data.totalMaterial} 
                isSubHeader
            />

            <div className="my-2"></div>

            <CostRow 
                label={`5. ค่าแรงทาสีผนัง`} 
                qty={data.netArea.toLocaleString()} unit="ตร.ม." unitPrice={data.labor.rate} 
                total={data.labor.cost} 
            />
            
            {data.ceiling && (
                <CostRow 
                  label={`6. ค่าแรงทาสีฝ้า`} 
                  qty={data.ceiling.area.toLocaleString()} unit="ตร.ม." unitPrice={data.ceiling.laborRate}
                  total={data.ceiling.laborCost} 
                />
            )}

            {data.scaffolding && (
               <CostRow 
                label={`7. ${LABELS.SCAFFOLDING}`} 
                qty={data.netArea.toLocaleString()} unit="ตร.ม." unitPrice={data.scaffolding.rate} 
                total={data.scaffolding.cost} 
              />
            )}

             <CostRow 
                label="รวมค่าแรง (Labor)" 
                total={data.totalLabor} 
                isSubHeader
            />
        </div>
    </div>
  </div>
);

export const BoqResult: React.FC<BoqResultProps> = ({ estimate }) => {
  if (!estimate) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center text-slate-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 skew-y-12 transform scale-150 origin-bottom-left -z-10"></div>
        <div className="bg-white p-6 rounded-full shadow-lg mb-6 ring-4 ring-slate-50">
            <CheckCircle2 className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">รอข้อมูลการประเมิน</h3>
        <p className="max-w-xs text-slate-500 font-light">กรุณากรอกข้อมูลขนาดอาคารและรายละเอียดทางด้านซ้ายเพื่อเริ่มคำนวณงบประมาณ</p>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    if (!estimate) return;

    const rows: (string | number)[][] = [];
    rows.push(["รายการ (Item)", "จำนวน (Qty)", "หน่วย (Unit)", "ราคาต่อหน่วย (Unit Price)", "ราคารวม (Total Cost)"]);

    const addSectionToCSV = (title: string, data: CalculationResult) => {
        rows.push([title, "", "", "", ""]);
        let itemIndex = 1;
        rows.push([`${itemIndex++}. ${data.primer.name}`, data.primer.buckets, "ถัง", data.primer.pricePerBucket, data.primer.cost]);
        rows.push([`${itemIndex++}. ${data.topcoat.name}`, data.topcoat.buckets, "ถัง", data.topcoat.pricePerBucket, data.topcoat.cost]);
        if(data.ceiling) {
           if(data.ceiling.primer.coats > 0) {
              rows.push([`${itemIndex++}. ${data.ceiling.primer.name}`, data.ceiling.primer.buckets, "ถัง", data.ceiling.primer.pricePerBucket, data.ceiling.primer.cost]);
           }
           rows.push([`${itemIndex++}. ${data.ceiling.topcoat.name}`, data.ceiling.topcoat.buckets, "ถัง", data.ceiling.topcoat.pricePerBucket, data.ceiling.topcoat.cost]);
        }
        rows.push(["   รวมค่าวัสดุ", "", "", "", data.totalMaterial]);
        rows.push([`${itemIndex++}. ค่าแรงทาสีผนัง`, data.netArea, "ตร.ม.", data.labor.rate, data.labor.cost]);
        if(data.ceiling) {
           rows.push([`${itemIndex++}. ค่าแรงทาสีฝ้า`, data.ceiling.area, "ตร.ม.", data.ceiling.laborRate, data.ceiling.laborCost]);
        }
        if (data.scaffolding) {
            rows.push([`${itemIndex++}. ${LABELS.SCAFFOLDING}`, data.netArea, "ตร.ม.", data.scaffolding.rate, data.scaffolding.cost]);
        }
        rows.push(["   รวมค่าแรง", "", "", "", data.totalLabor]);
        rows.push(["", "", "", "", ""]); 
    };

    if (estimate.interior) addSectionToCSV("งานภายใน (Interior)", estimate.interior);
    if (estimate.exterior) addSectionToCSV("งานภายนอก (Exterior)", estimate.exterior);

    rows.push(["งบประมาณสุทธิ (Grand Total)", "", "", "", estimate.grandTotal]);

    const csvContent = "\uFEFF" + rows.map(e => e.map(cell => {
        const str = String(cell);
        return str.includes(',') ? `"${str}"` : str;
    }).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "school_paint_estimate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 h-full relative overflow-hidden flex flex-col animate-fade-slide-up">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-2xl">
             <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ใบสรุปงบประมาณ</h2>
            <p className="text-sm text-slate-500 font-medium">Estimate Quotation (BOQ)</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow font-semibold"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="mb-6 text-sm bg-blue-50/50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
               <p className="font-semibold">หมายเหตุราคามาตรฐาน</p>
               <p className="opacity-80">ราคาอ้างอิงเกรดมาตรฐานงานราชการ (ถัง 18 ลิตร) | ราคานี้เป็นราคาประเมินเบื้องต้น</p>
            </div>
        </div>

        {estimate.interior && (
          <SectionBOQ title="งานภายใน (Interior)" data={estimate.interior} colorClass="text-indigo-600 border-indigo-200" />
        )}

        {estimate.exterior && (
          <SectionBOQ title="งานภายนอก (Exterior)" data={estimate.exterior} colorClass="text-orange-600 border-orange-200" />
        )}

        <div className="mt-8">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-300">
                            <Banknote className="w-5 h-5" />
                            <span className="font-medium">งบประมาณสุทธิ (Grand Total)</span>
                        </div>
                        <p className="text-xs text-slate-400">*ราคารวมค่าวัสดุและค่าแรงแล้ว</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold tracking-tight text-white tabular-nums">฿{estimate.grandTotal.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <p className="text-xs text-slate-400 mt-6 text-center font-light">
            เอกสารนี้สร้างโดย ระบบประมาณราคางานสีโรงเรียน | พัฒนาโดย นายศิริชัย จันทะขาล
        </p>
      </div>
    </div>
  );
};
