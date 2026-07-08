import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { getEntriesForMonth } from '@/lib/database';
import { formatMonthYear, getDaysInMonth, getFirstWeekday, todayString, toDateString } from '@/lib/date';
import { MOODS } from '@/lib/moods';
import type { Entry } from '@/lib/types';
import type { RelativePathString } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';

const WEEKDAYS = ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'];

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = todayString();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getEntriesForMonth(year, month);
    const map: Record<string, Entry> = {};
    for (const entry of data) {
      map[entry.date] = entry;
    }
    setEntries(map);
    setLoading(false);
  }, [year, month]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const cells: (number | null)[] = Array(firstWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const totalCells = Math.ceil(cells.length / 7) * 7;
  while (cells.length < totalCells) cells.push(null);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const date = toDateString(new Date(year, month, day));
    if (entries[date]) {
      router.push(`/entry/${date}` as RelativePathString);
    }
  };

  const hasAnyEntries = Object.keys(entries).length > 0;

  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic">
      <View style={{ paddingTop: insets.top }} className="px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">التقويم</Text>
        <Text className="text-sm text-muted-foreground">اضغط على يوم مُلون لعرض التسجيل.</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      ) : !hasAnyEntries ? (
        <EmptyState
          title="لا توجد تسجيلات بعد"
          description="سيتم ملء التقويم مع تسجيلك اليومي."
        />
      ) : (
        <View className="px-4 gap-4 pb-8">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={handlePrevMonth} className="p-2 rounded-full active:bg-accent">
              <ChevronLeft size={24} className="text-foreground" />
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">
              {formatMonthYear(year, month)}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-2 rounded-full active:bg-accent">
              <ChevronRight size={24} className="text-foreground" />
            </Pressable>
          </View>

          <View className="flex-row justify-between px-1">
            {WEEKDAYS.map((d, i) => (
              <Text key={i} className="w-10 text-center text-sm text-muted-foreground font-medium">
                {d}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap gap-y-2">
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} className="w-10 h-10 mx-auto" />;
              }
              const date = toDateString(new Date(year, month, day));
              const entry = entries[date];
              const isToday = date === today;
              const color = MOODS[entry?.mood_key ?? '']?.colorHex ?? '#E2E8F0';
              return (
                <Pressable
                  key={day}
                  disabled={!entry}
                  onPress={() => handleDayPress(day)}
                  className={`
                    w-10 h-10 mx-auto rounded-lg items-center justify-center
                    active:opacity-70
                    ${isToday && !entry ? 'border border-primary' : ''}
                    ${isToday && entry ? 'border-2 border-foreground' : ''}
                  `}
                  style={{ backgroundColor: entry ? color : '#F1F5F9' }}
                >
                  <Text
                    className={`text-sm font-medium ${entry ? 'text-white' : 'text-muted-foreground'}`}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
