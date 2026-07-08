import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { getAllEntries, getCustomMoods, resetDatabase } from '@/lib/database';
import { todayString } from '@/lib/date';
import { MOODS, MOOD_ORDER } from '@/lib/moods';
import { computeStats } from '@/lib/stats';
import type { Entry, InsightStats, MoodKey } from '@/lib/types';
import { MoodIcon, MoodCircle } from '@/components/MoodIcon';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="flex-1 items-center justify-center gap-1 min-h-[100px]">
      <Text className="text-3xl font-bold text-foreground">{value}</Text>
      <Text className="text-sm text-muted-foreground text-center">{label}</Text>
    </Card>
  );
}

/** Returns last N weeks of dates as YYYY-MM-DD arrays, newest first */
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();
}

function predictNextMood(entries: Entry[], keys: MoodKey[]): MoodKey | null {
  const cutoff = todayString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const last7 = entries.filter((e) => e.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
  if (!last7.length) return null;
  const counts: Record<string, number> = {};
  for (const e of last7) counts[e.mood_key] = (counts[e.mood_key] ?? 0) + 1;
  let best: MoodKey | null = null;
  let bestCount = 0;
  for (const key of keys) {
    const c = counts[key] ?? 0;
    if (c > bestCount) { best = key; bestCount = c; }
  }
  return best;
}

/** Weekly trend: mood counts per day for last 7 days */
function computeWeeklyTrend(entries: Entry[]): { date: string; moodKey: MoodKey | null }[] {
  const days = getLast7Days();
  const map: Record<string, MoodKey> = {};
  for (const e of entries) map[e.date] = e.mood_key;
  return days.map((date) => ({ date, moodKey: map[date] ?? null }));
}

const AR_DAYS = ['أحد', 'إث', 'ثل', 'أرب', 'خم', 'جم', 'سب'];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [customMoodKeys, setCustomMoodKeys] = useState<MoodKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [data, custom] = await Promise.all([getAllEntries(), getCustomMoods()]);
      const keys = custom.map((m) => m.key);
      setEntries(data);
      setStats(computeStats(data, todayString(), keys));
      setCustomMoodKeys(keys);
    } catch (e) {
      setError('تعذر تحميل الإحصائيات. حاول مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-muted-foreground mt-4">جاري تحميل الرؤى...</Text>
      </View>
    );
  }

  if (error) {
    const handleReset = async () => { await resetDatabase(); load(); };
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <ErrorState title="خطأ في التحميل" message={error} onRetry={() => load()} onReset={handleReset} />
      </View>
    );
  }

  if (!entries.length || !stats) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-4 py-3">
          <Text className="text-2xl font-bold text-foreground">الرؤى</Text>
        </View>
        <EmptyState
          title="لا توجد بيانات بعد"
          description="سجّل بضعة أيام لرؤية أنماط مزاجك."
        />
      </View>
    );
  }

  const allKeys: MoodKey[] = [...MOOD_ORDER, ...customMoodKeys];
  const maxRecent = Math.max(1, ...allKeys.map((k) => stats.recentCounts[k] ?? 0));
  const predicted = predictNextMood(entries, allKeys);
  const weeklyTrend = computeWeeklyTrend(entries);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">الرؤى</Text>
        <Text className="text-sm text-muted-foreground">نظرة على رحلة التأمل الخاصة بك.</Text>
      </View>
      <ScrollView
        contentContainerClassName="p-4 gap-4"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* إحصائيات عامة */}
        <View className="flex-row gap-3">
          <StatCard label="السلسلة الحالية" value={stats.streak} />
          <StatCard label="إجمالي التسجيلات" value={stats.total} />
          <StatCard label="أطول سلسلة" value={stats.longestStreak} />
        </View>

        {/* تتبع آخر 7 أيام */}
        <Card className="gap-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">آخر 7 أيام</Text>
          <View className="flex-row justify-between">
            {weeklyTrend.map(({ date, moodKey }) => {
              const color = moodKey ? (MOODS[moodKey]?.colorHex ?? '#94A3B8') : '#E2E8F0';
              const dayIndex = new Date(date).getDay();
              const dayLabel = AR_DAYS[dayIndex] ?? '';
              const isToday = date === todayString();
              return (
                <View key={date} className="items-center gap-1.5" style={{ minWidth: 0, flex: 1 }}>
                  {/* مربع اللون */}
                  <View
                    className="rounded-lg border border-border/40"
                    style={{ width: 36, height: 36, backgroundColor: color, opacity: moodKey ? 1 : 0.3 }}
                  />
                  <Text className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text className="text-xs text-muted-foreground text-center">كل مربع = يوم واحد، اللون = المزاج</Text>
        </Card>

        {/* المزاج الأكثر شيوعًا */}
        <Card className="gap-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">المزاج الأكثر شيوعًا</Text>
          {stats.mostCommonMood ? (
            <View className="flex-row items-center gap-3">
              <MoodCircle moodKey={stats.mostCommonMood} size={48} iconSize={24} />
              <Text className="text-xl font-semibold text-foreground">
                {MOODS[stats.mostCommonMood]?.label ?? stats.mostCommonMood}
              </Text>
            </View>
          ) : (
            <Text className="text-base text-muted-foreground">لا توجد بيانات كافية</Text>
          )}
        </Card>

        {/* توقع المزاج */}
        <Card className="gap-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">توقع مزاج الغد</Text>
          {predicted ? (
            <View className="flex-row items-center gap-3">
              <MoodCircle moodKey={predicted} size={48} iconSize={24} />
              <View className="flex-1">
                <Text className="text-xl font-semibold text-foreground">{MOODS[predicted]?.label ?? predicted}</Text>
                <Text className="text-xs text-muted-foreground">بناءً على تسجيلات الأسبوع الماضي</Text>
              </View>
            </View>
          ) : (
            <Text className="text-base text-muted-foreground">سجّل المزيد لتفعيل التوقع</Text>
          )}
        </Card>

        {/* توزيع المزاجات (آخر 30 يومًا) */}
        <Card className="gap-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">توزيع المزاجات — آخر 30 يومًا</Text>
          <View className="gap-3">
            {allKeys
              .filter((k) => (stats.recentCounts[k] ?? 0) > 0)
              .sort((a, b) => (stats.recentCounts[b] ?? 0) - (stats.recentCounts[a] ?? 0))
              .map((key) => {
                const count = stats.recentCounts[key] ?? 0;
                const mood = MOODS[key];
                const pct = `${Math.round((count / maxRecent) * 100)}%`;
                return (
                  <View key={key} className="flex-row items-center gap-3">
                    <View className="w-8 items-center">
                      <MoodCircle moodKey={key} size={28} iconSize={14} />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-xs text-muted-foreground">{mood?.label ?? key}</Text>
                      <View className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{ width: pct as DimensionValue, backgroundColor: mood?.colorHex ?? '#94A3B8' }}
                        />
                      </View>
                    </View>
                    <Text className="w-6 text-right text-sm text-muted-foreground">{count}</Text>
                  </View>
                );
              })}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
