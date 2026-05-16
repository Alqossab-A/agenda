// Google Calendar colorId → hex
const COLOR_MAP: Record<string, string> = {
  '1': '#818cf8', // Soft Indigo
  '2': '#34d399', // Emerald
  '3': '#c084fc', // Soft Purple
  '4': '#fb7185', // Rose
  '5': '#fbbf24', // Amber
  '6': '#fb923c', // Soft Orange
  '7': '#22d3ee', // Cyan
  '8': '#94a3b8', // Slate
  '9': '#60a5fa', // Sky Blue
  '10': '#4ade80', // Soft Green
  '11': '#f87171', // Coral
};

export const colorIdToHex = (colorId?: string): string =>
  COLOR_MAP[colorId ?? ''] ?? '#3b82f6';

/** Maps a task list title to a Google Calendar colorId */
export const listTitleToColorId = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('work')) return '9'; // Blueberry
  if (t.includes('personal')) return '2'; // Sage
  if (t.includes('daily')) return '7'; // Peacock
  if (t.includes('stud')) return '3'; // Grape
  if (t.includes('content') || t.includes('creat')) return '6'; // Tangerine
  if (t.includes('health') || t.includes('well')) return '10'; // Basil
  if (t.includes('shop')) return '5'; // Banana
  return '1'; // Lavender (default)
};