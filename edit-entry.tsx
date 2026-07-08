import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getEntryByDate, updateEntry, getCustomMoods } from '@/lib/database';
import { MOODS, MOOD_ORDER } from '@/lib/moods';
import type { Entry, MoodKey } from '@/lib/types';
import { MoodCircle } from '@/components/MoodIcon';

export default function EditEntryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [customMoodKeys, setCustomMoodKeys] = useState<MoodKey[]>([]);

  useEffect(() => {
    async function load() {
      if (!date) return;
      const [found, custom] = await Promise.all([getEntryByDate(date), getCustomMoods()]);
      if (!found) {
        router.back();
        return;
      }
      setEntry(found);
      setSelectedMood(found.mood_key);
      setNote(found.note ?? '');
      setImageUri(found.image_uri);
      setCustomMoodKeys(custom.map((m) => m.key));
    }
    load();
  }, [date, router]);

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

  const handleSave = async () => {
    if (!entry || !selectedMood) return;
    await updateEntry({
      date: entry.date,
      mood_key: selectedMood,
      note,
      image_uri: imageUri,
    });
    router.back();
  };

  if (!entry) return null;

  const allMoods: MoodKey[] = [...MOOD_ORDER, ...customMoodKeys];

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
      <ScrollView contentContainerClassName="p-4 gap-6" contentInsetAdjustmentBehavior="automatic">
        <View className="flex-row items-center justify-between pt-2">
          <Text className="text-2xl font-bold text-foreground">تحرير التسجيل</Text>
          <Button variant="ghost" onPress={() => router.back()}>
            <X size={24} className="text-foreground" />
          </Button>
        </View>

        <View className="gap-3">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">المزاج</Text>
          <View className="flex-row flex-wrap gap-3">
            {allMoods.map((key) => {
              const mood = MOODS[key];
              const isSelected = selectedMood === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setSelectedMood(key)}
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
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">الملاحظة</Text>
          <Textarea value={note} onChangeText={setNote} placeholder="اكتب reflection..." className="min-h-[120px]" />
        </View>

        <View className="gap-3">
          <Text className="text-sm text-muted-foreground uppercase tracking-wide px-1">الصورة</Text>
          {imageUri ? (
            <View className="relative">
              <Image source={{ uri: imageUri }} className="w-full h-48 rounded-2xl" resizeMode="cover" />
              <Pressable
                onPress={() => setImageUri(null)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
              >
                <X size={16} color="#ffffff" />
              </Pressable>
            </View>
          ) : (
            <Button variant="outline" onPress={handlePickImage} className="rounded-xl h-12">
              <Camera size={18} className="text-muted-foreground" />
              <Text className="text-foreground text-sm font-medium mr-2">اختيار صورة</Text>
            </Button>
          )}
        </View>

        <Button onPress={handleSave} disabled={!selectedMood} className="rounded-xl h-14">
          <Text className="text-primary-foreground text-lg font-semibold">حفظ التعديلات</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
