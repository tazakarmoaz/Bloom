import { View, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string | null;
  onRetry?: () => void;
  onReset?: () => void;
}

export function ErrorState({ title = 'حدث خطأ', message, details, onRetry, onReset }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8 gap-4">
      <AlertCircle size={48} className="text-destructive" />
      <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
      <Text className="text-sm text-muted-foreground text-center">{message}</Text>
      {details ? (
        <Text className="text-xs text-destructive text-center px-4">{details}</Text>
      ) : null}
      <View className="flex-row gap-3">
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            className="bg-primary rounded-xl px-6 py-3 active:opacity-80"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Text className="text-primary-foreground font-medium">إعادة المحاولة</Text>
          </Pressable>
        ) : null}
        {onReset ? (
          <Pressable
            onPress={onReset}
            className="bg-destructive rounded-xl px-6 py-3 active:opacity-80"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Text className="text-white font-medium">إعادة تعيين البيانات</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
