import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, Sparkles, Volume2, RefreshCw } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  getEntryByDate,
  insertEntry,
  getMeta,
  setMeta,
  getCustomPrompts,
  getCustomMoods,
  getAllEntries,
  getActiveGarden,
  createGarden,
  setActiveGarden,
  resetDatabase,
  hasEntryAnyGarden,
} from '@/lib/database';
import { todayString, formatDateDisplay } from '@/lib/date';
import { getPromptForToday } from '@/lib/prompts';
import { getQuoteForToday } from '@/lib/quotes';
import { MOODS, MOOD_ORDER, moodFromCustom } from '@/lib/moods';
import { generateRosePosition, isGardenFull } from '@/lib/garden';
import { refreshAchievements } from '@/lib/achievement-check';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { speakText } from '@/lib/speech';
import type { Entry, MoodKey } from '@/lib/types';
import { MoodIcon, MoodCircle } from '@/components/MoodIcon';
import { ErrorState } from '@/components/ErrorState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const ONBOARDING_KEY = 'has_onboarded';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [quote, setQuote] = useState('');
  const [customMoodKeys, setCustomMoodKeys] = useState<MoodKey[]>([]);
  const [gardenFull, setGardenFull] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [createGardenOpen, setCreateGardenOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    let timeout: ReturnType<typeof setTimeout> | null = null;
    try {
      timeout = setTimeout(() => {
        setLoading(false);
        setError('التحميل استغرق وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى.');
      }, 8000);
      const [todayEntry, onboarded, customMoods, allEntries] = await Promise.all([
        getEntryByDate(todayString()),
        getMeta(ONBOARDING_KEY),
        getCustomMoods(),
        getAllEntries(),
      ]);
      if (timeout) clearTimeout(timeout);
      setEntry(todayEntry);
      setShowOnboarding(onboarded !== 'true');
      if (todayEntry) {
        setSelectedMood(todayEntry.mood_key);
        setNote(todayEntry.note ?? '');
        setImageUri(todayEntry.image_uri);
      } else {
        setSelectedMood(null);
        setNote('');
        setImageUri(null);
      }
      setCustomMoodKeys(customMoods.map((m) => m.key));
      for (const m of customMoods) {
        MOODS[m.key] = moodFromCustom(m);
      }
      setQuote(getQuoteForToday());
      setGardenFull(isGardenFull(allEntries));
    } catch (e) {
      if (timeout) clearTimeout(timeout);
      setError('تعذر تحميل بياناتك. تأكد من عدم وجود مشكلة في قاعدة البيانات.');
      setErrorDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStart = async () => {
    setShowOnboarding(false);
    await setMeta(ONBOARDING_KEY, 'true');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(manipulated.uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitError(null);
    setSaving(true);
    const today = todayString();
    const alreadyPlanted = await hasEntryAnyGarden(today);
    if (alreadyPlanted) {
      setSubmitError('لقد زرعت وردة اليوم بالفعل. يمكن زرع وردة واحدة فقط كل يوم.');
      setSaving(false);
      await load();
      return;
    }
    await hapticSuccess();
    const customPrompts = await getCustomPrompts();
    const prompt = entry?.prompt ?? getPromptForToday(customPrompts.map((p) => p.text));
    const position = entry
      ? { pos_x: entry.pos_x, pos_y: entry.pos_y }
      : generateRosePosition((await getAllEntries()).length);
    const activeGarden = await getActiveGarden();
    await insertEntry({
      date: today,
      mood_key: selectedMood,
      note,
      prompt,
      garden_id: activeGarden.id,
      pos_x: position.pos_x,
      pos_y: position.pos_y,
      image_uri: imageUri,
    });
    await refreshAchievements();
    await load();
    setSaving(false);
    router.replace('/garden');
  };

  const handleCreateGardenAndSave = async () => {
    if (!newGardenName.trim()) return;
    const today = todayString();
    if (await hasEntryAnyGarden(today)) {
      setSubmitError('لقد زرعت وردة اليوم بالفعل في حديقة أخرى.');
      setCreateGardenOpen(false);
      await load();
      return;
    }
    const id = await createGarden(newGardenName.trim());
    await setActiveGarden(id);
    setCreateGardenOpen(false);
    await handleSubmit();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-muted-foreground mt-4">جاري تحميل حديقتك...</Text>
      </View>
    );
  }

  if (error) {
    const handleReset = async () => {
      await resetDatabase();
      load();
    };
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <ErrorState
          title="خطأ في التحميل"
          message={error}
          details={errorDetail}
          onRetry={load}
          onReset={handleReset}
        />
      </View>
    );
  }

  const allMoods: MoodKey[] = [...MOOD_ORDER, ...customMoodKeys];

  if (showOnboarding) {
    return (
      <View
        className="flex-1 bg-background px-6 py-8 justify-center gap-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="items-center gap-4">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
            <MoodIcon moodKey="calm" size={40} color="#ffffff" />
          </View>
          <Text className="text-3xl font-bold text-foreground text-center">Daily Bloom</Text>
          <Text className="text-base text-muted-foreground text-center leading-relaxed">
            مساحة هادئة للتأمل مرة واحدة يوميًا. كل تسجيل يزرع وردة في حديقتك الخاصة،
            لتشاهد رحلتك العاطفية تنمو مع الوقت.
          </Text>
        </View>
        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
              <Text className="text-sm font-semibold text-secondary-foreground">1</Text>
            </View>
            <Text className="flex-1 text-base text-foreground leading-relaxed">
              أجب على سؤال لطيف عن يومك.
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
              <Text className="text-sm font-semibold text-secondary-foreground">2</Text>
            </View>
            <Text className="flex-1 text-base text-foreground leading-relaxed">
              اختر المزاج الذي يعكس شعورك.
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
              <Text className="text-sm font-semibold text-secondary-foreground">3</Text>
            </View>
            <Text className="flex-1 text-base text-foreground leading-relaxed">
              ازرع وردتك وزر حديقتك في أي وقت.
            </Text>
          </View>
        </View>
        <Button onPress={handleStart} className="rounded-xl h-14">
          <Text className="text-primary-foreground text-lg font-semibold">ابدأ الزراعة</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-background"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center py-2 gap-1">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide">
            {formatDateDisplay(todayString())}
          </Text>
          <View className="flex-row items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <Text className="text-sm text-primary text-center leading-relaxed flex-1">{quote}</Text>
            <Pressable
              onPress={() => speakText(quote)}
              accessibilityLabel="قراءة الاقتباس بصوت عالٍ"
              className="p-2 rounded-full active:opacity-70"
            >
              <Volume2 size={18} className="text-primary" />
            </Pressable>
          </View>
        </View>

        {entry ? (
          <>
            <Card className="gap-4 border-primary/20">
              <View className="items-center gap-2">
                <MoodCircle moodKey={entry.mood_key} size={64} iconSize={32} />
                <Text className="text-2xl font-semibold text-foreground">
                  {MOODS[entry.mood_key]?.label ?? entry.mood_key}
                </Text>
                <Text className="text-sm text-muted-foreground">تم الزراعة اليوم</Text>
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
              <Image source={{ uri: entry.image_uri }} className="w-full h-48 rounded-2xl" resizeMode="cover" />
            ) : null}
          </>
        ) : (
          <>
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground uppercase tracking-wide">
                  سؤال اليوم
                </Text>
                <Pressable
                  onPress={() => { setSelectedMood(null); setNote(''); setImageUri(null); }}
                  accessibilityLabel="سؤال جديد"
                  className="p-1 rounded-full active:opacity-70"
                >
                  <RefreshCw size={16} className="text-muted-foreground" />
                </Pressable>
              </View>
              <Text className="text-2xl font-semibold text-foreground leading-snug">
                {getPromptForToday()}
              </Text>
            </Card>

            <View className="gap-3">
              <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">
                كيف تشعر؟
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-1">
                {allMoods.map((key) => {
                  const mood = MOODS[key];
                  const isSelected = selectedMood === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => { setSelectedMood(key); hapticLight(); }}
                      className={`
                        items-center justify-center gap-2 p-3 rounded-2xl border min-w-[80px]
                        ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}
                        active:opacity-70
                      `}
                    >
                      <MoodCircle moodKey={key} size={40} iconSize={20} />
                      <Text className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {mood?.label ?? key}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="gap-3">
              <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">
                ملاحظة قصيرة
              </Text>
              <Textarea
                value={note}
                onChangeText={setNote}
                placeholder="تأمل اختياري..."
                className="min-h-[120px]"
              />
            </View>

            <View className="gap-3">
              <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">صورة (اختياري)</Text>
              {imageUri ? (
                <View className="relative">
                  <Image source={{ uri: imageUri }} className="w-full h-48 rounded-2xl" resizeMode="cover" />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-sm">×</Text>
                  </Pressable>
                </View>
              ) : (
                <Button variant="outline" onPress={handlePickImage} className="rounded-xl h-12">
                  <Camera size={18} className="text-muted-foreground" />
                  <Text className="text-foreground text-sm font-medium mr-2">إرفاق صورة</Text>
                </Button>
              )}
            </View>

            {submitError ? (
              <Text className="text-sm text-destructive text-center">{submitError}</Text>
            ) : null}

            {gardenFull ? (
              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 gap-3">
                <Text className="text-base text-foreground text-center">الحديقة الحالية امتلأت. افتح حديقة جديدة للزراعة.</Text>
                <Button onPress={() => setCreateGardenOpen(true)} className="rounded-xl">
                  <Text className="text-primary-foreground font-semibold">حديقة جديدة</Text>
                </Button>
              </Card>
            ) : (
              <Button
                onPress={handleSubmit}
                disabled={!selectedMood || saving}
                className="rounded-xl h-14"
              >
                <Text className="text-primary-foreground text-lg font-semibold">
                  {saving ? 'جاري الزراعة...' : 'ازرع اليوم'}
                </Text>
              </Button>
            )}
          </>
        )}
      </ScrollView>

      <Dialog open={createGardenOpen} onOpenChange={setCreateGardenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حديقة جديدة</DialogTitle>
            <DialogDescription>الحديقة الحالية امتلأت. سمِّ حديقتك الجديدة.</DialogDescription>
          </DialogHeader>
          <Input
            value={newGardenName}
            onChangeText={setNewGardenName}
            placeholder="مثال: حديقة الربيع"
            className="my-2"
          />
          <DialogFooter>
            <Button variant="outline" onPress={() => setCreateGardenOpen(false)} className="rounded-xl">
              <Text className="text-foreground">إلغاء</Text>
            </Button>
            <Button onPress={handleCreateGardenAndSave} disabled={!newGardenName.trim()} className="rounded-xl">
              <Text className="text-primary-foreground">زراعة</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </KeyboardAvoidingView>
  );
}
