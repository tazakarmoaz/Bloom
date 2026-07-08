import {
  Sun, Star, Leaf, Heart, Flame, Zap, Sunrise, Sparkles,
  Target, Lightbulb, HelpCircle, Cloud, CloudRain, Moon,
  Award, Smile, Wind, AlertCircle, Coffee, Search, Shield,
} from 'lucide-react-native';
import type { Mood, MoodKey, FlowerShape } from './types';


export const MOODS: Record<MoodKey, Mood> = {
  sunny: {
    key: 'sunny',
    label: 'مشمس',
    icon: 'Sun',
    colorClass: 'bg-amber-300',
    colorHex: '#FCD34D',
    flower: 'star',
  },
  bright: {
    key: 'bright',
    label: 'مشرق',
    icon: 'Star',
    colorClass: 'bg-yellow-400',
    colorHex: '#FACC15',
    flower: 'star',
  },
  calm: {
    key: 'calm',
    label: 'هادئ',
    icon: 'Leaf',
    colorClass: 'bg-emerald-400',
    colorHex: '#34D399',
    flower: 'leafy',
  },
  grateful: {
    key: 'grateful',
    label: 'شاكر',
    icon: 'Heart',
    colorClass: 'bg-pink-400',
    colorHex: '#F472B6',
    flower: 'bloom',
  },
  energized: {
    key: 'energized',
    label: 'نشيط',
    icon: 'Flame',
    colorClass: 'bg-rose-400',
    colorHex: '#FB7185',
    flower: 'bloom',
  },
  motivated: {
    key: 'motivated',
    label: 'متحمس',
    icon: 'Zap',
    colorClass: 'bg-orange-400',
    colorHex: '#FB923C',
    flower: 'star',
  },
  hopeful: {
    key: 'hopeful',
    label: 'مأمول',
    icon: 'Sunrise',
    colorClass: 'bg-sky-300',
    colorHex: '#7DD3FC',
    flower: 'star',
  },
  peaceful: {
    key: 'peaceful',
    label: 'سلمي',
    icon: 'Sparkles',
    colorClass: 'bg-violet-300',
    colorHex: '#C4B5FD',
    flower: 'leafy',
  },
  focused: {
    key: 'focused',
    label: 'مركز',
    icon: 'Target',
    colorClass: 'bg-cyan-400',
    colorHex: '#22D3EE',
    flower: 'bloom',
  },
  creative: {
    key: 'creative',
    label: 'مبدع',
    icon: 'Lightbulb',
    colorClass: 'bg-fuchsia-400',
    colorHex: '#E879F9',
    flower: 'bloom',
  },
  uneasy: {
    key: 'uneasy',
    label: 'قلق',
    icon: 'Cloud',
    colorClass: 'bg-slate-400',
    colorHex: '#94A3B8',
    flower: 'bud',
  },
  confused: {
    key: 'confused',
    label: 'حائر',
    icon: 'HelpCircle',
    colorClass: 'bg-indigo-300',
    colorHex: '#A5B4FC',
    flower: 'bud',
  },
  heavy: {
    key: 'heavy',
    label: 'ثقيل',
    icon: 'CloudRain',
    colorClass: 'bg-teal-600',
    colorHex: '#0D9488',
    flower: 'droopy',
  },
  tired: {
    key: 'tired',
    label: 'متعب',
    icon: 'Moon',
    colorClass: 'bg-stone-400',
    colorHex: '#A8A29E',
    flower: 'bud',
  },
  sad: {
    key: 'sad',
    label: 'حزين',
    icon: 'CloudRain',
    colorClass: 'bg-blue-400',
    colorHex: '#60A5FA',
    flower: 'droopy',
  },
  proud: {
    key: 'proud',
    label: 'فخور',
    icon: 'Award',
    colorClass: 'bg-amber-500',
    colorHex: '#F59E0B',
    flower: 'star',
  },
  playful: {
    key: 'playful',
    label: 'مرح',
    icon: 'Smile',
    colorClass: 'bg-lime-400',
    colorHex: '#A3E635',
    flower: 'star',
  },
  longing: {
    key: 'longing',
    label: 'مشتاق',
    icon: 'Wind',
    colorClass: 'bg-rose-300',
    colorHex: '#FDA4AF',
    flower: 'droopy',
  },
  overwhelmed: {
    key: 'overwhelmed',
    label: 'مرهق',
    icon: 'AlertCircle',
    colorClass: 'bg-red-400',
    colorHex: '#F87171',
    flower: 'bud',
  },
  content: {
    key: 'content',
    label: 'مرتاح',
    icon: 'Coffee',
    colorClass: 'bg-orange-300',
    colorHex: '#FDBA74',
    flower: 'leafy',
  },
  curious: {
    key: 'curious',
    label: 'فضولي',
    icon: 'Search',
    colorClass: 'bg-teal-400',
    colorHex: '#2DD4BF',
    flower: 'bloom',
  },
  brave: {
    key: 'brave',
    label: 'شجاع',
    icon: 'Shield',
    colorClass: 'bg-yellow-500',
    colorHex: '#EAB308',
    flower: 'star',
  },
};

export const MOOD_ORDER: MoodKey[] = [
  'sunny', 'bright', 'hopeful', 'grateful', 'peaceful', 'calm',
  'focused', 'creative', 'energized', 'motivated', 'proud', 'playful',
  'content', 'curious', 'brave', 'uneasy', 'confused', 'overwhelmed',
  'longing', 'heavy', 'tired', 'sad',
];

export function moodFromCustom(record: {
  key: string;
  label: string;
  color_hex: string;
  icon_name: string;
  flower?: FlowerShape;
}): Mood {
  return {
    key: record.key,
    label: record.label,
    icon: record.icon_name,
    colorClass: '',
    colorHex: record.color_hex,
    flower: record.flower ?? 'bloom',
    isCustom: true,
  };
}
