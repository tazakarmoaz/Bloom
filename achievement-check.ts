import {
  getAllEntries,
  getGardens,
  getFavoriteEntries,
  getCustomPrompts,
  getCustomMoods,
  unlockAchievement,
} from './database';
import { checkAchievements } from './achievements';
import { computeStats } from './stats';
import { todayString } from './date';
import { isGardenFull } from './garden';

export async function refreshAchievements(): Promise<string[]> {
  const [entries, gardens, favorites, customPrompts, customMoods] = await Promise.all([
    getAllEntries(),
    getGardens(),
    getFavoriteEntries(),
    getCustomPrompts(),
    getCustomMoods(),
  ]);

  const uniqueMoods = new Set(entries.map((e) => e.mood_key));
  const photoCount = entries.filter((e) => e.image_uri).length;
  const noteCount = entries.filter((e) => e.note && e.note.trim().length > 0).length;
  const longNoteCount = entries.filter((e) => e.note && e.note.trim().length > 200).length;
  const stats = computeStats(entries, todayString(), customMoods.map((m) => m.key));

  const hasFullGarden = gardens.some((g) =>
    isGardenFull(entries.filter((e) => e.garden_id === g.id))
  );

  // Weekend entries: day-of-week 0 = Sunday, 6 = Saturday
  const weekendEntryCount = entries.filter((e) => {
    const d = new Date(e.date).getDay();
    return d === 0 || d === 6;
  }).length;

  // First-week entries: within first 7 days after the earliest entry
  let firstWeekCount = 0;
  if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const start = new Date(sorted[0].date).getTime();
    firstWeekCount = sorted.filter((e) => new Date(e.date).getTime() - start < 7 * 86400000).length;
  }

  const keys = checkAchievements({
    total: entries.length,
    streak: stats.streak,
    uniqueMoods,
    gardenCount: gardens.length,
    favoriteCount: favorites.length,
    photoCount,
    customPromptCount: customPrompts.length,
    customMoodCount: customMoods.length,
    noteCount,
    longNoteCount,
    hasFullGarden,
    weekendEntryCount,
    firstWeekCount,
  });

  for (const key of keys) {
    await unlockAchievement(key);
  }
  return keys;
}
