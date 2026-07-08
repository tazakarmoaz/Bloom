import * as SQLite from 'expo-sqlite';
import type { Entry, Garden, Achievement, CustomPrompt, CustomMoodRecord, MoodKey } from './types';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbOpening: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (dbOpening) return dbOpening;
  dbOpening = SQLite.openDatabaseAsync('dailybloom.db').then(async (db) => {
    await migrate(db);
    dbInstance = db;
    dbOpening = null;
    return db;
  }).catch((e) => {
    dbOpening = null;
    throw e;
  });
  return dbOpening;
}

export async function resetDatabase() {
  try {
    await SQLite.deleteDatabaseAsync('dailybloom.db');
  } catch {
    // ignore if file does not exist
  }
  dbInstance = null;
  dbOpening = null;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  const versionRow = await db.getAllAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = 'schema_version' LIMIT 1"
  );
  const version = Number(versionRow[0]?.value ?? '0');

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        mood_key TEXT NOT NULL,
        note TEXT,
        prompt TEXT NOT NULL,
        garden_id INTEGER NOT NULL DEFAULT 1,
        pos_x REAL NOT NULL DEFAULT 0,
        pos_y REAL NOT NULL DEFAULT 0,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        image_uri TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS gardens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        unlocked_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS custom_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS custom_moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        flower TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT OR IGNORE INTO gardens (id, name, is_active) VALUES (1, 'الحديقة الأولى', 1);
    `);
  } else if (version < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS gardens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        unlocked_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS custom_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS custom_moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        flower TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT OR IGNORE INTO gardens (id, name, is_active) VALUES (1, 'الحديقة الأولى', 1);
      ALTER TABLE entries ADD COLUMN garden_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE entries ADD COLUMN pos_x REAL NOT NULL DEFAULT 0;
      ALTER TABLE entries ADD COLUMN pos_y REAL NOT NULL DEFAULT 0;
      ALTER TABLE entries ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE entries ADD COLUMN image_uri TEXT;
    `);
  }

  if (version < 3) {
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(custom_moods);`);
    const hasFlower = columns.some((c) => c.name === 'flower');
    if (!hasFlower) {
      await db.execAsync(`ALTER TABLE custom_moods ADD COLUMN flower TEXT;`);
    }
  }

  await db.execAsync(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_date_garden
    ON entries (date, garden_id);
  `);

  await db.runAsync('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', ['schema_version', '3']);
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM app_meta WHERE key = ? LIMIT 1', [key]);
  return rows[0]?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', [key, value]);
}

// Gardens
export async function getGardens(): Promise<Garden[]> {
  const db = await getDb();
  return db.getAllAsync<Garden>('SELECT * FROM gardens ORDER BY id ASC');
}

export async function getActiveGarden(): Promise<Garden> {
  const db = await getDb();
  const rows = await db.getAllAsync<Garden>('SELECT * FROM gardens WHERE is_active = 1 LIMIT 1');
  if (rows[0]) return rows[0];
  await db.runAsync("INSERT OR IGNORE INTO gardens (id, name, is_active) VALUES (1, 'الحديقة الأولى', 1)");
  const fallback = await db.getAllAsync<Garden>('SELECT * FROM gardens WHERE id = 1 LIMIT 1');
  return fallback[0]!;
}

export async function setActiveGarden(id: number): Promise<void> {
  const db = await getDb();
  await db.execAsync('UPDATE gardens SET is_active = 0');
  await db.runAsync('UPDATE gardens SET is_active = 1 WHERE id = ?', [id]);
}

export async function createGarden(name: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync('INSERT INTO gardens (name, is_active) VALUES (?, 0)', [name]);
  return result.lastInsertRowId as number;
}

export async function deleteGarden(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM entries WHERE garden_id = ?', [id]);
  await db.runAsync('DELETE FROM gardens WHERE id = ?', [id]);
  const active = await db.getAllAsync<Garden>('SELECT * FROM gardens WHERE is_active = 1 LIMIT 1');
  if (!active[0]) {
    const first = await db.getAllAsync<Garden>('SELECT * FROM gardens ORDER BY id ASC LIMIT 1');
    if (first[0]) {
      await setActiveGarden(first[0].id);
    } else {
      await createGarden('الحديقة الأولى');
      const newGarden = await db.getAllAsync<Garden>('SELECT * FROM gardens ORDER BY id DESC LIMIT 1');
      await setActiveGarden(newGarden[0]!.id);
    }
  }
}

// Entries
export async function getAllEntries(gardenId?: number): Promise<Entry[]> {
  const db = await getDb();
  const active = gardenId ?? (await getActiveGarden()).id;
  return db.getAllAsync<Entry>('SELECT * FROM entries WHERE garden_id = ? ORDER BY date DESC', [active]);
}

export async function getEntryByDate(date: string, gardenId?: number): Promise<Entry | null> {
  const db = await getDb();
  const active = gardenId ?? (await getActiveGarden()).id;
  const rows = await db.getAllAsync<Entry>('SELECT * FROM entries WHERE date = ? AND garden_id = ? LIMIT 1', [
    date,
    active,
  ]);
  return rows[0] ?? null;
}

export async function hasEntryAnyGarden(date: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM entries WHERE date = ?', [
    date,
  ]);
  return (rows[0]?.count ?? 0) > 0;
}

export async function getEntriesForMonth(year: number, month: number, gardenId?: number): Promise<Entry[]> {
  const db = await getDb();
  const active = gardenId ?? (await getActiveGarden()).id;
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const nextMonth = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`;
  return db.getAllAsync<Entry>(
    'SELECT * FROM entries WHERE date >= ? AND date < ? AND garden_id = ? ORDER BY date ASC',
    [start, nextMonth, active]
  );
}

export async function getEntryCount(gardenId?: number): Promise<number> {
  const db = await getDb();
  const active = gardenId ?? (await getActiveGarden()).id;
  const rows = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM entries WHERE garden_id = ?',
    [active]
  );
  return rows[0]?.count ?? 0;
}

export async function insertEntry(entry: {
  date: string;
  mood_key: MoodKey;
  note?: string;
  prompt: string;
  garden_id?: number;
  pos_x?: number;
  pos_y?: number;
  image_uri?: string | null;
}): Promise<void> {
  const db = await getDb();
  const garden = entry.garden_id ?? (await getActiveGarden()).id;
  await db.runAsync(
    'INSERT OR REPLACE INTO entries (date, mood_key, note, prompt, garden_id, pos_x, pos_y, image_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      entry.date,
      entry.mood_key,
      entry.note ?? '',
      entry.prompt,
      garden,
      entry.pos_x ?? 0,
      entry.pos_y ?? 0,
      entry.image_uri ?? null,
    ]
  );
}

export async function updateEntry(entry: {
  date: string;
  mood_key: MoodKey;
  note?: string;
  image_uri?: string | null;
  gardenId?: number;
}): Promise<void> {
  const db = await getDb();
  const garden = entry.gardenId ?? (await getActiveGarden()).id;
  await db.runAsync(
    'UPDATE entries SET mood_key = ?, note = ?, image_uri = ? WHERE date = ? AND garden_id = ?',
    [entry.mood_key, entry.note ?? '', entry.image_uri ?? null, entry.date, garden]
  );
}

export async function deleteEntry(date: string, gardenId?: number): Promise<void> {
  const db = await getDb();
  const garden = gardenId ?? (await getActiveGarden()).id;
  await db.runAsync('DELETE FROM entries WHERE date = ? AND garden_id = ?', [date, garden]);
}

export async function toggleFavorite(date: string, gardenId?: number): Promise<void> {
  const db = await getDb();
  const garden = gardenId ?? (await getActiveGarden()).id;
  await db.runAsync(
    'UPDATE entries SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE date = ? AND garden_id = ?',
    [date, garden]
  );
}

export async function searchEntries(query: string, gardenId?: number): Promise<Entry[]> {
  const db = await getDb();
  const garden = gardenId ?? (await getActiveGarden()).id;
  const like = `%${query}%`;
  return db.getAllAsync<Entry>(
    'SELECT * FROM entries WHERE garden_id = ? AND (note LIKE ? OR prompt LIKE ? OR date LIKE ?) ORDER BY date DESC',
    [garden, like, like, like]
  );
}

export async function getFavoriteEntries(gardenId?: number): Promise<Entry[]> {
  const db = await getDb();
  const garden = gardenId ?? (await getActiveGarden()).id;
  return db.getAllAsync<Entry>('SELECT * FROM entries WHERE garden_id = ? AND is_favorite = 1 ORDER BY date DESC', [
    garden,
  ]);
}

export async function getEntriesForDates(dates: string[], gardenId?: number): Promise<Entry[]> {
  const db = await getDb();
  if (!dates.length) return [];
  const garden = gardenId ?? (await getActiveGarden()).id;
  const placeholders = dates.map(() => '?').join(',');
  return db.getAllAsync<Entry>(
    `SELECT * FROM entries WHERE garden_id = ? AND date IN (${placeholders}) ORDER BY date DESC`,
    [garden, ...dates]
  );
}

export async function getEntriesBeforeDate(before: string, limit = 10): Promise<Entry[]> {
  const db = await getDb();
  return db.getAllAsync<Entry>(
    'SELECT * FROM entries WHERE date < ? ORDER BY date DESC LIMIT ?',
    [before, limit]
  );
}

export async function deleteAllEntries(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM entries; DELETE FROM gardens; DELETE FROM achievements; DELETE FROM custom_prompts; DELETE FROM custom_moods;');
  await db.execAsync("INSERT INTO gardens (id, name, is_active) VALUES (1, 'الحديقة الأولى', 1)");
}

// Achievements
export async function getAchievements(): Promise<Achievement[]> {
  const db = await getDb();
  return db.getAllAsync<Achievement>('SELECT * FROM achievements ORDER BY key ASC');
}

export async function unlockAchievement(key: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO achievements (key) VALUES (?)', [key]);
}

// Custom prompts
export async function getCustomPrompts(): Promise<CustomPrompt[]> {
  const db = await getDb();
  return db.getAllAsync<CustomPrompt>('SELECT * FROM custom_prompts ORDER BY id ASC');
}

export async function addCustomPrompt(text: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO custom_prompts (text) VALUES (?)', [text]);
}

export async function deleteCustomPrompt(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM custom_prompts WHERE id = ?', [id]);
}

// Custom moods
export async function getCustomMoods(): Promise<CustomMoodRecord[]> {
  const db = await getDb();
  return db.getAllAsync<CustomMoodRecord>('SELECT * FROM custom_moods ORDER BY id ASC');
}

export async function addCustomMood(record: {
  key: string;
  label: string;
  color_hex: string;
  icon_name: string;
  flower?: string;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO custom_moods (key, label, color_hex, icon_name, flower) VALUES (?, ?, ?, ?, ?)',
    [record.key, record.label, record.color_hex, record.icon_name, record.flower ?? 'bloom']
  );
}

export async function deleteCustomMood(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM custom_moods WHERE id = ?', [id]);
}
