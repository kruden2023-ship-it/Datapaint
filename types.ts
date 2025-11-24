
export enum BuildingCondition {
  NEW = 'NEW',
  OLD = 'OLD'
}

export enum Scope {
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  BOTH = 'BOTH'
}

export interface Dimensions {
  width: number;
  length: number;
  height: number;
  roomCount: number;
  floors: number;
}

export interface Openings {
  doorCount: number;
  doorWidth: number;
  doorHeight: number;
  windowCount: number;
  windowWidth: number;
  windowHeight: number;
  hasVents: boolean;
  ventCount: number;
  ventWidth: number;
  ventHeight: number;
  vents?: boolean; // Legacy support
}

export interface PricingStandard {
  MAT_PRIMER_OLD: number;
  MAT_PRIMER_NEW: number;
  MAT_TOP_INT: number;
  MAT_TOP_EXT: number;
  MAT_CEILING: number;     // Topcoat for ceiling
  MAT_PRIMER_CEILING: number; // Added: Primer for ceiling
  LAB_NEW_INT: number;
  LAB_NEW_EXT: number;
  LAB_OLD_INT: number;
  LAB_OLD_EXT: number;
  LAB_CEILING: number;
  COST_SCAFFOLDING: number;
  COVERAGE_PER_BUCKET: number;
}

export interface MaterialCost {
  buckets: number;
  cost: number;
  pricePerBucket: number;
  name: string;
  coats: number;
}

export interface CalculationResult {
  netArea: number;
  primer: MaterialCost;
  topcoat: MaterialCost;
  ceiling?: { 
    area: number;
    primer: MaterialCost;   // Added
    topcoat: MaterialCost;  // Added
    laborCost: number;
    laborRate: number;      // Added: To display correct unit price
  };
  labor: {
    rate: number;
    cost: number;
  };
  scaffolding?: {
    rate: number;
    cost: number;
  };
  totalMaterial: number;
  totalLabor: number;
  grandTotal: number;
}

export interface FullEstimate {
  interior?: CalculationResult;
  exterior?: CalculationResult;
  grandTotal: number;
}
