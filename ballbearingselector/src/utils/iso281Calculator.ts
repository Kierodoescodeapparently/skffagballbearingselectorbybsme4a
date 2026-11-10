import { Bearing, CalculationResult, OperatingConditions } from '../types/bearing';

// ISO 281 Fa / (f0 * C0) table for Deep Groove Ball Bearings
interface IsoDGBBRow {
  ratio: number;
  e: number;
  Y: number;
}

const ISO_DGBB_TABLE: IsoDGBBRow[] = [
  { ratio: 0.172, e: 0.19, Y: 2.30 },
  { ratio: 0.345, e: 0.22, Y: 1.99 },
  { ratio: 0.689, e: 0.26, Y: 1.71 },
  { ratio: 1.03, e: 0.28, Y: 1.55 },
  { ratio: 1.38, e: 0.30, Y: 1.45 },
  { ratio: 2.07, e: 0.34, Y: 1.31 },
  { ratio: 3.45, e: 0.38, Y: 1.15 },
  { ratio: 5.17, e: 0.42, Y: 1.04 },
  { ratio: 6.89, e: 0.44, Y: 1.00 },
];

/**
 * Interpolates e and Y for deep groove ball bearings according to ISO 281
 */
export function getDgbbFactors(fa: number, c0: number, f0: number = 14.5): { e: number; Y: number } {
  if (c0 <= 0 || fa <= 0) {
    return { e: 0.19, Y: 2.30 };
  }
  const ratio = (fa * 1000) / (f0 * (c0 * 1000)); // normalized ratio Fa / (f0 * C0)
  
  if (ratio <= ISO_DGBB_TABLE[0].ratio) {
    return { e: ISO_DGBB_TABLE[0].e, Y: ISO_DGBB_TABLE[0].Y };
  }
  const lastIdx = ISO_DGBB_TABLE.length - 1;
  if (ratio >= ISO_DGBB_TABLE[lastIdx].ratio) {
    return { e: ISO_DGBB_TABLE[lastIdx].e, Y: ISO_DGBB_TABLE[lastIdx].Y };
  }
  
  for (let i = 0; i < lastIdx; i++) {
    const cur = ISO_DGBB_TABLE[i];
    const nxt = ISO_DGBB_TABLE[i + 1];
    if (ratio >= cur.ratio && ratio <= nxt.ratio) {
      const t = (ratio - cur.ratio) / (nxt.ratio - cur.ratio);
      const e = cur.e + t * (nxt.e - cur.e);
      const Y = cur.Y + t * (nxt.Y - cur.Y);
      return { e, Y };
    }
  }
  return { e: 0.25, Y: 1.7 };
}

/**
 * Calculates ISO 281 equivalent dynamic load factors X and Y based on bearing family
 */
export function getEquivalentFactors(
  category: Bearing['category'],
  contactAngle: number,
  Fr: number,
  Fa: number,
  C0?: number,
  f0?: number
): { e: number; X: number; Y: number } {
  if (Fr <= 0 && Fa <= 0) {
    return { e: 0.25, X: 1, Y: 0 };
  }

  const loadRatio = Fr > 0 ? Fa / Fr : 999;

  switch (category) {
    case 'deep_groove': {
      const { e, Y } = getDgbbFactors(Fa, C0 || 15, f0 || 14.5);
      if (loadRatio <= e) {
        return { e, X: 1, Y: 0 };
      } else {
        return { e, X: 0.56, Y };
      }
    }
    case 'angular_contact': {
      // 40 degree contact angle (B series)
      const e = 1.14;
      if (loadRatio <= e) {
        return { e, X: 1, Y: 0 };
      } else {
        return { e, X: 0.35, Y: 0.57 };
      }
    }
    case 'spindle': {
      if (contactAngle === 15) {
        // C suffix (15 deg)
        const e = 0.38;
        if (loadRatio <= e) {
          return { e, X: 1, Y: 0 };
        } else {
          return { e, X: 0.44, Y: 1.47 };
        }
      } else {
        // E suffix (25 deg)
        const e = 0.68;
        if (loadRatio <= e) {
          return { e, X: 1, Y: 0 };
        } else {
          return { e, X: 0.41, Y: 0.87 };
        }
      }
    }
    case 'self_aligning': {
      const e = 0.25;
      if (loadRatio <= e) {
        return { e, X: 1, Y: 0 };
      } else {
        return { e, X: 0.65, Y: 2.6 };
      }
    }
    default:
      return { e: 0.25, X: 1, Y: 0 };
  }
}

/**
 * Calculates Static Equivalent Load P0 (kN)
 */
export function calculateStaticEquivalentLoad(
  category: Bearing['category'],
  contactAngle: number,
  Fr: number,
  Fa: number
): number {
  let P0 = Fr;
  switch (category) {
    case 'deep_groove':
      P0 = 0.6 * Fr + 0.5 * Fa;
      break;
    case 'angular_contact':
      P0 = 0.5 * Fr + 0.26 * Fa;
      break;
    case 'spindle':
      if (contactAngle === 15) {
        P0 = 0.5 * Fr + 0.46 * Fa;
      } else {
        P0 = 0.5 * Fr + 0.38 * Fa;
      }
      break;
    case 'self_aligning':
      P0 = Fr + 2.3 * Fa;
      break;
  }
  return Math.max(Fr, P0);
}

/**
 * Calculates required dynamic load rating C_req (kN) for target life hours
 */
export function calculateRequiredC(
  P: number,
  speedRpm: number,
  targetLifeHours: number,
  serviceFactor: number
): number {
  if (P <= 0 || speedRpm <= 0 || targetLifeHours <= 0) return 0;
  // Ball bearings use exponent p = 3
  const lifeRevMillions = (60 * speedRpm * targetLifeHours) / 1_000_000;
  const lifeFactor = Math.pow(lifeRevMillions, 1 / 3);
  return P * serviceFactor * lifeFactor;
}

/**
 * Complete evaluation of a specific bearing under operating conditions
 */
export function evaluateBearing(
  bearing: Bearing,
  conditions: OperatingConditions
): CalculationResult {
  const { Fr, Fa, speed, targetLifeHours, serviceFactor, lubrication } = conditions;
  const loadRatio = Fr > 0 ? Fa / Fr : 999;
  
  const { e, X, Y } = getEquivalentFactors(
    bearing.category,
    bearing.contactAngle,
    Fr,
    Fa,
    bearing.C0,
    bearing.f0
  );

  const P_unfactored = X * Fr + Y * Fa;
  const P = Math.max(Fr, P_unfactored);
  const requiredC = calculateRequiredC(P, speed, targetLifeHours, serviceFactor);

  // Effective design load on bearing including service factor
  const effectiveP = P * serviceFactor;

  // L10 life in million revolutions: (C / effectiveP)^3
  const achievedL10 = effectiveP > 0 ? Math.pow(bearing.C / effectiveP, 3) : 999999;
  
  // L10h in hours: (10^6 / (60 * n)) * L10
  const achievedL10h = speed > 0 ? (achievedL10 * 1_000_000) / (60 * speed) : 999999;
  const isLifeSufficient = achievedL10h >= targetLifeHours;

  // Static load & safety factor
  const P0 = calculateStaticEquivalentLoad(bearing.category, bearing.contactAngle, Fr, Fa);
  const S0 = P0 > 0 ? bearing.C0 / P0 : 999;
  const isStaticSafe = S0 >= 1.5; // Standard ISO minimum for rotating machinery

  // Limiting speed check
  const speedLimit = lubrication === 'oil' ? bearing.limitingSpeedOil : bearing.limitingSpeedGrease;
  const isSpeedPermissible = speed <= speedLimit;

  return {
    Fr,
    Fa,
    speed,
    targetLifeHours,
    serviceFactor,
    Fa_over_Fr: loadRatio,
    e,
    X,
    Y,
    P,
    P_unfactored,
    requiredC,
    bearing,
    achievedL10,
    achievedL10h,
    isLifeSufficient,
    P0,
    S0,
    isStaticSafe,
    speedLimit,
    isSpeedPermissible,
  };
}

/**
 * Generates speed vs life curve points for graphing
 */
export function generateLifeCurve(
  bearing: Bearing,
  conditions: OperatingConditions,
  numPoints: number = 12
): Array<{ speed: number; lifeHours: number }> {
  const { Fr, Fa, serviceFactor } = conditions;
  const { X, Y } = getEquivalentFactors(
    bearing.category,
    bearing.contactAngle,
    Fr,
    Fa,
    bearing.C0,
    bearing.f0
  );
  const P = Math.max(Fr, (X * Fr + Y * Fa) * serviceFactor);
  if (P <= 0) return [];

  const baseL10 = Math.pow(bearing.C / P, 3);
  const maxSpeed = Math.max(bearing.limitingSpeedGrease * 1.2, conditions.speed * 2, 6000);
  const minSpeed = Math.max(200, Math.floor(maxSpeed * 0.05));
  const step = (maxSpeed - minSpeed) / (numPoints - 1);

  const curve: Array<{ speed: number; lifeHours: number }> = [];
  for (let i = 0; i < numPoints; i++) {
    const s = Math.round(minSpeed + i * step);
    const lifeH = (baseL10 * 1_000_000) / (60 * s);
    curve.push({ speed: s, lifeHours: Math.round(lifeH) });
  }
  return curve;
}
