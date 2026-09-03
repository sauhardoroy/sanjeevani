/**
 * Project Sanjeevani — WhatsApp URL & Message Generator
 * Creates friendly, pre-filled WhatsApp messages for Dad to send in 1 tap.
 */

/**
 * Strips formatting (spaces, hyphens) from phone numbers
 */
export function cleanPhoneNumber(phone = '') {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Builds a contextual reminder message based on medicine status
 */
export function buildReminderMessage(medicine, status, settings) {
  const recipient = settings?.grandparentsName || 'Mom & Dad';
  const medName = medicine?.name || 'medicine';

  if (status?.type === 'ABANDONMENT_RISK') {
    const pillsLeft = status.pillsOnActiveStrip;
    return `Hi ${recipient}, hope you are doing well! Just a gentle reminder that there are still ${pillsLeft} pills left in the strip of ${medName} on the table. Please finish those before opening a new box! Love you.`;
  }

  if (status?.type === 'REFILL_NOW') {
    return `Hi ${recipient}, just wanted to let you know that your ${medName} is running low (about 1-2 days left). I am arranging a fresh pack and will bring it over.`;
  }

  return `Hi ${recipient}, just checking in to make sure you took your ${medName} on time today. Hope you are having a wonderful day!`;
}

/**
 * Generates the full WhatsApp deep link
 */
export function getWhatsAppUrl(medicine, status, settings) {
  const phone = cleanPhoneNumber(settings?.grandparentsPhone || '');
  const message = buildReminderMessage(medicine, status, settings);
  const encoded = encodeURIComponent(message);
  
  if (phone) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
