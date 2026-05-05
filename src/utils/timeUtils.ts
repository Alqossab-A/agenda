export const formatHour = (h: number): string => {
  if (h === 24) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
};

export const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i + 1);
export const SLOT_H = 64; // px — 1 hour row height
export const SLOT_H_MOBILE = 48 // mobile — fits more hours on screen