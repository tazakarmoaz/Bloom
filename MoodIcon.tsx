import {
  Sun, Leaf, Flame, Cloud, CloudRain, Moon, Smile, Heart, Star, Zap,
  Sunrise, Sparkles, Target, Lightbulb, HelpCircle,
  Award, Wind, AlertCircle, Coffee, Search, Shield,
} from 'lucide-react-native';
import { View } from 'react-native';
import type { MoodKey } from '@/lib/types';
import { MOODS } from '@/lib/moods';
import { cn } from '@/lib/utils';

interface MoodIconProps {
  moodKey: MoodKey;
  size?: number;
  color?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Sun, Leaf, Flame, Cloud, CloudRain, Moon, Smile, Heart, Star, Zap,
  Sunrise, Sparkles, Target, Lightbulb, HelpCircle,
  Award, Wind, AlertCircle, Coffee, Search, Shield,
};

export function MoodIcon({ moodKey, size = 24, color }: MoodIconProps) {
  const mood = MOODS[moodKey];
  const iconName = mood?.icon ?? 'Smile';
  const IconComponent = ICON_MAP[iconName] ?? Smile;
  return <IconComponent size={size} color={color ?? '#ffffff'} />;
}

interface MoodCircleProps {
  moodKey: MoodKey;
  size?: number;
  iconSize?: number;
  className?: string;
}

export function MoodCircle({ moodKey, size = 48, iconSize = 24, className }: MoodCircleProps) {
  const mood = MOODS[moodKey];
  const color = mood?.colorHex ?? '#94A3B8';
  return (
    <View
      className={cn('items-center justify-center rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <MoodIcon moodKey={moodKey} size={iconSize} color="#ffffff" />
    </View>
  );
}
