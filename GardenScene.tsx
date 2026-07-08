import { Pressable, View } from 'react-native';
import type { Entry } from '@/lib/types';
import { MOODS } from '@/lib/moods';
import { GARDEN_THEMES, type GardenThemeKey } from '@/lib/garden-themes';
import { FlowerRose } from './FlowerRose';

interface GardenSceneProps {
  entries: Entry[];
  onRosePress: (entry: Entry) => void;
  theme?: GardenThemeKey;
}

function Rose({ entry, onPress }: { entry: Entry; onPress: () => void }) {
  const mood = MOODS[entry.mood_key];
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`وردة ${mood?.label ?? entry.mood_key} في ${entry.date}`}
      className="absolute items-center active:opacity-80"
      style={{ left: `${entry.pos_x}%`, top: `${entry.pos_y}%`, transform: [{ translateX: -20 }, { translateY: -20 }] }}
    >
      {/* Stem */}
      <View className="w-0.5 h-10 bg-emerald-700/60 absolute top-5" />
      {/* Leaves */}
      <View className="absolute top-9 -left-3 w-3 h-1.5 bg-emerald-600/60 rounded-full rotate-[-30deg]" />
      <View className="absolute top-11 left-2 w-3 h-1.5 bg-emerald-600/60 rounded-full rotate-[30deg]" />
      {/* Flower head */}
      <FlowerRose moodKey={entry.mood_key} size={40} animated />
    </Pressable>
  );
}

export function GardenScene({ entries, onRosePress, theme = 'default' }: GardenSceneProps) {
  const t = GARDEN_THEMES[theme];
  const isDark = theme === 'night';
  return (
    <View className="w-full h-[420px] rounded-3xl overflow-hidden relative border border-border">
      {/* Sky */}
      <View className="absolute inset-0" style={{ backgroundColor: isDark ? t.skyDark : t.skyLight }} />
      <View
        className="absolute top-8 right-8 w-12 h-12 rounded-full"
        style={{ backgroundColor: t.accent, opacity: isDark ? 0.6 : 0.85 }}
      />
      <View className="absolute top-16 left-12 w-16 h-6 rounded-full bg-white/60 dark:bg-white/20" />
      <View className="absolute top-10 left-28 w-10 h-4 rounded-full bg-white/40 dark:bg-white/10" />

      {/* Grass */}
      <View
        className="absolute bottom-0 left-0 right-0 h-[45%] rounded-t-[60px]"
        style={{ backgroundColor: isDark ? t.grassDark : t.grassLight }}
      />
      <View
        className="absolute bottom-0 left-0 right-0 h-[42%] rounded-t-[48px]"
        style={{ backgroundColor: isDark ? t.grassDark : t.grassLight, opacity: 0.85 }}
      />

      {/* Roses */}
      {entries.map((entry) => (
        <Rose key={entry.date} entry={entry} onPress={() => onRosePress(entry)} />
      ))}
    </View>
  );
}
