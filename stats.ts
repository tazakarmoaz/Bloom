import type { Entry, InsightStats, MoodKey } from './types';
import { MOOD_ORDER } from './moods';

function getDayDiff(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const ms = dateA.getTime() - dateB.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function computeStreak(entries: Entry[], referenceDate: string): number {
  const sorted = [...entries].sort((a, b) => (a.date > b.date ? -1 : 1));
  if (!sorted.length) return 0;

  const first = sorted[0];
  const diff = getDayDiff(referenceDate, first.date);
  if (diff > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    const dayDiff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function computeLongestStreak(entries: Entry[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].map((e) => e.date).sort();
  let max = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const dayDiff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff === 1) {
      current++;
      max = Math.max(max, current);
    } else if (dayDiff > 1) {
      current = 1;
    }
  }
  return max;
}

export function computeMostCommonMood(entries: Entry[], customOrder: MoodKey[] = []): MoodKey | null {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    counts[entry.mood_key] = (counts[entry.mood_key] ?? 0) + 1;
  }
  let best: MoodKey | null = null;
  let bestCount = 0;
  for (const key of [...MOOD_ORDER, ...customOrder]) {
    const count = counts[key] ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = key;
    }
  }
  return best;
}

export function computeRecentCounts(entries: Entry[], days = 30, customOrder: MoodKey[] = []): Record<MoodKey, number> {
  const allKeys = [...new Set([...MOOD_ORDER, ...customOrder])];
  const counts = Object.fromEntries(allKeys.map((k) => [k, 0])) as Record<MoodKey, number>;
  const today = new Date();
  const cutoff = today.getTime() - days * 24 * 60 * 60 * 1000;
  for (const entry of entries) {
    const entryTime = new Date(entry.date).getTime();
    if (entryTime >= cutoff) {
      counts[entry.mood_key] = (counts[entry.mood_key] ?? 0) + 1;
    }
  }
  return counts;
}

export function computeStats(
  entries: Entry[],
  referenceDate: string,
  customOrder: MoodKey[] = []
): InsightStats {
  return {
    total: entries.length,
    streak: computeStreak(entries, referenceDate),
    longestStreak: computeLongestStreak(entries),
    mostCommonMood: computeMostCommonMood(entries, customOrder),
    recentCounts: computeRecentCounts(entries, 30, customOrder),
  };
}
