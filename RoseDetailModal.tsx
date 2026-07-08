import { View } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Pencil, Trash2, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Entry } from '@/lib/types';
import { MOODS } from '@/lib/moods';
import { formatDateDisplay } from '@/lib/date';
import { MoodCircle } from '@/components/MoodIcon';

interface RoseDetailModalProps {
  entry: Entry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onToggleFavorite: (entry: Entry) => void;
}

export function RoseDetailModal({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleFavorite,
}: RoseDetailModalProps) {
  if (!entry) return null;
  const mood = MOODS[entry.mood_key];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle>{formatDateDisplay(entry.date)}</DialogTitle>
          <DialogDescription>تفاصيل تسجيل اليوم</DialogDescription>
        </DialogHeader>

        <View className="items-center gap-2">
          <MoodCircle moodKey={entry.mood_key} size={64} iconSize={32} />
          <Text className="text-xl font-semibold text-foreground">{mood?.label ?? entry.mood_key}</Text>
        </View>

        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">السؤال</Text>
          <Text className="text-base text-foreground leading-relaxed">{entry.prompt}</Text>
        </View>

        {entry.note ? (
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">الملاحظة</Text>
            <Text className="text-base text-foreground leading-relaxed">{entry.note}</Text>
          </View>
        ) : null}

        {entry.image_uri ? (
          <Image
            source={{ uri: entry.image_uri }}
            className="w-full h-40 rounded-xl"
            resizeMode="cover"
          />
        ) : null}

        <View className="flex-row gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onPress={() => onToggleFavorite(entry)}>
            <Heart
              size={18}
              className={entry.is_favorite ? 'text-destructive' : 'text-muted-foreground'}
              fill={entry.is_favorite ? 'currentColor' : 'none'}
            />
            <Text className="text-foreground text-sm font-medium mr-2">
              {entry.is_favorite ? 'مفضل' : 'تفضيل'}
            </Text>
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onPress={() => onEdit(entry)}>
            <Pencil size={18} className="text-muted-foreground" />
            <Text className="text-foreground text-sm font-medium mr-2">تحرير</Text>
          </Button>
          <Button variant="destructive" className="flex-1 rounded-xl" onPress={() => onDelete(entry)}>
            <Trash2 size={18} color="#ffffff" />
            <Text className="text-white text-sm font-medium mr-2">حذف</Text>
          </Button>
        </View>

        <Button onPress={() => onOpenChange(false)} className="rounded-xl">
          <X size={18} color="#ffffff" />
          <Text className="text-primary-foreground text-sm font-medium mr-2">إغلاق</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
