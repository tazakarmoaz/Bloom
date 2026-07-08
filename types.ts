export type BuiltInMoodKey =
  | 'sunny'
  | 'bright'
  | 'calm'
  | 'grateful'
  | 'energized'
  | 'motivated'
  | 'uneasy'
  | 'heavy'
  | 'tired'
  | 'sad'
  | 'peaceful'
  | 'focused'
  | 'creative'
  | 'confused'
  | 'hopeful'
  | 'proud'
  | 'playful'
  | 'longing'
  | 'overwhelmed'
  | 'content'
  | 'curious'
  | 'brave';
export type MoodKey = BuiltInMoodKey | string;

export type FlowerShape = 'bloom' | 'bud' | 'droopy' | 'star' | 'leafy';

export interface Mood {
  key: MoodKey;
  label: string;
  icon: string;
  colorClass: string;
  colorHex: string;
  flower?: FlowerShape;
  isCustom?: boolean;
}

export interface Entry {
  id: number;
  date: string;
  mood_key: MoodKey;
  note: string | null;
  prompt: string;
  garden_id: number;
  pos_x: number;
  pos_y: number;
  is_favorite: number;
  image_uri: string | null;
  created_at: string;
}

export interface Garden {
  id: number;
  name: string;
  created_at: string;
  is_active: number;
}

export interface Achievement {
  id: number;
  key: string;
  unlocked_at: string;
}

export interface CustomPrompt {
  id: number;
  text: string;
  created_at: string;
}

export interface CustomMoodRecord {
  id: number;
  key: string;
  label: string;
  color_hex: string;
  icon_name: string;
  created_at: string;
}

export interface InsightStats {
  total: number;
  streak: number;
  longestStreak: number;
  mostCommonMood: MoodKey | null;
  recentCounts: Record<MoodKey, number>;
}
