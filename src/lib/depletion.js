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
  const targetDate = toDate instanceof Date && !isNaN(toDate.getTime())
    ? toDate
    : (typeof toDate === 'string' || typeof toDate === 'number') && !isNaN(new Date(toDate).getTime())
      ? new Date(toDate)
      : new Date();
  const diffTime = targetDate.getTime() - from.getTime();
  if (diffTime <= 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Projects current stock taking elapsed time into account
 * Supports multiple partially-used open strips (e.g. stock.openStrips = [3, 7])
 */
export function projectCurrentStock(medicine, asOfDate = new Date()) {
  const { stock, stripConfig, schedule } = medicine;
  const tabletsPerStrip = Number(stripConfig?.tabletsPerStrip) || 10;
  const dailyBurn = calculateDailyBurnRate(schedule?.timeOfDay, schedule?.pillsPerDose);
  
  const elapsedDays = getElapsedDays(stock?.lastAuditDate, asOfDate);
  let pillsConsumed = elapsedDays * dailyBurn;

  let fullStrips = Number(stock?.fullStripsDelivered) || 0;
  
  // Normalize openStrips array (backward compatible with currentStripPillsLeft)
  let openStrips = Array.isArray(stock?.openStrips) && stock.openStrips.length > 0
    ? stock.openStrips.map(n => Math.max(0, Math.min(tabletsPerStrip, Number(n) || 0)))
    : [Math.max(0, Math.min(tabletsPerStrip, Number(stock?.currentStripPillsLeft) || 0))];

  // Sequentially deduct consumed pills from open strips
  for (let i = 0; i < openStrips.length && pillsConsumed > 0; i++) {
    if (openStrips[i] >= pillsConsumed) {
      openStrips[i] -= pillsConsumed;
      pillsConsumed = 0;
    } else {
      pillsConsumed -= openStrips[i];
      openStrips[i] = 0;
    }
  }

  // If consumption exceeds current open strips, deduct from unopened full strips
  while (pillsConsumed > 0 && fullStrips > 0) {
    fullStrips -= 1;
    if (tabletsPerStrip >= pillsConsumed) {
      openStrips.push(tabletsPerStrip - pillsConsumed);
      pillsConsumed = 0;
    } else {
      pillsConsumed -= tabletsPerStrip;
      openStrips.push(0);
    }
  }

  // Filter out completely emptied strips unless no strips are left
  const remainingOpen = openStrips.filter(p => p > 0);
  const finalOpenStrips = remainingOpen.length > 0 
    ? remainingOpen 
    : (fullStrips > 0 ? [tabletsPerStrip] : [0]);

  const pillsOnActiveStrip = finalOpenStrips.reduce((a, b) => a + b, 0);

  return {
    fullStripsRemaining: Math.max(0, fullStrips),
    openStripsRemaining: finalOpenStrips,
    pillsOnActiveStrip: Math.max(0, Math.round(pillsOnActiveStrip * 10) / 10),
    elapsedDays,
    dailyBurn
  };
}

/**
 * Evaluates medicine status and returns color, urgency priority, and human-readable text
 * Priority sorting: Red (1) -> Amber (2) -> Green (3)
 */
export function evaluateMedicineStatus(medicine, asOfDate = new Date()) {
  const { fullStripsRemaining, openStripsRemaining, pillsOnActiveStrip, dailyBurn } = projectCurrentStock(medicine, asOfDate);
  const tabletsPerStrip = Number(medicine.stripConfig?.tabletsPerStrip) || 10;
  const abandonmentThreshold = Number(medicine.stripConfig?.abandonmentBuffer) || ABANDONMENT_THRESHOLD;

  // Calculate usable pills across ALL open strips and full strips
  const usableFromFullStrips = fullStripsRemaining * Math.max(1, tabletsPerStrip - abandonmentThreshold);
  const usableFromOpenStrips = openStripsRemaining.reduce((sum, count) => {
    return sum + Math.max(0, count - abandonmentThreshold);
  }, 0);
  const effectiveTablets = usableFromFullStrips + usableFromOpenStrips;

  const totalRawTablets = (fullStripsRemaining * tabletsPerStrip) + pillsOnActiveStrip;
  const safeDays = dailyBurn > 0 ? effectiveTablets / dailyBurn : 0;
  const rawDays = dailyBurn > 0 ? totalRawTablets / dailyBurn : 0;

  const hasMultipleOpen = openStripsRemaining.length > 1;
  const anyStripInDropZone = openStripsRemaining.some(count => count <= abandonmentThreshold && count > 0);
  const lowestOpenStrip = Math.min(...openStripsRemaining);

  // Condition 1: Critical Refill Needed (Red)
  if (totalRawTablets <= 0 || safeDays <= 2 || rawDays <= 2) {
    const daysText = Math.max(0, Math.round(rawDays));
    return {
      color: 'red',
      priority: 1,
      type: 'REFILL_NOW',
      badgeText: daysText <= 0 ? 'Empty' : `${daysText} Day${daysText === 1 ? '' : 's'} Left`,
      badgeSubtext: 'Refill Now',
      warningLine: `Only ${daysText} day${daysText === 1 ? '' : 's'} of pills remaining. Time to buy next box.`,
      fullStripsRemaining,
      openStripsRemaining,
      pillsOnActiveStrip,
      hasMultipleOpen,
      safeDays: Math.max(0, Math.round(safeDays)),
      totalRawTablets
    };
  }

  // Condition 2: Early Abandonment Risk (Amber)
  if (anyStripInDropZone) {
    const message = hasMultipleOpen
      ? `Attention: ${openStripsRemaining.length} open strips in use. Strip with ${lowestOpenStrip} pills is at risk of being discarded.`
      : `Attention: Only ${lowestOpenStrip} pill${lowestOpenStrip === 1 ? '' : 's'} left in active strip. High risk of early discard.`;

    return {
      color: 'amber',
      priority: 2,
      type: 'ABANDONMENT_RISK',
      badgeText: hasMultipleOpen ? `${openStripsRemaining.length} Strips Open` : `${lowestOpenStrip} Pills Left`,
      badgeSubtext: 'Check Strips',
      warningLine: message,
      fullStripsRemaining,
      openStripsRemaining,
      pillsOnActiveStrip,
      hasMultipleOpen,
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
      openStripsRemaining,
      pillsOnActiveStrip,
      hasMultipleOpen,
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
    badgeText: hasMultipleOpen ? `${openStripsRemaining.length} Strips Open` : `${days} Days Left`,
    badgeSubtext: 'Safe & Normal',
    warningLine: hasMultipleOpen ? `Note: Grandparents have ${openStripsRemaining.length} partial strips in use (${pillsOnActiveStrip} total pills).` : null,
    fullStripsRemaining,
    openStripsRemaining,
    pillsOnActiveStrip,
    hasMultipleOpen,
    safeDays: days,
    totalRawTablets
  };
}

/**
 * Reconciles stock based on Dad's audit or physical count match
 */
export function reconcileAudit(medicine, outcome, customData = null, auditDate = new Date()) {
  const current = projectCurrentStock(medicine, auditDate);
  const tabletsPerStrip = Number(medicine.stripConfig?.tabletsPerStrip) || 10;
  const isoDate = auditDate.toISOString().split('T')[0];

  let updatedFullStrips = current.fullStripsRemaining;
  let updatedOpenStrips = [...current.openStripsRemaining];
  let wastedPillsCount = 0;
  let note = '';

  if (outcome === 'COUNT_ADJUSTED' && customData) {
    updatedFullStrips = Number(customData.fullStripsDelivered) || 0;
    updatedOpenStrips = Array.isArray(customData.openStrips) && customData.openStrips.length > 0
      ? customData.openStrips.map(n => Math.max(0, Math.min(tabletsPerStrip, Number(n) || 0)))
      : [Math.max(0, Number(customData.currentStripPillsLeft) || 0)];
    note = `Count updated: ${updatedOpenStrips.length} open strip(s) [${updatedOpenStrips.join(', ')} pills], ${updatedFullStrips} unopened strip(s).`;
  } else if (outcome === 'STRIP_DISCARDED_EARLY') {
    // Remove the lowest open strip (the one discarded)
    if (updatedOpenStrips.length > 1) {
      const minVal = Math.min(...updatedOpenStrips);
      const minIdx = updatedOpenStrips.indexOf(minVal);
      wastedPillsCount = minVal;
      updatedOpenStrips.splice(minIdx, 1);
      note = `Grandparents discarded strip with ${wastedPillsCount} pills left. ${updatedOpenStrips.length} strip(s) still open.`;
    } else {
      wastedPillsCount = updatedOpenStrips[0] || 0;
      if (updatedFullStrips > 0) {
        updatedFullStrips -= 1;
        updatedOpenStrips = [tabletsPerStrip];
      } else {
        updatedOpenStrips = [0];
      }
      note = `Strip discarded with ${wastedPillsCount} pills left; fresh strip opened.`;
    }
  } else {
    // MATCHES_EXPECTED
    note = `Physical count verified (${updatedOpenStrips.length} strip(s) in use).`;
  }

  const updatedMedicine = {
    ...medicine,
    stock: {
      ...medicine.stock,
      fullStripsDelivered: updatedFullStrips,
      openStrips: updatedOpenStrips,
      currentStripPillsLeft: updatedOpenStrips[0] || 0,
      lastAuditDate: isoDate
    }
  };

  const auditRecord = {
    id: 'audit-' + Date.now(),
    medicineId: medicine.id,
    medicineName: medicine.name,
    recipient: medicine.recipient || 'GRANDMOTHER',
    timestamp: new Date().toISOString(),
    outcome,
    wastedPillsCount,
    fullStripsRemaining: updatedFullStrips,
    pillsOnActiveStrip: updatedOpenStrips.reduce((a, b) => a + b, 0),
    note
  };

  return {
    updatedMedicine,
    auditRecord
  };
}
