// Google Calendar colorId → hex
const COLOR_MAP: Record<string, string> = {
    '1':  '#7986cb',  // Lavender
    '2':  '#33b679',  // Sage
    '3':  '#8e24aa',  // Grape
    '4':  '#e67c73',  // Flamingo
    '5':  '#f6bf26',  // Banana
    '6':  '#f4511e',  // Tangerine
    '7':  '#039be5',  // Peacock
    '8':  '#616161',  // Graphite
    '9':  '#3f51b5',  // Blueberry
    '10': '#0b8043',  // Basil
    '11': '#d50000',  // Tomato
  }
  
  export const colorIdToHex = (colorId?: string): string =>
    COLOR_MAP[colorId ?? ''] ?? '#3b82f6'
  
  /** Maps a task list title to a Google Calendar colorId */
  export const listTitleToColorId = (title: string): string => {
    const t = title.toLowerCase()
    if (t.includes('work'))                            return '9'   // Blueberry
    if (t.includes('personal'))                        return '2'   // Sage
    if (t.includes('daily'))                           return '7'   // Peacock
    if (t.includes('stud'))                            return '3'   // Grape
    if (t.includes('content') || t.includes('creat')) return '6'   // Tangerine
    if (t.includes('health') || t.includes('well'))   return '10'  // Basil
    if (t.includes('shop'))                            return '5'   // Banana
    return '1'  // Lavender (default)
  }