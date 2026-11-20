// Karakoram Crest Expeditions - Core Operating Rules
// Pure business-rule functions used across components, pages, and Node test runner.

export const MAX_GROUP = 10;       // Rule 1: Capacity limit (numerical limit)
export const DEADLINE_HOURS = 72;  // Rule 3: 72 hours departure booking cutoff
export const GROUP_DISCOUNT_THRESHOLD = 5; // 5+ travellers qualify for 10% discount
export const GROUP_DISCOUNT_PERCENT = 0.10;
export const DEPOSIT_PERCENT = 0.30;

/**
 * Rule 1: Capacity / Availability Check
 * Validates group size against absolute max limit (10) and currently remaining seats.
 */
export function checkGroupSize(n, seatsLeft) {
  const maxAllowed = Math.min(MAX_GROUP, seatsLeft);
  
  if (typeof n !== 'number' || isNaN(n) || !Number.isInteger(n) || n < 1) {
    return {
      ok: false,
      max: maxAllowed,
      message: 'Please select at least 1 traveller.'
    };
  }
  
  if (n > MAX_GROUP) {
    return {
      ok: false,
      max: maxAllowed,
      message: `Maximum booking capacity is ${MAX_GROUP} travellers per reservation.`
    };
  }
  
  if (n > seatsLeft) {
    return {
      ok: false,
      max: maxAllowed,
      message: seatsLeft <= 0 
        ? 'This expedition is currently sold out.' 
        : `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} remaining on this expedition.`
    };
  }
  
  return {
    ok: true,
    max: maxAllowed,
    message: ''
  };
}

/**
 * Rule 2: Eligibility Check
 * Checks if the youngest traveller meets the minimum age requirement of the expedition.
 */
export function checkAge(age, trip) {
  const numAge = Number(age);
  
  if (isNaN(numAge) || numAge < 1 || numAge > 110) {
    return {
      ok: false,
      message: 'Please enter a valid age between 1 and 110.'
    };
  }
  
  if (!trip || typeof trip.minAge !== 'number') {
    return { ok: true, message: '' };
  }
  
  if (numAge < trip.minAge) {
    return {
      ok: false,
      message: `${trip.title} requires all participants to be at least ${trip.minAge} years old (entered: ${numAge}).`
    };
  }
  
  return {
    ok: true,
    message: ''
  };
}

/**
 * Rule 3: Booking Cutoff & Fulfilment Deadline Check
 * Expeditions require at least 72 hours advance reservation for logistical coordination.
 */
export function checkDeadline(departure, referenceNow) {
  const depTime = new Date(departure).getTime();
  const nowTime = new Date(referenceNow).getTime();
  
  if (isNaN(depTime) || isNaN(nowTime)) {
    return {
      ok: false,
      hoursRemaining: 0,
      message: 'Invalid departure date provided.'
    };
  }
  
  const diffHours = (depTime - nowTime) / (1000 * 60 * 60);
  
  if (diffHours < DEADLINE_HOURS) {
    return {
      ok: false,
      hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
      message: `Booking closed: reservations close ${DEADLINE_HOURS} hours prior to departure.`
    };
  }
  
  return {
    ok: true,
    hoursRemaining: Math.round(diffHours * 10) / 10,
    message: `Open (${Math.round(diffHours)} hours until departure)`
  };
}

/**
 * Financial Calculation Summary
 * Computes people count, subtotal, group discount (10% if 5+ travellers), total, and 30% deposit.
 */
export function summarize(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return {
      people: 0,
      subtotal: 0,
      discount: 0,
      discountApplied: false,
      total: 0,
      deposit: 0
    };
  }
  
  const people = lines.reduce((acc, line) => acc + (line.travellers || 0), 0);
  const subtotal = lines.reduce((acc, line) => {
    const price = line.trip ? line.trip.price : 0;
    return acc + (price * (line.travellers || 0));
  }, 0);
  
  const discountApplied = people >= GROUP_DISCOUNT_THRESHOLD;
  const discount = discountApplied ? Math.round(subtotal * GROUP_DISCOUNT_PERCENT) : 0;
  const total = subtotal - discount;
  const deposit = Math.round(total * DEPOSIT_PERCENT);
  
  return {
    people,
    subtotal,
    discount,
    discountApplied,
    total,
    deposit
  };
}
