export type BearingCategory = 'deep_groove' | 'angular_contact' | 'spindle' | 'self_aligning';

export interface Bearing {
  id: string;
  category: BearingCategory;
  series: string;
  skfDesignation: string;
  fagDesignation: string;
  d: number; // Bore diameter (mm)
  D: number; // Outside diameter (mm)
  B: number; // Width (mm)
  C: number; // Basic dynamic load rating (kN)
  C0: number; // Basic static load rating (kN)
  f0?: number; // Calculation factor for DGBB (13.0 - 16.5)
  contactAngle: number; // Contact angle in degrees (0 for DGBB, 40 for B, 15 for C, 25 for E)
  limitingSpeedGrease: number; // rpm
  limitingSpeedOil: number; // rpm
  referenceSpeed?: number; // thermal reference speed rpm
  mass: number; // kg
  da_min: number; // Shaft abutment diameter min (mm)
  Da_max: number; // Housing abutment diameter max (mm)
  ra_max: number; // Fillet radius max (mm)
  description: string;
  sealingOptions: string[];
  cageMaterial: string;
}

export interface OperatingConditions {
  Fr: number; // Radial load in kN
  Fa: number; // Axial / Thrust load in kN
  speed: number; // Rotational speed in rpm
  targetLifeHours: number; // Required L10h in hours
  serviceFactor: number; // Application duty factor fs (1.0 to 3.0)
  minBore?: number; // Optional filter d_min (mm)
  maxBore?: number; // Optional filter d_max (mm)
  lubrication: 'grease' | 'oil';
  machineType: string;
}

export interface CalculationResult {
  Fr: number;
  Fa: number;
  speed: number;
  targetLifeHours: number;
  serviceFactor: number;
  
  // Equivalent dynamic load
  Fa_over_Fr: number;
  e: number;
  X: number;
  Y: number;
  P: number; // Equivalent dynamic load in kN (with service factor)
  P_unfactored: number; // Before fs
  
  // Required dynamic rating
  requiredC: number; // in kN
  
  // Specific to selected bearing
  bearing?: Bearing;
  achievedL10: number; // in million revolutions
  achievedL10h: number; // in hours
  isLifeSufficient: boolean;
  
  // Static safety
  P0: number; // Equivalent static load in kN
  S0: number; // Static safety factor C0 / P0
  isStaticSafe: boolean;
  
  // Speed check
  speedLimit: number;
  isSpeedPermissible: boolean;
}

export interface ApplicationPreset {
  id: string;
  name: string;
  serviceFactor: number;
  typicalLifeHours: number;
  typicalSpeed: number;
  description: string;
}
