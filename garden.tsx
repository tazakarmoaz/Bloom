import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, RefreshControl, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Heart, Share2, Plus, ChevronDown, FileText } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getAllEntries,
  getGardens,
  getActiveGarden,
  setActiveGarden,
  createGarden,
  deleteGarden,
  toggleFavorite,
  deleteEntry,
  searchEntries,
  getFavoriteEntries,
  getMeta,
  setMeta,
  resetDatabase,
} from '@/lib/database';
import { GARDEN_CAPACITY, isGardenFull } from '@/lib/garden';
import { GARDEN_THEMES, type GardenThemeKey } from '@/lib/garden-themes';
import { refreshAchievements } from '@/lib/achievement-check';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import type { Entry, Garden } from '@/lib/types';
import type { RelativePathString } from 'expo-router';
import { GardenScene } from '@/components/GardenScene';
import { RoseDetailModal } from '@/components/RoseDetailModal';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { formatDateDisplay } from '@/lib/date';
import { MOODS, MOOD_ORDER } from '@/lib/moods';
import type { MoodKey } from '@/lib/types';

export default function GardenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [activeGarden, setActiveGardenState] = useState<Garden | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [moodFilter, setMoodFilter] = useState<MoodKey | null>(null);
  const [theme, setTheme] = useState<GardenThemeKey>('default');
  const [newGardenName, setNewGardenName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showGardenList, setShowGardenList] = useState(false);
  const [showThemeList, setShowThemeList] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [data, gardenRows, current, savedTheme] = await Promise.all([
        getAllEntries(),
        getGardens(),
        getActiveGarden(),
        getMeta('garden_theme'),
      ]);
      setEntries(data);
      setGardens(gardenRows);
      setActiveGardenState(current);
      if (savedTheme && savedTheme in GARDEN_THEMES) {
        setTheme(savedTheme as GardenThemeKey);
      }
    } catch (e) {
      setError('تعذر تحميل الحديقة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleChangeTheme = async (key: GardenThemeKey) => {
    setTheme(key);
    setShowThemeList(false);
    await setMeta('garden_theme', key);
    await hapticLight();
  };

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
  }, [load]);

  const handleRosePress = async (entry: Entry) => {
    await hapticLight();
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (entry: Entry) => {
    await deleteEntry(entry.date);
    await refreshAchievements();
    await load();
    setModalOpen(false);
  };

  const handleEdit = (entry: Entry) => {
    setModalOpen(false);
    router.push(`/edit-entry?date=${entry.date}` as RelativePathString);
  };

  const handleToggleFavorite = async (entry: Entry) => {
    await toggleFavorite(entry.date);
    await refreshAchievements();
    await load();
    setSelectedEntry((prev) =>
      prev ? { ...prev, is_favorite: prev.is_favorite ? 0 : 1 } : prev
    );
  };

  const handleSwitchGarden = async (id: number) => {
    await setActiveGarden(id);
    await hapticLight();
    await load();
    setShowGardenList(false);
  };

  const handleCreateGarden = async () => {
    if (!newGardenName.trim()) return;
    if (!isGardenFull(entries)) {
      setCreateDialogOpen(false);
      return;
    }
    const id = await createGarden(newGardenName.trim());
    await setActiveGarden(id);
    await hapticSuccess();
    setNewGardenName('');
    setCreateDialogOpen(false);
    await load();
  };

  const handleExportJson = async () => {
    const data = await getAllEntries();
    const json = JSON.stringify(data, null, 2);
    await Clipboard.setStringAsync(json);
    await hapticSuccess();
  };

  const handleShareGarden = async () => {
    const gardenName = activeGarden?.name ?? 'حديقتي';
    const totalAll = entries.length;
    const moodCounts: Record<string, number> = {};
    for (const e of entries) {
      moodCounts[e.mood_key] = (moodCounts[e.mood_key] ?? 0) + 1;
    }
    const topMoodKey = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topMoodLabel = topMoodKey ? (MOODS[topMoodKey]?.label ?? topMoodKey) : '—';
    const favCount = entries.filter((e) => e.is_favorite).length;
    const message = [
      `🌸 حديقتي في Daily Bloom`,
      ``,
      `📍 الحديقة: ${gardenName}`,
      `🌺 إجمالي الوردات: ${totalAll}`,
      `❤️ المفضلة: ${favCount}`,
      `😊 المزاج الأكثر: ${topMoodLabel}`,
      ``,
      `ابدأ رحلتك في Daily Bloom واملأ حديقتك يومًا بعد يوم! 🌱`,
    ].join('\n');
    await hapticSuccess();
    await Share.share({ message });
  };

  const handleExportText = async () => {
    const data = await getAllEntries();
    const lines = data.map((e) => {
      const lines = [
        `التاريخ: ${formatDateDisplay(e.date)}`,
        `المزاج: ${MOODS[e.mood_key]?.label ?? e.mood_key}`,
        `السؤال: ${e.prompt}`,
      ];
      if (e.note) lines.push(`الملاحظة: ${e.note}`);
      return lines.join('\n');
    });
    const text = ['مذكراتي من Daily Bloom', '====================', ...lines].join('\n\n');
    await Clipboard.setStringAsync(text);
    await hapticSuccess();
  };

  const displayEntries = entries.filter((e) => {
    if (favoritesOnly && !e.is_favorite) return false;
    if (moodFilter && e.mood_key !== moodFilter) return false;
    if (!query) return true;
    const q = query.trim();
    return (
      e.note?.includes(q) ||
      e.prompt?.includes(q) ||
      e.date.includes(q) ||
      (MOODS[e.mood_key]?.label ?? e.mood_key).includes(q)
    );
  });

  const full = isGardenFull(entries);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-muted-foreground mt-4">جاري تحميل الحديقة...</Text>
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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 gap-1">
        <Text className="text-2xl font-bold text-foreground">حديقتي</Text>
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setShowGardenList(!showGardenList)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-base text-primary font-semibold">{activeGarden?.name}</Text>
            <ChevronDown size={16} className="text-primary" />
          </Pressable>
          <Pressable
            onPress={() => setShowThemeList(!showThemeList)}
            className="px-3 py-1 rounded-full bg-secondary active:opacity-70"
          >
            <Text className="text-sm text-secondary-foreground">سمة: {GARDEN_THEMES[theme].name}</Text>
          </Pressable>
          <Text className="text-sm text-muted-foreground">
            {entries.length} / {GARDEN_CAPACITY} وردة
          </Text>
        </View>
      </View>

      {showGardenList ? (
        <Card className="mx-4 mb-3 p-3 gap-2">
          {gardens.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => handleSwitchGarden(g.id)}
              className={`flex-row items-center justify-between p-3 rounded-xl ${g.is_active ? 'bg-primary/10' : 'bg-secondary'}`}
            >
              <Text className={`font-semibold ${g.is_active ? 'text-primary' : 'text-foreground'}`}>{g.name}</Text>
              {g.is_active ? <Text className="text-xs text-primary">نشطة</Text> : null}
            </Pressable>
          ))}
          {full ? (
            <Button variant="outline" onPress={() => { setShowGardenList(false); setCreateDialogOpen(true); }} className="rounded-xl">
              <Plus size={18} className="text-foreground" />
              <Text className="text-foreground text-sm font-medium mr-2">حديقة جديدة</Text>
            </Button>
          ) : (
            <View className="p-3 rounded-xl bg-muted">
              <Text className="text-sm text-muted-foreground text-center">
                املأ الحديقة الحالية أولاً ({GARDEN_CAPACITY} وردة) لفتح حديقة جديدة.
              </Text>
            </View>
          )}
        </Card>
      ) : null}

      {showThemeList ? (
        <Card className="mx-4 mb-3 p-3 gap-2">
          {(Object.keys(GARDEN_THEMES) as GardenThemeKey[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => handleChangeTheme(key)}
              className={`flex-row items-center justify-between p-3 rounded-xl ${theme === key ? 'bg-primary/10' : 'bg-secondary'}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: GARDEN_THEMES[key].skyLight }} />
                <Text className={`font-semibold ${theme === key ? 'text-primary' : 'text-foreground'}`}>{GARDEN_THEMES[key].name}</Text>
              </View>
              {theme === key ? <Text className="text-xs text-primary">مفعّل</Text> : null}
            </Pressable>
          ))}
        </Card>
      ) : null}

      <ScrollView
        contentContainerClassName="p-4 gap-4"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row gap-2">
          <View className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="بحث..."
              className="pl-10"
            />
          </View>
          <Pressable
            onPress={() => setFavoritesOnly(!favoritesOnly)}
            className={`w-11 h-10 rounded-xl border items-center justify-center ${favoritesOnly ? 'bg-primary/10 border-primary' : 'border-border bg-card'}`}
          >
            <Heart size={18} className={favoritesOnly ? 'text-primary' : 'text-muted-foreground'} fill={favoritesOnly ? 'currentColor' : 'none'} />
          </Pressable>
          <Pressable
            onPress={handleExportJson}
            className="w-11 h-10 rounded-xl border border-border bg-card items-center justify-center active:opacity-70"
            accessibilityLabel="تصدير JSON"
          >
            <Share2 size={18} className="text-muted-foreground" />
          </Pressable>
          <Pressable
            onPress={handleExportText}
            className="w-11 h-10 rounded-xl border border-border bg-card items-center justify-center active:opacity-70"
            accessibilityLabel="تصدير نصي"
          >
            <FileText size={18} className="text-muted-foreground" />
          </Pressable>
          <Pressable
            onPress={handleShareGarden}
            className="w-11 h-10 rounded-xl border border-primary bg-primary/10 items-center justify-center active:opacity-70"
            accessibilityLabel="مشاركة الحديقة"
          >
            <Share2 size={18} className="text-primary" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 pb-2"
        >
          <Pressable
            onPress={() => setMoodFilter(null)}
            className={`px-3 py-1.5 rounded-full border ${moodFilter === null ? 'bg-primary border-primary' : 'border-border bg-card'}`}
          >
            <Text className={`text-sm ${moodFilter === null ? 'text-primary-foreground' : 'text-foreground'}`}>الكل</Text>
          </Pressable>
          {MOOD_ORDER.map((key) => (
            <Pressable
              key={key}
              onPress={() => setMoodFilter(moodFilter === key ? null : key)}
              className={`px-3 py-1.5 rounded-full border ${moodFilter === key ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
            >
              <Text className="text-sm text-foreground">{MOODS[key]?.label ?? key}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {entries.length === 0 ? (
          <EmptyState title="حديقتك تنتظر" description="ازرع أول وردة من خلال التسجيل اليومي." />
        ) : (
          <GardenScene entries={displayEntries} onRosePress={handleRosePress} theme={theme} />
        )}

        <Card className="gap-2 p-4">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">إحصائيات الحديقة</Text>
          <View className="flex-row justify-between">
            <View className="items-center gap-1 flex-1">
              <Text className="text-2xl font-bold text-foreground">{entries.length}</Text>
              <Text className="text-xs text-muted-foreground">الورود</Text>
            </View>
            <View className="items-center gap-1 flex-1">
              <Text className="text-2xl font-bold text-foreground">{entries.filter((e) => e.is_favorite).length}</Text>
              <Text className="text-xs text-muted-foreground">المفضلة</Text>
            </View>
            <View className="items-center gap-1 flex-1">
              <Text className="text-2xl font-bold text-foreground">{new Set(entries.map((e) => e.mood_key)).size}</Text>
              <Text className="text-xs text-muted-foreground">مزاجات</Text>
            </View>
          </View>
        </Card>

        {full ? (
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <Text className="text-base text-foreground text-center mb-3">الحديقة امتلأت بالورود! هل تريد فتح حديقة جديدة؟</Text>
            <Button onPress={() => setCreateDialogOpen(true)} className="rounded-xl">
              <Plus size={18} color="#ffffff" />
              <Text className="text-primary-foreground font-semibold mr-2">افتح حديقة جديدة</Text>
            </Button>
          </Card>
        ) : null}
      </ScrollView>

      <RoseDetailModal
        entry={selectedEntry}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حديقة جديدة</DialogTitle>
            <DialogDescription>اختر اسمًا للحديقة الجديدة.</DialogDescription>
          </DialogHeader>
          <Input
            value={newGardenName}
            onChangeText={setNewGardenName}
            placeholder="مثال: حديقة الصيف"
            className="my-2"
          />
          <DialogFooter>
            <Button variant="outline" onPress={() => setCreateDialogOpen(false)} className="rounded-xl">
              <Text className="text-foreground">إلغاء</Text>
            </Button>
            <Button onPress={handleCreateGarden} disabled={!newGardenName.trim()} className="rounded-xl">
              <Text className="text-primary-foreground">إنشاء</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
