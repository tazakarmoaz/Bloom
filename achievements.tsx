import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Trophy, Sprout, Flame, Flower2, Palette, Map, Heart, Camera, MessageSquare, Smile } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { getAchievements } from '@/lib/database';
import { ACHIEVEMENTS } from '@/lib/achievements';
import type { Achievement } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Lock,
  Trophy,
  Sprout,
  Flame,
  Flower2,
  Palette,
  Map,
  Heart,
  Camera,
  MessageSquare,
  Smile,
};

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await getAchievements();
    setUnlocked(new Set(rows.map((a) => a.key)));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">الإنجازات</Text>
        <Text className="text-sm text-muted-foreground">
          {unlocked.size} من {ACHIEVEMENTS.length} مكتسبة
        </Text>
      </View>
      <ScrollView
        contentContainerClassName="p-4 gap-3"
        contentInsetAdjustmentBehavior="automatic"
      >
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.has(ach.key);
          const Icon = ICONS[ach.icon] ?? Trophy;
          return (
            <Card
              key={ach.key}
              className={cn(
                'flex-row items-center gap-4 p-4',
                isUnlocked ? 'border-primary/30 bg-primary/5' : 'opacity-60'
              )}
            >
              <View
                className={cn(
                  'w-12 h-12 rounded-full items-center justify-center',
                  isUnlocked ? 'bg-primary' : 'bg-muted'
                )}
              >
                <Icon size={24} color={isUnlocked ? '#ffffff' : '#94A3B8'} />
              </View>
              <View className="flex-1 gap-1">
                <Text className={cn('text-base font-semibold', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
                  {ach.label}
                </Text>
                <Text className="text-sm text-muted-foreground">{ach.description}</Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
