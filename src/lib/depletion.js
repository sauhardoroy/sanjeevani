/**
 * Project Sanjeevani — Depletion & Early Abandonment Math Engine
 * Grounded in Idea.md Section 5 & sanjeevani-ui-implementation-plan.md
 */

export const ABANDONMENT_THRESHOLD = 3; // Pills left when grandparents mistakenly consider strip finished

/**
 * Calculates daily burn rate (tablets per day)
 * @param {Array<string>} timeOfDay - e.g. ['MORNING', 'NIGHT']
 * @param {number} pillsPerDose - e.g. 1.0 or 0.5
 * @returns {number}
 */
export function calculateDailyBurnRate(timeOfDay = ['MORNING'], pillsPerDose = 1.0) {
  const dosesPerDay = Array.isArray(timeOfDay) && timeOfDay.length > 0 ? timeOfDay.length : 1;
  return dosesPerDay * (Number(pillsPerDose) || 1.0);
}

/**
 * Calculates elapsed days between two ISO date strings (or Date objects)
 */
export function getElapsedDays(fromDateStr, toDate = new Date()) {
  if (!fromDateStr) return 0;
  const from = new Date(fromDateStr);
  const diffTime = toDate.getTime() - from.getTime();
  if (diffTime <= 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Projects current stock taking elapsed time into account
 */
export function projectCurrentStock(medicine, asOfDate = new Date()) {
  const { stock, stripConfig, schedule } = medicine;
  const tabletsPerStrip = Number(stripConfig?.tabletsPerStrip) || 10;
  const dailyBurn = calculateDailyBurnRate(schedule?.timeOfDay, schedule?.pillsPerDose);
  
  const elapsedDays = getElapsedDays(stock?.lastAuditDate, asOfDate);
  const pillsConsumed = elapsedDays * dailyBurn;

  let fullStrips = Number(stock?.fullStripsDelivered) || 0;
  let pillsOnActive = Number(stock?.currentStripPillsLeft) || 0;

  let remainingToDeduct = pillsConsumed;

  while (remainingToDeduct > 0 && (fullStrips > 0 || pillsOnActive > 0)) {
    if (pillsOnActive >= remainingToDeduct) {
      pillsOnActive -= remainingToDeduct;
      remainingToDeduct = 0;
    } else {
      remainingToDeduct -= pillsOnActive;
      if (fullStrips > 0) {
        fullStrips -= 1;
        pillsOnActive = tabletsPerStrip;
      } else {
        pillsOnActive = 0;
        remainingToDeduct = 0;
      }
    }
  }

  return {
    fullStripsRemaining: Math.max(0, fullStrips),
    pillsOnActiveStrip: Math.max(0, Math.round(pillsOnActive * 10) / 10),
    elapsedDays,
    dailyBurn
  };
}

/**
 * Evaluates medicine status and returns color, urgency priority, and human-readable text
 * Priority sorting: Red (1) -> Amber (2) -> Green (3)
 */
export function evaluateMedicineStatus(medicine, asOfDate = new Date()) {
  const { fullStripsRemaining, pillsOnActiveStrip, dailyBurn } = projectCurrentStock(medicine, asOfDate);
  const tabletsPerStrip = Number(medicine.stripConfig?.tabletsPerStrip) || 10;
  const abandonmentThreshold = Number(medicine.stripConfig?.abandonmentBuffer) || ABANDONMENT_THRESHOLD;

  // Real-world safe usable pills
  const usableFromFullStrips = fullStripsRemaining * Math.max(1, tabletsPerStrip - abandonmentThreshold);
  const usableFromActive = Math.max(0, pillsOnActiveStrip - abandonmentThreshold);
  const effectiveTablets = usableFromFullStrips + usableFromActive;

  const totalRawTablets = (fullStripsRemaining * tabletsPerStrip) + pillsOnActiveStrip;
  const safeDays = dailyBurn > 0 ? effectiveTablets / dailyBurn : 0;
  const rawDays = dailyBurn > 0 ? totalRawTablets / dailyBurn : 0;

  // Condition 1: Critical Refill Needed (Red)
  if (totalRawTablets <= 0 || safeDays <= 2 || rawDays <= 2) {
    const daysText = Math.max(0, Math.round(rawDays));
    return {
      color: 'red',
      priority: 1, // High priority
      type: 'REFILL_NOW',
      badgeText: daysText <= 0 ? 'Empty' : `${daysText} Day${daysText === 1 ? '' : 's'} Left`,
      badgeSubtext: 'Refill Now',
      warningLine: `Only ${daysText} day${daysText === 1 ? '' : 's'} of pills remaining. Time to buy next box.`,
      fullStripsRemaining,
      pillsOnActiveStrip,
      safeDays: Math.max(0, Math.round(safeDays)),
      totalRawTablets
    };
  }

  // Condition 2: Early Abandonment Risk (Amber)
  // Trigger rule: active strip has <= 4 pills remaining and > 0 pills
  if (pillsOnActiveStrip <= 4 && pillsOnActiveStrip > 0) {
    return {
      color: 'amber',
      priority: 2,
      type: 'ABANDONMENT_RISK',
      badgeText: `${pillsOnActiveStrip} Pill${pillsOnActiveStrip === 1 ? '' : 's'} Left`,
      badgeSubtext: 'Call Grandparents',
      warningLine: `Attention: Only ${pillsOnActiveStrip} pill${pillsOnActiveStrip === 1 ? '' : 's'} left in active strip. High risk of grandparents discarding early or opening next strip.`,
      fullStripsRemaining,
      pillsOnActiveStrip,
      safeDays: Math.max(1, Math.round(safeDays)),
      totalRawTablets
    };
  }

  // Condition 3: Low stock warning (Amber)
  if (safeDays <= 7) {
    const days = Math.max(1, Math.round(safeDays));
    return {
      color: 'amber',
      priority: 2,
      type: 'LOW_STOCK',
      badgeText: `${days} Days Left`,
      badgeSubtext: 'Order Soon',
      warningLine: `${days} days of safe supply left. Plan a refill on your next visit.`,
      fullStripsRemaining,
      pillsOnActiveStrip,
      safeDays: days,
      totalRawTablets
    };
  }

  // Condition 4: Safe (Green)
  const days = Math.round(safeDays);
  return {
    color: 'green',
    priority: 3,
    type: 'SAFE',
    badgeText: `${days} Days Left`,
    badgeSubtext: 'Safe & Normal',
    warningLine: null,
    fullStripsRemaining,
    pillsOnActiveStrip,
    safeDays: days,
    totalRawTablets
  };
}

/**
 * Reconciles stock based on Dad's audit
 * @param {Object} medicine
 * @param {'MATCHES_EXPECTED' | 'STRIP_DISCARDED_EARLY'} outcome
 * @param {Date} auditDate
 */
export function reconcileAudit(medicine, outcome, auditDate = new Date()) {
  const current = projectCurrentStock(medicine, auditDate);
  const tabletsPerStrip = Number(medicine.stripConfig?.tabletsPerStrip) || 10;
  const isoDate = auditDate.toISOString().split('T')[0];

  let updatedFullStrips = current.fullStripsRemaining;
  let updatedPillsLeft = current.pillsOnActiveStrip;
  let wastedPillsCount = 0;

  if (outcome === 'STRIP_DISCARDED_EARLY') {
    wastedPillsCount = current.pillsOnActiveStrip;
    if (updatedFullStrips > 0) {
      updatedFullStrips -= 1;
      updatedPillsLeft = tabletsPerStrip;
    } else {
      updatedPillsLeft = 0;
    }
  }

  const updatedMedicine = {
    ...medicine,
    stock: {
      ...medicine.stock,
      fullStripsDelivered: updatedFullStrips,
      currentStripPillsLeft: updatedPillsLeft,
      lastAuditDate: isoDate
    }
  };

  const auditRecord = {
    id: 'audit-' + Date.now(),
    medicineId: medicine.id,
    medicineName: medicine.name,
    timestamp: new Date().toISOString(),
    outcome,
    wastedPillsCount,
    fullStripsRemaining: updatedFullStrips,
    pillsOnActiveStrip: updatedPillsLeft,
    note: outcome === 'MATCHES_EXPECTED' 
      ? 'Physical inventory matched expected schedule' 
      : `Strip discarded early with ${wastedPillsCount} pills remaining; new strip opened`
  };

  return {
    updatedMedicine,
    auditRecord
  };
}
