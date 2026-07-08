import { View } from 'react-native';
import { Flower2 } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8 gap-4">
      <Flower2 size={48} className="text-muted-foreground" />
      <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
      <Text className="text-sm text-muted-foreground text-center">{description}</Text>
    </View>
  );
}
