
import React, { useState, useEffect } from 'react';
import { BuildingCondition, Scope, Dimensions, Openings, FullEstimate, CalculationResult, PricingStandard } from '../types';
import { PRICES, LABELS } from '../constants';
import { FileText, Settings, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, PaintBucket, LayoutDashboard, Calculator, ArrowRight, Home, X } from 'lucide-react';

interface EstimatorFormProps {
  onEstimateChange: (estimate: FullEstimate | null) => void;
}

export const EstimatorForm: React.FC<EstimatorFormProps> = ({ onEstimateChange }) => {
  // State initialization with localStorage check
  const [condition, setCondition] = useState<BuildingCondition>(() => {
    const saved = localStorage.getItem('spp_condition');
    return saved ? (saved as BuildingCondition) : BuildingCondition.OLD;
  });
  
  const [scope, setScope] = useState<Scope>(() => {
    const saved = localStorage.getItem('spp_scope');
    return saved ? (saved as Scope) : Scope.INTERIOR;
  });

  const [dims, setDims] = useState<Dimensions>(() => {
    const saved = localStorage.getItem('spp_dims');
    return saved ? JSON.parse(saved) : { 
      width: 6, 
      length: 9, 
      height: 3.5, 
      roomCount: 1,
      floors: 1
    };
  });
  
  const [coats, setCoats] = useState(() => {
    const saved = localStorage.getItem('spp_coats_v2'); 
    return saved ? JSON.parse(saved) : { primer: 1, topcoat: 2, ceilingPrimer: 1, ceilingTopcoat: 2 };
  });

  const [includeCeiling, setIncludeCeiling] = useState<boolean>(() => {
    // Changed default to false as requested, updated key to v3 to reset existing users
    const saved = localStorage.getItem('spp_includeCeiling_v3');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [openings, setOpenings] = useState<Openings>(() => {
    const saved = localStorage.getItem('spp_openings_v3');
    return saved ? JSON.parse(saved) : {
      doorCount: 2, doorWidth: 0.90, doorHeight: 2.00,
      windowCount: 16, windowWidth: 1.20, windowHeight: 1.50,
      hasVents: true, ventCount: 24, ventWidth: 0.60, ventHeight: 1.00
    };
  });

  // Area Summary State
  const [areaSummary, setAreaSummary] = useState({
    gross: 0,
    deduction: 0,
    net: 0,
    ceiling: 0
  });

  const [prices, setPrices] = useState<PricingStandard>(PRICES);
  const [showSettings, setShowSettings] = useState(false);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('spp_condition', condition);
    localStorage.setItem('spp_scope', scope);
    localStorage.setItem('spp_dims', JSON.stringify(dims));
    localStorage.setItem('spp_coats_v2', JSON.stringify(coats));
    localStorage.setItem('spp_includeCeiling_v3', JSON.stringify(includeCeiling)); // Updated key
    localStorage.setItem('spp_openings_v3', JSON.stringify(openings));
  }, [condition, scope, dims, coats, includeCeiling, openings]);

  // Calculation Logic (Same as before)
  const calculateAreaDetails = (d: Dimensions, o: Openings, s: Scope) => {
    const perimeter = (d.width + d.length) * 2;
    const grossWallArea = perimeter * d.height * d.roomCount;
    const ceilingArea = d.width * d.length * d.roomCount;
    
    const doorDeduction = o.doorCount * o.doorWidth * o.doorHeight;
    const windowDeduction = o.windowCount * o.windowWidth * o.windowHeight;
    const ventDeduction = o.hasVents ? (o.ventCount * o.ventWidth * o.ventHeight) : 0;
    
    const totalDeductionPerRoom = (doorDeduction + windowDeduction + ventDeduction);
    const totalDeduction = totalDeductionPerRoom * d.roomCount;
    
    const netAreaOneSide = Math.max(0, grossWallArea - totalDeduction);
    const multiplier = s === Scope.BOTH ? 2 : 1;
    
    return {
        gross: grossWallArea * multiplier,
        deduction: totalDeduction * multiplier,
        net: netAreaOneSide * multiplier,
        ceiling: ceilingArea,
        singleSideNet: netAreaOneSide 
    };
  };

  const calculateSystem = (area: number, cond: BuildingCondition, scp: Scope, d: Dimensions, systemCoats: { primer: number, topcoat: number, ceilingPrimer: number, ceilingTopcoat: number }, withCeiling: boolean): CalculationResult | null => {
    if (area <= 0) return null;
    if (scp === Scope.BOTH) return null;

    let primerPrice = cond === BuildingCondition.OLD ? prices.MAT_PRIMER_OLD : prices.MAT_PRIMER_NEW;
    let primerName = cond === BuildingCondition.OLD ? LABELS.PRIMER_OLD : LABELS.PRIMER_NEW;
    let topPrice = scp === Scope.INTERIOR ? prices.MAT_TOP_INT : prices.MAT_TOP_EXT;
    let topName = scp === Scope.INTERIOR ? LABELS.TOP_INT : LABELS.TOP_EXT;
    let laborRate = 0;

    if (scp === Scope.INTERIOR) {
      laborRate = cond === BuildingCondition.NEW ? prices.LAB_NEW_INT : prices.LAB_OLD_INT;
    } else {
      laborRate = cond === BuildingCondition.NEW ? prices.LAB_NEW_EXT : prices.LAB_OLD_EXT;
    }

    let scaffoldingCost = 0;
    let scaffoldingRate = 0;
    if (scp === Scope.EXTERIOR && d.floors > 1) {
        scaffoldingRate = prices.COST_SCAFFOLDING;
        scaffoldingCost = area * scaffoldingRate;
    }

    let ceilingData = undefined;
    if (scp === Scope.INTERIOR && withCeiling) {
       const ceilArea = d.width * d.length * d.roomCount;
       const coverage = PRICES.COVERAGE_PER_BUCKET; 
       
       const ceilPrimerBuckets = Math.ceil((ceilArea * systemCoats.ceilingPrimer) / coverage);
       const ceilPrimerCost = ceilPrimerBuckets * (prices.MAT_PRIMER_CEILING || 1800);

       const ceilTopBuckets = Math.ceil((ceilArea * systemCoats.ceilingTopcoat) / coverage);
       const ceilTopCost = ceilTopBuckets * (prices.MAT_CEILING || 1600);

       const ceilingLaborRate = prices.LAB_CEILING || 45;
       const labor = ceilArea * ceilingLaborRate;
       
       ceilingData = {
          area: ceilArea,
          primer: {
             buckets: ceilPrimerBuckets,
             cost: ceilPrimerCost,
             pricePerBucket: prices.MAT_PRIMER_CEILING || 1800,
             name: LABELS.CEILING_PRIMER,
             coats: systemCoats.ceilingPrimer
          },
          topcoat: {
             buckets: ceilTopBuckets,
             cost: ceilTopCost,
             pricePerBucket: prices.MAT_CEILING || 1600,
             name: LABELS.CEILING_TOP,
             coats: systemCoats.ceilingTopcoat
          },
          laborCost: labor,
          laborRate: ceilingLaborRate
       };
    }

    const primerBuckets = Math.ceil((area * systemCoats.primer) / prices.COVERAGE_PER_BUCKET);
    const topBuckets = Math.ceil((area * systemCoats.topcoat) / prices.COVERAGE_PER_BUCKET);

    const primerCost = primerBuckets * primerPrice;
    const topCost = topBuckets * topPrice;
    const laborCost = area * laborRate;

    const totalCeilingMaterial = ceilingData ? (ceilingData.primer.cost + ceilingData.topcoat.cost) : 0;
    const totalCeilingLabor = ceilingData ? ceilingData.laborCost : 0;

    return {
      netArea: area,
      primer: { buckets: primerBuckets, cost: primerCost, pricePerBucket: primerPrice, name: primerName, coats: systemCoats.primer },
      topcoat: { buckets: topBuckets, cost: topCost, pricePerBucket: topPrice, name: topName, coats: systemCoats.topcoat },
      ceiling: ceilingData,
      labor: { rate: laborRate, cost: laborCost },
      scaffolding: scaffoldingCost > 0 ? { rate: scaffoldingRate, cost: scaffoldingCost } : undefined,
      totalMaterial: primerCost + topCost + totalCeilingMaterial,
      totalLabor: laborCost + scaffoldingCost + totalCeilingLabor,
      grandTotal: primerCost + topCost + laborCost + scaffoldingCost + totalCeilingMaterial + totalCeilingLabor
    };
  };

  useEffect(() => {
    const areaDetails = calculateAreaDetails(dims, openings, scope);
    setAreaSummary({
        gross: areaDetails.gross,
        deduction: areaDetails.deduction,
        net: areaDetails.net,
        ceiling: areaDetails.ceiling
    });

    const netAreaForCalc = areaDetails.singleSideNet; 
    let result: FullEstimate = { grandTotal: 0 };

    if (scope === Scope.BOTH) {
      const intRes = calculateSystem(netAreaForCalc, condition, Scope.INTERIOR, dims, coats, includeCeiling);
      const extRes = calculateSystem(netAreaForCalc, condition, Scope.EXTERIOR, dims, coats, false);
      if (intRes && extRes) {
        result = {
          interior: intRes,
          exterior: extRes,
          grandTotal: intRes.grandTotal + extRes.grandTotal
        };
      }
    } else {
      const res = calculateSystem(netAreaForCalc, condition, scope, dims, coats, includeCeiling);
      if (res) {
        if (scope === Scope.INTERIOR) result.interior = res;
        else result.exterior = res;
        result.grandTotal = res.grandTotal;
      }
    }
    
    onEstimateChange(result);
  }, [condition, scope, dims, openings, prices, coats, includeCeiling]);

  const handleResetPrices = () => {
    if(window.confirm('ต้องการคืนค่าเริ่มต้นของราคาใช่หรือไม่?')) {
        setPrices(PRICES);
    }
  };

  // Reusable UI components
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 text-slate-800">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );

  const InputLabel = ({ label, subLabel }: { label: string, subLabel?: string }) => (
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
      {subLabel && <span className="block text-xs text-slate-400 font-normal mt-0.5">{subLabel}</span>}
    </label>
  );

  const NumberInput = ({ value, onChange, placeholder, step = 1, min = 0, suffix }: any) => (
    <div className="relative group">
        <input 
            type="number" 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            min={min}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all duration-200"
        />
        {suffix && <span className="absolute right-3 top-2.5 text-sm text-slate-400 font-medium">{suffix}</span>}
    </div>
  );

  const SelectInput = ({ value, onChange, options }: any) => (
    <div className="relative">
      <select 
        value={value} 
        onChange={onChange}
        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent appearance-none transition-all duration-200 cursor-pointer"
      >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <SectionHeader icon={FileText} title="ข้อมูลโครงการ (Project Details)" />

      {/* Area Summary Dashboard - Enhanced */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200 mb-8 ring-1 ring-slate-900/5">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-800 rounded-lg">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">สรุปพื้นที่ทำงาน (Area Summary)</span>
            </div>
            {scope !== Scope.EXTERIOR && includeCeiling && (
                 <span className="text-xs font-medium text-yellow-300 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
                    + ฝ้าเพดาน {areaSummary.ceiling.toLocaleString()} ตร.ม.
                 </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-6 relative z-10">
              <div className="text-center group">
                  <p className="text-xs text-slate-400 mb-2 group-hover:text-slate-300 transition-colors">พื้นที่ผนังรวม</p>
                  <p className="text-lg font-bold text-white">{areaSummary.gross.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-500">ตร.ม.</span></p>
              </div>
              <div className="text-center group border-l border-slate-700/50 border-r">
                  <p className="text-xs text-slate-400 mb-2 group-hover:text-red-300 transition-colors">หักช่องเปิด</p>
                  <p className="text-lg font-bold text-red-400">-{areaSummary.deduction.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-red-400/50">ตร.ม.</span></p>
              </div>
              <div className="text-center group">
                  <p className="text-xs text-indigo-300 mb-2 font-semibold">พื้นที่ทาสีสุทธิ</p>
                  <p className="text-3xl font-bold text-emerald-400 drop-shadow-sm">{areaSummary.net.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-emerald-400/70">ตร.ม.</span></p>
              </div>
          </div>
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Section 1: General Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel label="สภาพอาคารเดิม" />
            <SelectInput 
                value={condition} 
                onChange={(e: any) => setCondition(e.target.value as BuildingCondition)}
                options={[
                    { value: BuildingCondition.NEW, label: "สร้างใหม่ (New Building)" },
                    { value: BuildingCondition.OLD, label: "อาคารเก่าทาสีทับ (Repaint)" }
                ]}
            />
          </div>
          <div>
            <InputLabel label="ขอบเขตงาน" />
            <SelectInput 
                value={scope} 
                onChange={(e: any) => setScope(e.target.value as Scope)}
                options={[
                    { value: Scope.INTERIOR, label: "เฉพาะภายใน (Interior Only)" },
                    { value: Scope.EXTERIOR, label: "เฉพาะภายนอก (Exterior Only)" },
                    { value: Scope.BOTH, label: "ทั้งอาคาร (Both In & Out)" }
                ]}
            />
          </div>
        </div>
        
        {/* Section 2: Paint System */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
           <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-indigo-900">
                    <PaintBucket className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold">ระบบงานสี (Paint System)</h3>
                </div>
                {scope !== Scope.EXTERIOR && (
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer select-none hover:text-indigo-600 transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeCeiling ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                           {includeCeiling && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={includeCeiling} 
                            onChange={e => setIncludeCeiling(e.target.checked)}
                            className="hidden"
                        />
                        รวมงานฝ้าเพดาน
                    </label>
                )}
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                 <InputLabel label="รองพื้นผนัง" subLabel="Wall Primer" />
                 <SelectInput 
                    value={coats.primer}
                    onChange={(e: any) => setCoats({...coats, primer: Number(e.target.value)})}
                    options={[{value: 1, label: "1 เที่ยว"}, {value: 2, label: "2 เที่ยว"}]}
                 />
              </div>
              <div>
                 <InputLabel label="ทับหน้าผนัง" subLabel="Wall Topcoat" />
                 <SelectInput 
                    value={coats.topcoat}
                    onChange={(e: any) => setCoats({...coats, topcoat: Number(e.target.value)})}
                    options={[{value: 1, label: "1 เที่ยว"}, {value: 2, label: "2 เที่ยว"}, {value: 3, label: "3 เที่ยว"}]}
                 />
              </div>
               <div className={!includeCeiling ? 'opacity-50 pointer-events-none' : ''}>
                 <InputLabel label="รองพื้นฝ้า" subLabel="Ceiling Primer" />
                 <SelectInput 
                    value={coats.ceilingPrimer}
                    onChange={(e: any) => setCoats({...coats, ceilingPrimer: Number(e.target.value)})}
                    options={[{value: 0, label: "ไม่ทา"}, {value: 1, label: "1 เที่ยว"}, {value: 2, label: "2 เที่ยว"}]}
                 />
              </div>
              <div className={!includeCeiling ? 'opacity-50 pointer-events-none' : ''}>
                 <InputLabel label="ทับหน้าฝ้า" subLabel="Ceiling Topcoat" />
                 <SelectInput 
                    value={coats.ceilingTopcoat}
                    onChange={(e: any) => setCoats({...coats, ceilingTopcoat: Number(e.target.value)})}
                    options={[{value: 1, label: "1 เที่ยว"}, {value: 2, label: "2 เที่ยว"}, {value: 3, label: "3 เที่ยว"}]}
                 />
              </div>
           </div>
        </div>

        {/* Section 3: Dimensions */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Home className="w-4 h-4"/></div>
             <h3 className="text-base font-bold text-slate-800">ขนาดห้อง / อาคาร</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <InputLabel label="จำนวนห้อง" />
              <NumberInput value={dims.roomCount} onChange={(e: any) => setDims({...dims, roomCount: Number(e.target.value)})} suffix="ห้อง" min={1} />
            </div>
             <div className="md:col-span-1">
              <InputLabel label="จำนวนชั้น" />
              <NumberInput value={dims.floors} onChange={(e: any) => setDims({...dims, floors: Number(e.target.value)})} suffix="ชั้น" min={1} />
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                   <label className="text-xs text-slate-500 font-medium mb-1 block">กว้าง</label>
                   <NumberInput value={dims.width} onChange={(e: any) => setDims({...dims, width: Number(e.target.value)})} suffix="ม." />
                </div>
                 <div className="flex items-center justify-center pt-6 text-slate-300">
                    <X className="w-4 h-4" />
                 </div>
                 <div>
                   <label className="text-xs text-slate-500 font-medium mb-1 block">ยาว</label>
                   <NumberInput value={dims.length} onChange={(e: any) => setDims({...dims, length: Number(e.target.value)})} suffix="ม." />
                </div>
            </div>
          </div>
          <div className="mt-4 w-1/3">
               <InputLabel label="ความสูงผนัง" />
               <NumberInput value={dims.height} onChange={(e: any) => setDims({...dims, height: Number(e.target.value)})} suffix="ม." />
          </div>
          
          {(scope === Scope.EXTERIOR || scope === Scope.BOTH) && dims.floors > 1 && (
             <div className="mt-3 text-xs bg-orange-50 text-orange-700 px-3 py-2 rounded-lg flex items-start gap-2 border border-orange-100">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>ระบบจะคำนวณ <strong>ค่าติดตั้งนั่งร้าน</strong> เพิ่มเติมสำหรับงานภายนอก เนื่องจากอาคารสูงกว่า 1 ชั้น</p>
             </div>
          )}
        </div>

        {/* Section 4: Openings */}
        <div>
           <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-red-50 rounded text-red-500"><LayoutDashboard className="w-4 h-4"/></div>
             <h3 className="text-base font-bold text-slate-800">หักพื้นที่ช่องเปิด (ต่อห้อง)</h3>
          </div>
          
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {/* Door */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="w-16 text-sm font-bold text-slate-700">ประตู</span>
              <div className="w-24">
                 <NumberInput value={openings.doorCount} onChange={(e: any) => setOpenings({...openings, doorCount: Number(e.target.value)})} suffix="บาน" placeholder="0" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className="flex items-center gap-2">
                 <div className="w-24">
                    <NumberInput value={openings.doorWidth} onChange={(e: any) => setOpenings({...openings, doorWidth: Number(e.target.value)})} suffix="ม." step={0.1} />
                 </div>
                 <span className="text-slate-400">x</span>
                 <div className="w-24">
                    <NumberInput value={openings.doorHeight} onChange={(e: any) => setOpenings({...openings, doorHeight: Number(e.target.value)})} suffix="ม." step={0.1} />
                 </div>
              </div>
            </div>

             {/* Window */}
             <div className="flex flex-wrap items-center gap-4">
              <span className="w-16 text-sm font-bold text-slate-700">หน้าต่าง</span>
              <div className="w-24">
                 <NumberInput value={openings.windowCount} onChange={(e: any) => setOpenings({...openings, windowCount: Number(e.target.value)})} suffix="บาน" placeholder="0" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className="flex items-center gap-2">
                 <div className="w-24">
                    <NumberInput value={openings.windowWidth} onChange={(e: any) => setOpenings({...openings, windowWidth: Number(e.target.value)})} suffix="ม." step={0.1} />
                 </div>
                 <span className="text-slate-400">x</span>
                 <div className="w-24">
                    <NumberInput value={openings.windowHeight} onChange={(e: any) => setOpenings({...openings, windowHeight: Number(e.target.value)})} suffix="ม." step={0.1} />
                 </div>
              </div>
            </div>

            {/* Vents */}
            <div className="flex flex-wrap items-center gap-4">
               <div className="w-16">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={openings.hasVents} onChange={e => setOpenings({...openings, hasVents: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    ช่องลม
                  </label>
               </div>
              
              {openings.hasVents && (
                <>
                   <div className="w-24">
                        <NumberInput value={openings.ventCount} onChange={(e: any) => setOpenings({...openings, ventCount: Number(e.target.value)})} suffix="ช่อง" placeholder="0" />
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-300" />
                   <div className="flex items-center gap-2">
                        <div className="w-24">
                            <NumberInput value={openings.ventWidth} onChange={(e: any) => setOpenings({...openings, ventWidth: Number(e.target.value)})} suffix="ม." step={0.1} />
                        </div>
                        <span className="text-slate-400">x</span>
                        <div className="w-24">
                            <NumberInput value={openings.ventHeight} onChange={(e: any) => setOpenings({...openings, ventHeight: Number(e.target.value)})} suffix="ม." step={0.1} />
                        </div>
                   </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Configuration Section */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors p-3 rounded-xl hover:bg-slate-50 group"
        >
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1.5 rounded group-hover:bg-indigo-100 transition-colors">
                <Settings className="w-4 h-4" />
            </div>
            ตั้งค่าราคากลาง & ค่าแรง (Unit Prices)
          </div>
          {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSettings && (
          <div className="mt-4 bg-slate-50 p-6 rounded-2xl text-sm border border-slate-200 shadow-inner animate-fade-slide-down">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-800 text-base">ปรับแต่งราคาต่อหน่วย</h4>
              <button 
                onClick={handleResetPrices}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-red-200 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3 h-3" /> คืนค่าเริ่มต้น
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Material Costs */}
              <div className="space-y-3">
                <h5 className="font-bold text-indigo-600 flex items-center gap-2 pb-2 border-b border-indigo-100">
                    <PaintBucket className="w-4 h-4" /> ราคาสี (บาท/ถัง 18 ลิตร)
                </h5>
                <div className="space-y-2">
                    {[
                        { l: "รองพื้นปูนเก่า", v: prices.MAT_PRIMER_OLD, k: "MAT_PRIMER_OLD" },
                        { l: "รองพื้นปูนใหม่", v: prices.MAT_PRIMER_NEW, k: "MAT_PRIMER_NEW" },
                        { l: "ทับหน้าภายใน", v: prices.MAT_TOP_INT, k: "MAT_TOP_INT" },
                        { l: "ทับหน้าภายนอก", v: prices.MAT_TOP_EXT, k: "MAT_TOP_EXT" },
                        { l: "รองพื้นฝ้า", v: prices.MAT_PRIMER_CEILING || 1800, k: "MAT_PRIMER_CEILING" },
                        { l: "ทับหน้าฝ้า", v: prices.MAT_CEILING || 1600, k: "MAT_CEILING" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <label className="text-slate-600">{item.l}</label>
                            <input type="number" value={item.v} onChange={e => setPrices({...prices, [item.k]: Number(e.target.value)})} className="w-24 p-1.5 border border-slate-200 rounded-lg text-right text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
                        </div>
                    ))}
                </div>
              </div>

              {/* Labor Costs */}
              <div className="space-y-3">
                <h5 className="font-bold text-orange-600 flex items-center gap-2 pb-2 border-b border-orange-100">
                    <Calculator className="w-4 h-4" /> ค่าแรง (บาท/ตร.ม.)
                </h5>
                <div className="space-y-2">
                    {[
                        { l: "อาคารใหม่ (ภายใน)", v: prices.LAB_NEW_INT, k: "LAB_NEW_INT" },
                        { l: "อาคารใหม่ (ภายนอก)", v: prices.LAB_NEW_EXT, k: "LAB_NEW_EXT" },
                        { l: "อาคารเก่า (ภายใน)", v: prices.LAB_OLD_INT, k: "LAB_OLD_INT" },
                        { l: "อาคารเก่า (ภายนอก)", v: prices.LAB_OLD_EXT, k: "LAB_OLD_EXT" },
                        { l: "งานทาฝ้าเพดาน", v: prices.LAB_CEILING || 45, k: "LAB_CEILING" },
                        { l: "ค่านั่งร้าน (>1 ชั้น)", v: prices.COST_SCAFFOLDING, k: "COST_SCAFFOLDING" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <label className="text-slate-600">{item.l}</label>
                            <input type="number" value={item.v} onChange={e => setPrices({...prices, [item.k]: Number(e.target.value)})} className="w-24 p-1.5 border border-slate-200 rounded-lg text-right text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
