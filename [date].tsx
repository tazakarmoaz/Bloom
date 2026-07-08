import { useFocusEffect, useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, Pencil, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RelativePathString } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEntryByDate, toggleFavorite, deleteEntry } from '@/lib/database';
import { formatDateDisplay, formatDayName } from '@/lib/date';
import { MOODS } from '@/lib/moods';
import type { Entry } from '@/lib/types';
import { MoodCircle } from '@/components/MoodIcon';
import { refreshAchievements } from '@/lib/achievement-check';

export default function EntryDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState<Entry | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!date) return;
      getEntryByDate(date).then(setEntry);
    }, [date])
  );

  const handleFavorite = async () => {
    if (!entry) return;
    await toggleFavorite(entry.date);
    await refreshAchievements();
    const updated = await getEntryByDate(entry.date);
    setEntry(updated);
  };

  const handleDelete = async () => {
    if (!entry) return;
    await deleteEntry(entry.date);
    await refreshAchievements();
    router.back();
  };

  if (!date || !entry) {
    return <Redirect href={"/home" as RelativePathString} />;
  }

  const mood = MOODS[entry.mood_key];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="p-2 rounded-full active:bg-accent"
          hitSlop={12}
        >
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">تفاصيل التسجيل</Text>
      </View>

      <ScrollView
        contentContainerClassName="p-4 gap-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="items-center gap-2 py-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">
            {formatDayName(entry.date)}
          </Text>
          <Text className="text-2xl font-semibold text-foreground">
            {formatDateDisplay(entry.date)}
          </Text>
        </View>

        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <MoodCircle moodKey={entry.mood_key} size={56} iconSize={28} />
            <View>
              <Text className="text-xl font-semibold text-foreground">{mood?.label ?? entry.mood_key}</Text>
              <Text className="text-sm text-muted-foreground">مزاج اليوم</Text>
            </View>
          </View>
        </Card>

        <Card className="gap-2">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">السؤال</Text>
          <Text className="text-lg text-foreground leading-relaxed">{entry.prompt}</Text>
        </Card>

        {entry.note ? (
          <Card className="gap-2">
            <Text className="text-sm text-muted-foreground uppercase tracking-wide">الملاحظة</Text>
            <Text className="text-base text-foreground leading-relaxed">{entry.note}</Text>
          </Card>
        ) : null}

        {entry.image_uri ? (
          <Image source={{ uri: entry.image_uri }} className="w-full h-56 rounded-2xl" resizeMode="cover" />
        ) : null}

        <View className="flex-row gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onPress={handleFavorite}>
            <Heart size={18} className={entry.is_favorite ? 'text-destructive' : 'text-muted-foreground'} fill={entry.is_favorite ? 'currentColor' : 'none'} />
            <Text className="text-foreground text-sm font-medium mr-2">
              {entry.is_favorite ? 'مفضل' : 'تفضيل'}
            </Text>
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onPress={() => router.push(`/edit-entry?date=${entry.date}` as RelativePathString)}>
            <Pencil size={18} className="text-muted-foreground" />
            <Text className="text-foreground text-sm font-medium mr-2">تحرير</Text>
          </Button>
          <Button variant="destructive" className="flex-1 rounded-xl" onPress={handleDelete}>
            <Trash2 size={18} color="#ffffff" />
            <Text className="text-white text-sm font-medium mr-2">حذف</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
