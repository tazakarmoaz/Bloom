import { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const PALETTE = [
  '#F43F5E', '#FB7185', '#FDA4AF', '#F472B6', '#D946EF', '#C026D3',
  '#A855F7', '#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4',
  '#14B8A6', '#10B981', '#22C55E', '#4ADE80', '#A3E635', '#EAB308',
  '#FACC15', '#FBBF24', '#FB923C', '#F97316', '#EF4444', '#B91C1C',
  '#78716C', '#94A3B8', '#64748B', '#475569', '#334155', '#0F172A',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(color);
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [custom, setCustom] = useState(value.toUpperCase());

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted-foreground uppercase tracking-wide">اختر لونًا</Text>
      <View className="flex-row flex-wrap gap-2">
        {PALETTE.map((color) => (
          <Pressable
            key={color}
            onPress={() => { onChange(color); setCustom(color); }}
            className={cn(
              'w-10 h-10 rounded-full border-2 items-center justify-center',
              value.toUpperCase() === color.toUpperCase() ? 'border-foreground' : 'border-transparent'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </View>

      <View className="gap-2">
        <Text className="text-sm text-muted-foreground uppercase tracking-wide">أو أدخل كود اللون (HEX)</Text>
        <TextInput
          value={custom}
          onChangeText={(text) => {
            const formatted = text.startsWith('#') ? text : `#${text}`;
            setCustom(formatted.toUpperCase());
            if (isValidHex(formatted)) {
              onChange(formatted.toUpperCase());
            }
          }}
          placeholder="#FF5733"
          className="border border-border bg-background rounded-lg px-3 py-2 text-foreground text-base"
          maxLength={7}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );
}
