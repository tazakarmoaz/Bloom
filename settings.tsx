import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Trash2, Info, Heart, Wind, MessageSquare, Smile, Plus, X, HelpCircle, RefreshCw } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  deleteAllEntries,
  setMeta,
  getCustomPrompts,
  addCustomPrompt,
  deleteCustomPrompt,
  getCustomMoods,
  addCustomMood,
  deleteCustomMood,
} from '@/lib/database';
import type { RelativePathString } from 'expo-router';

import { ColorPicker } from '@/components/ColorPicker';

const ICONS = ['Smile', 'Heart', 'Star', 'Zap', 'Sun', 'Moon', 'Cloud', 'Leaf'];
const FLOWERS = [
  { key: 'bloom', label: 'متفتحة' },
  { key: 'bud', label: 'برعم' },
  { key: 'droopy', label: 'متدلية' },
  { key: 'star', label: 'نجمة' },
  { key: 'leafy', label: 'ورقية' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [prompts, setPrompts] = useState<{ id: number; text: string }[]>([]);
  const [moodLabel, setMoodLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState('#F472B6');
  const [selectedFlower, setSelectedFlower] = useState('bloom');
  const [moods, setMoods] = useState<{ id: number; label: string; key: string }[]>([]);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showMoodDialog, setShowMoodDialog] = useState(false);

  const load = useCallback(async () => {
    const [p, m] = await Promise.all([getCustomPrompts(), getCustomMoods()]);
    setPrompts(p);
    setMoods(m);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleClear = async () => {
    await deleteAllEntries();
    await setMeta('has_onboarded', 'false');
    setOpen(false);
  };

  const handleAddPrompt = async () => {
    if (!promptText.trim()) return;
    await addCustomPrompt(promptText.trim());
    setPromptText('');
    setShowPromptDialog(false);
    await load();
  };

  const handleAddMood = async () => {
    if (!moodLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    await addCustomMood({
      key,
      label: moodLabel.trim(),
      color_hex: selectedColor,
      icon_name: selectedIcon,
      flower: selectedFlower,
    });
    setMoodLabel('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor('#F472B6');
    setSelectedFlower('bloom');
    setShowMoodDialog(false);
    await load();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">الإعدادات</Text>
      </View>
      <ScrollView
        contentContainerClassName="p-4 gap-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Card className="gap-2">
          <View className="flex-row items-center gap-2">
            <Info size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold text-foreground">عن Daily Bloom</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            مساحة تأمل شخصية. جميع بياناتك تبقى على جهازك. خذ دقيقة كل يوم لتلاحظ شعورك،
            وشاهد حديقتك تنمو.
          </Text>
        </Card>

        <Card className="gap-2">
          <View className="flex-row items-center gap-2">
            <Heart size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold text-foreground">صُنع للهدوء</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            لا حسابات، لا سحابة، لا إشعارات. فقط أنت وأفكارك.
          </Text>
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">أسئلة مخصصة</Text>
            <Button variant="outline" size="sm" onPress={() => setShowPromptDialog(true)} className="rounded-xl">
              <Plus size={16} className="text-foreground" />
            </Button>
          </View>
          {prompts.length === 0 ? (
            <Text className="text-sm text-muted-foreground">لا توجد أسئلة مخصصة بعد.</Text>
          ) : (
            <View className="gap-2">
              {prompts.map((p) => (
                <View key={p.id} className="flex-row items-center justify-between p-3 bg-secondary rounded-xl">
                  <Text className="flex-1 text-sm text-foreground leading-relaxed">{p.text}</Text>
                  <Pressable onPress={() => deleteCustomPrompt(p.id).then(load)} className="p-1 active:opacity-70">
                    <X size={16} className="text-destructive" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">مزاجات مخصصة</Text>
            <Button variant="outline" size="sm" onPress={() => setShowMoodDialog(true)} className="rounded-xl">
              <Plus size={16} className="text-foreground" />
            </Button>
          </View>
          {moods.length === 0 ? (
            <Text className="text-sm text-muted-foreground">لا توجد مزاجات مخصصة بعد.</Text>
          ) : (
            <View className="gap-2">
              {moods.map((m) => (
                <View key={m.id} className="flex-row items-center justify-between p-3 bg-secondary rounded-xl">
                  <Text className="text-sm text-foreground">{m.label}</Text>
                  <Pressable onPress={() => deleteCustomMood(m.id).then(load)} className="p-1 active:opacity-70">
                    <X size={16} className="text-destructive" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Button
          variant="outline"
          onPress={async () => {
            await setMeta('has_onboarded', 'false');
            router.replace('/home' as RelativePathString);
          }}
          className="rounded-xl h-12"
        >
          <HelpCircle size={18} className="text-foreground" />
          <Text className="text-foreground text-base font-semibold mr-2">إعادة عرض المقدمة</Text>
        </Button>

        <Button
          variant="outline"
          onPress={() => router.push('/breathing' as RelativePathString)}
          className="rounded-xl h-12"
        >
          <Wind size={18} className="text-foreground" />
          <Text className="text-foreground text-base font-semibold mr-2">تمرين التنفس</Text>
        </Button>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="rounded-xl h-12">
              <Trash2 size={18} color="#ffffff" />
              <Text className="text-white text-base font-semibold ml-2">مسح جميع البيانات</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>مسح جميع البيانات؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيؤدي ذلك إلى حذف جميع تسجيلاتك وإعادة تعيين التطبيق. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text className="text-foreground">إلغاء</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleClear}>
                <Text className="text-white">مسح</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Text className="text-xs text-muted-foreground text-center mt-4">Daily Bloom v2.0.0</Text>
      </ScrollView>

      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سؤال مخصص</DialogTitle>
            <DialogDescription>أضف سؤالًا جديدًا يظهر في تسجيلك اليومي.</DialogDescription>
          </DialogHeader>
          <Input value={promptText} onChangeText={setPromptText} placeholder="ما الذي أحببت في يومك؟" className="my-2" />
          <DialogFooter>
            <Button variant="outline" onPress={() => setShowPromptDialog(false)} className="rounded-xl">
              <Text className="text-foreground">إلغاء</Text>
            </Button>
            <Button onPress={handleAddPrompt} disabled={!promptText.trim()} className="rounded-xl">
              <Text className="text-primary-foreground">إضافة</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مزاج مخصص</DialogTitle>
            <DialogDescription>أضف مزاجًا جديدًا مع لون وأيقونة.</DialogDescription>
          </DialogHeader>
          <View className="gap-4 my-2">
            <Input value={moodLabel} onChangeText={setMoodLabel} placeholder="اسم المزاج" />
            <View className="flex-row gap-2 flex-wrap">
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-border bg-secondary'}`}
                >
                  <Text className="text-xs text-foreground">{icon[0]}</Text>
                </Pressable>
              ))}
            </View>
            <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">شكل الوردة</Text>
              <View className="flex-row gap-2 flex-wrap">
                {FLOWERS.map((flower) => (
                  <Pressable
                    key={flower.key}
                    onPress={() => setSelectedFlower(flower.key)}
                    className={`px-3 py-2 rounded-xl border ${selectedFlower === flower.key ? 'border-primary bg-primary/10' : 'border-border bg-secondary'}`}
                  >
                    <Text className="text-sm text-foreground">{flower.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <DialogFooter>
            <Button variant="outline" onPress={() => setShowMoodDialog(false)} className="rounded-xl">
              <Text className="text-foreground">إلغاء</Text>
            </Button>
            <Button onPress={handleAddMood} disabled={!moodLabel.trim()} className="rounded-xl">
              <Text className="text-primary-foreground">إضافة</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
