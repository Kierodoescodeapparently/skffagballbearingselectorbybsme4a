export interface SuffixEntry {
  category: string;
  skfCode: string;
  fagCode: string;
  meaning: string;
  notes: string;
}

export const DESIGNATION_SUFFIX_COMPARISON: SuffixEntry[] = [
  // Shields & Seals
  {
    category: 'Shields & Seals',
    skfCode: '2Z / -2Z',
    fagCode: '2ZR / -2ZR',
    meaning: 'Non-contact sheet steel dust shields on both sides',
    notes: 'No friction increase, allows high speeds, grease retained for life',
  },
  {
    category: 'Shields & Seals',
    skfCode: '2RS1 / 2RSH',
    fagCode: '2RSR',
    meaning: 'Contacting NBR elastomer lip seals on both sides',
    notes: 'Maximum dust/moisture exclusion, speed restricted by friction',
  },
  {
    category: 'Shields & Seals',
    skfCode: '2RZ',
    fagCode: '2RSD',
    meaning: 'Low-friction non-contacting rubber seals on both sides',
    notes: 'Optimal balance of sealing integrity and minimal thermal rise',
  },
  // Radial Internal Clearance
  {
    category: 'Radial Clearance',
    skfCode: 'C2',
    fagCode: 'C2',
    meaning: 'Radial internal clearance less than Normal (tight)',
    notes: 'For reduced runout or high stiffness requirements',
  },
  {
    category: 'Radial Clearance',
    skfCode: 'CN (Standard)',
    fagCode: 'CN (Standard)',
    meaning: 'Normal radial internal clearance (ISO standard)',
    notes: 'Default general industrial machinery fit',
  },
  {
    category: 'Radial Clearance',
    skfCode: 'C3',
    fagCode: 'C3',
    meaning: 'Radial internal clearance greater than Normal',
    notes: 'Most popular for electric motors with temperature gradient between shaft and housing',
  },
  {
    category: 'Radial Clearance',
    skfCode: 'C4',
    fagCode: 'C4',
    meaning: 'Radial internal clearance greater than C3',
    notes: 'For heavy press fits or severe thermal differentials',
  },
  // Contact Angles
  {
    category: 'Contact Angle',
    skfCode: 'B / BE',
    fagCode: 'B',
    meaning: '40° nominal contact angle',
    notes: 'Maximum axial thrust load carrying capacity in angular contact bearings',
  },
  {
    category: 'Contact Angle',
    skfCode: 'ACD / E',
    fagCode: 'E',
    meaning: '25° nominal contact angle',
    notes: 'Preferred for high-speed machine tool spindles requiring high axial stiffness',
  },
  {
    category: 'Contact Angle',
    skfCode: 'CD / C',
    fagCode: 'C',
    meaning: '15° nominal contact angle',
    notes: 'Preferred for ultra-high-speed machine tool spindles (lower centrifugal heating)',
  },
  // Cages
  {
    category: 'Cage Design',
    skfCode: 'TN9 / P',
    fagCode: 'TVP / TVH',
    meaning: 'Injection molded glass-fiber reinforced polyamide PA66',
    notes: 'Low weight, quiet running, operating limit 120°C',
  },
  {
    category: 'Cage Design',
    skfCode: 'J',
    fagCode: 'J',
    meaning: 'Pressed ribbon sheet steel cage, ball centered',
    notes: 'Standard economical construction for deep groove ball bearings',
  },
  {
    category: 'Cage Design',
    skfCode: 'M / MA',
    fagCode: 'M / MP',
    meaning: 'Machined brass cage, outer ring or ball centered',
    notes: 'Severe vibration, shock, or high-temperature applications',
  },
  {
    category: 'Cage Design',
    skfCode: 'T / (Spindle)',
    fagCode: 'T',
    meaning: 'Fabric reinforced phenolic resin cage',
    notes: 'Standard for super-precision spindle bearings up to 100°C',
  },
  // Spindle Preload
  {
    category: 'Spindle Preload',
    skfCode: 'GA',
    fagCode: 'UL / L',
    meaning: 'Light universal preload for back-to-back or face-to-face pairs',
    notes: 'Highest limiting speed, lowest thermal generation',
  },
  {
    category: 'Spindle Preload',
    skfCode: 'GB',
    fagCode: 'UM / M',
    meaning: 'Medium universal preload',
    notes: 'High spindle rigidity for milling and general turning',
  },
  {
    category: 'Spindle Preload',
    skfCode: 'GC',
    fagCode: 'US / S',
    meaning: 'Heavy universal preload',
    notes: 'Maximum cutting stiffness, speeds must be derated by ~30%',
  },
  // Precision Grades
  {
    category: 'Tolerance Class',
    skfCode: 'P4 / P4A',
    fagCode: 'P4S / P4',
    meaning: 'ISO Class 4 / ABEC 7 super-precision running accuracy',
    notes: 'Sub-micron radial and axial runout for precision spindles',
  },
  {
    category: 'Tolerance Class',
    skfCode: 'P2 / PA9A',
    fagCode: 'P2 / UP',
    meaning: 'ISO Class 2 / ABEC 9 ultra-precision',
    notes: 'Ultra-precision grinding heads, optical scanners, and aerospace gyros',
  },
];

/**
 * Parses designation and produces interchange advice
 */
export function getInterchangeAdvice(
  sourceMfg: 'SKF' | 'FAG',
  designation: string
): { targetMfg: 'SKF' | 'FAG'; targetDesignation: string; notes: string } {
  const isSKF = sourceMfg === 'SKF';
  const targetMfg = isSKF ? 'FAG' : 'SKF';
  
  let targetDesignation = designation;
  let notes = 'Direct functional equivalent according to ISO dimensional plan.';

  if (isSKF) {
    targetDesignation = targetDesignation
      .replace(/-2Z/g, '-2ZR')
      .replace(/2Z/g, '2ZR')
      .replace(/2RS1/g, '2RSR')
      .replace(/2RSH/g, '2RSR')
      .replace(/BEP/g, 'B-TVP')
      .replace(/TN9/g, 'TVH')
      .replace(/CD\/P4ADGA/g, 'C-T-P4S-UL')
      .replace(/ACD\/P4ADGA/g, 'E-T-P4S-UL');
  } else {
    targetDesignation = targetDesignation
      .replace(/-2ZR/g, '-2Z')
      .replace(/2ZR/g, '2Z')
      .replace(/2RSR/g, '2RSH')
      .replace(/B-TVP/g, 'BEP')
      .replace(/TVH/g, 'TN9')
      .replace(/C-T-P4S-UL/g, 'CD/P4ADGA')
      .replace(/E-T-P4S-UL/g, 'ACD/P4ADGA');
  }

  return { targetMfg, targetDesignation, notes };
}
