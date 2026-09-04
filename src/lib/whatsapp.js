/**
 * Project Sanjeevani — WhatsApp URL & Message Generator
 * Creates friendly, pre-filled WhatsApp messages for Dad to send in 1 tap,
 * with full support for editing and custom messages.
 */

/**
 * Strips formatting (spaces, hyphens) from phone numbers
 */
export function cleanPhoneNumber(phone = '') {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Builds a contextual reminder message based on medicine status and preset type
 */
export function buildReminderMessage(medicine, status, settings, preset = 'DEFAULT', profiles = []) {
  const profile = Array.isArray(profiles) 
    ? profiles.find(p => p.id === medicine?.recipient || p.id === medicine?.profileId)
    : null;
  const personName = profile?.name 
    || (medicine?.recipient === 'prof-grandfather' || medicine?.recipient === 'GRANDFATHER' 
      ? 'Grandfather' 
      : medicine?.recipient === 'prof-grandmother' || medicine?.recipient === 'GRANDMOTHER' 
      ? 'Grandmother' 
      : 'Family Member');
  const familyName = settings?.grandparentsName || 'Family';
  const medName = medicine?.name || 'medicine';
  const safeDays = status?.safeDays ?? 0;
  const fullStrips = medicine?.stock?.fullStripsDelivered ?? 0;

  if (preset === 'SIBLING') {
    return `Hi, just checking ${personName}'s medicines. ${medName} has about ${safeDays} days of supply left (${fullStrips} full strips in reserve). Could you please pick up a refill when you visit or pass by the pharmacy? Thanks!`;
  }

  if (preset === 'REFILL' || status?.type === 'REFILL_NOW') {
    return `Hi ${familyName}, just wanted to let you know that ${personName}'s ${medName} is running low (about ${safeDays} days left). I am arranging a fresh pack and will make sure it reaches on time.`;
  }

  if (status?.type === 'ABANDONMENT_RISK') {
    const pillsLeft = status.pillsOnActiveStrip;
    return `Hi ${familyName}, gentle reminder that there are still ${pillsLeft} pills left in the strip of ${medName} on the table. Please finish those before opening a new box! Love you.`;
  }

  return `Hi ${familyName}, hope you are doing well! Just checking in to make sure ${personName} took ${medName} today. Please let me know if you need anything.`;
}

/**
 * Generates the full WhatsApp deep link for any custom text
 */
export function getCustomWhatsAppUrl(phone = '', message = '') {
  const cleaned = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(message.trim());
  
  if (cleaned) {
    return `https://wa.me/${cleaned}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Generates the default WhatsApp deep link
 */
export function getWhatsAppUrl(medicine, status, settings, profiles = []) {
  const profile = Array.isArray(profiles) 
    ? profiles.find(p => p.id === medicine?.recipient || p.id === medicine?.profileId)
    : null;
  const phone = profile?.phone || settings?.grandparentsPhone || '';
  const message = buildReminderMessage(medicine, status, settings, 'DEFAULT', profiles);
  return getCustomWhatsAppUrl(phone, message);
}
