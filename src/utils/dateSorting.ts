import { Achievement, JourneyEntry } from '../types/database';

/**
 * Intelligent date parser for achievements.
 * Handles formats like:
 * - "2025"
 * - "October 2023"
 * - "May 2024"
 * - "2023-08-15"
 * - "2023 - 2024"
 * - "Ongoing" / "Present"
 */
export function parseAchievementDate(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  // Ongoing / Present achievements (e.g. current research fellowship)
  if (/present|current|ongoing/i.test(trimmed)) {
    return 1e14;
  }

  // Attempt standard Date.parse (works for ISO dates, "October 2023", "2024-05-12", "2025")
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return parsed;
  }

  // Find 4-digit years (e.g., in ranges like "2023 - 2024")
  const years = trimmed.match(/\b(19\d\d|20\d\d)\b/g);
  if (years && years.length > 0) {
    const latestYear = Math.max(...years.map(y => parseInt(y, 10)));
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    let monthIndex = 0;
    for (const [m, idx] of Object.entries(monthNames)) {
      if (new RegExp(`\\b${m}`, 'i').test(trimmed)) {
        monthIndex = idx;
        break;
      }
    }
    return new Date(latestYear, monthIndex, 1).getTime();
  }

  return 0;
}

/**
 * Automatically sorts achievements from Newest -> Oldest (most recent first).
 * Preserves existing order gracefully when dates are identical (stable sort).
 * Pure function: does NOT mutate the original array or database objects.
 */
export function sortAchievementsNewestFirst(achievements: Achievement[]): Achievement[] {
  if (!achievements || achievements.length <= 1) return achievements || [];
  return [...achievements].sort((a, b) => {
    const timeA = parseAchievementDate(a.date);
    const timeB = parseAchievementDate(b.date);
    if (timeB !== timeA) {
      return timeB - timeA; // Descending: Newest first
    }
    return 0; // Stable preservation of order on tie
  });
}

/**
 * Intelligent date parser for Journey milestones.
 * Handles formats like:
 * - "2024 - Present"
 * - "Jan 2023 - Present"
 * - "Current"
 * - "2022 - 2024"
 * - "Aug 2023 - Dec 2023"
 * - "2021"
 */
export function parseJourneyDateRange(dateRange?: string): { isOngoing: boolean; sortKey: number } {
  if (!dateRange || typeof dateRange !== 'string') {
    return { isOngoing: false, sortKey: 0 };
  }
  const trimmed = dateRange.trim();
  if (!trimmed) {
    return { isOngoing: false, sortKey: 0 };
  }

  const isOngoing = /present|current|ongoing/i.test(trimmed);

  const parseToken = (str: string): number => {
    const t = str.trim();
    if (!t) return 0;
    const p = Date.parse(t);
    if (!isNaN(p)) return p;
    const years = t.match(/\b(19\d\d|20\d\d)\b/g);
    if (years && years.length > 0) {
      const y = parseInt(years[years.length - 1], 10);
      const monthNames: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      let m = 0;
      for (const [monthKey, idx] of Object.entries(monthNames)) {
        if (new RegExp(`\\b${monthKey}`, 'i').test(t)) {
          m = idx;
          break;
        }
      }
      return new Date(y, m, 1).getTime();
    }
    return 0;
  };

  if (isOngoing) {
    const parts = trimmed.split(/\s*[-–—/]\s*|\s+to\s+/i);
    const startPart = parts[0] || '';
    const startTime = parseToken(startPart);
    // Ongoing items always outrank non-ongoing items (base 1e14)
    return { isOngoing: true, sortKey: 1e14 + startTime };
  }

  const parts = trimmed.split(/\s*[-–—/]\s*|\s+to\s+/i);
  if (parts.length > 1) {
    const endTime = parseToken(parts[parts.length - 1]);
    const startTime = parseToken(parts[0]);
    return { isOngoing: false, sortKey: endTime || startTime };
  }

  return { isOngoing: false, sortKey: parseToken(trimmed) };
}

/**
 * Automatically sorts journey entries from Newest / Present -> Oldest / Earlier.
 * - Ongoing/Present milestones appear first as most recent.
 * - Completed milestones sorted latest/newest first, moving backwards in time.
 * - Preserves existing order gracefully when dates are identical (stable sort).
 * Pure function: does NOT mutate the original array or database objects.
 */
export function sortJourneyPresentNewestFirst(journey: JourneyEntry[]): JourneyEntry[] {
  if (!journey || journey.length <= 1) return journey || [];
  return [...journey].sort((a, b) => {
    const parsedA = parseJourneyDateRange(a.date_range);
    const parsedB = parseJourneyDateRange(b.date_range);
    if (parsedB.sortKey !== parsedA.sortKey) {
      return parsedB.sortKey - parsedA.sortKey; // Descending: Present/Newest first
    }
    return 0; // Stable preservation of order on tie
  });
}
