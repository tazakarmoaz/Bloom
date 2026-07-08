import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { getAllEntries } from '@/lib/database';
import { todayString, parseDateString, formatDateDisplay, toDateString } from '@/lib/date';
import { MOODS } from '@/lib/moods';
import type { Entry } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { MoodCircle } from '@/components/MoodIcon';

type Range = 'week' | 'month' | 'year';

function sameDayDates(reference: string, range: Range): string[] {
  const date = parseDateString(reference);
  const results: string[] = [];
  const count = range === 'week' ? 1 : range === 'month' ? 4 : 12;
  const step = range === 'week' ? 7 : range === 'month' ? 28 : 364;
  for (let i = 1; i <= count; i++) {
    const previous = new Date(date);
    previous.setDate(previous.getDate() - i * step);
    results.push(toDateString(previous));
  }
  return results;
}

export default function MemoriesScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('week');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllEntries();
    const dates = sameDayDates(todayString(), range);
    const found = all.filter((e) => dates.includes(e.date));
    setEntries(found);
    setLoading(false);
  }, [range]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 gap-1">
        <Text className="text-2xl font-bold text-foreground">في مثل هذا اليوم</Text>
        <Text className="text-sm text-muted-foreground">استرجع ما كتبته في نفس هذا اليوم من قبل.</Text>
      </View>

      <View className="px-4 pb-3 flex-row gap-2">
        {(['week', 'month', 'year'] as Range[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            className={`flex-1 py-2 rounded-xl items-center ${range === r ? 'bg-primary' : 'bg-secondary'}`}
          >
            <Text className={range === r ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
              {r === 'week' ? 'الأسبوع' : r === 'month' ? 'الشهر' : 'السنة'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerClassName="p-4 gap-3"
        contentInsetAdjustmentBehavior="automatic"
      >
        {entries.length === 0 ? (
          <EmptyState title="لا توجد ذكريات" description="سيتم عرض تسجيلاتك السابقة في نفس هذا اليوم حين تتوفر." />
        ) : (
          entries.map((entry) => (
            <Card key={entry.date} className="gap-3 p-4">
              <View className="flex-row items-center gap-3">
                <MoodCircle moodKey={entry.mood_key} size={44} iconSize={22} />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{formatDateDisplay(entry.date)}</Text>
                  <Text className="text-sm text-muted-foreground">{MOODS[entry.mood_key]?.label ?? entry.mood_key}</Text>
                </View>
              </View>
              <View className="gap-1">
                <Text className="text-sm text-muted-foreground">{entry.prompt}</Text>
                {entry.note ? <Text className="text-base text-foreground leading-relaxed">{entry.note}</Text> : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
