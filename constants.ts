
export const PRICES = {
  // Material Cost (Per 18L Bucket)
  MAT_PRIMER_OLD: 2500,
  MAT_PRIMER_NEW: 1800,
  MAT_TOP_INT: 2500,
  MAT_TOP_EXT: 3500,
  MAT_CEILING: 1600, // Ceiling Topcoat
  MAT_PRIMER_CEILING: 1800, // Added: Ceiling Primer (Approx same as new masonry primer)

  // Labor Cost (Per SQM)
  LAB_NEW_INT: 45,
  LAB_NEW_EXT: 60,
  LAB_OLD_INT: 70,
  LAB_OLD_EXT: 95,
  LAB_CEILING: 45, // Ceiling Labor (Total for system)

  // Scaffolding Cost (Per SQM) - For high work/exterior > 1 floor
  COST_SCAFFOLDING: 120,

  // Coverage
  COVERAGE_PER_BUCKET: 150, // sqm per coat per bucket
  COVERAGE_CEILING: 175, // Ceiling paint often covers slightly more
};

export const LABELS = {
  PRIMER_OLD: 'สีรองพื้นปูนเก่า',
  PRIMER_NEW: 'สีรองพื้นปูนใหม่',
  TOP_INT: 'สีทับหน้า (ภายใน)',
  TOP_EXT: 'สีทับหน้า (ภายนอก)',
  CEILING_TOP: 'สีทับหน้าฝ้าเพดาน', 
  CEILING_PRIMER: 'สีรองพื้นฝ้าเพดาน',
  SCAFFOLDING: 'ค่าติดตั้งรื้อถอนนั่งร้าน',
};
