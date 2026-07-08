import { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

const PHASES = ['اشهد', 'أمسك', 'ازفر', 'أمسك'];
const DURATIONS = [4000, 2000, 4000, 2000];

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const scale = useSharedValue(1);

  const runPhase = useCallback((index: number) => {
    setPhaseIndex(index);
    const targetScale = index === 0 ? 1.6 : index === 2 ? 1 : scale.value;
    scale.value = withTiming(targetScale, { duration: DURATIONS[index], easing: Easing.inOut(Easing.ease) });
  }, [scale]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    runPhase(0);
    const interval = setInterval(() => {
      current = (current + 1) % PHASES.length;
      if (current === 0) setCycles((c) => c + 1);
      runPhase(current);
    }, DURATIONS[0]);
    return () => clearInterval(interval);
  }, [started, runPhase]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Text className="text-2xl font-bold text-foreground mb-2">تمرين التنفس</Text>
      <Text className="text-base text-muted-foreground text-center mb-12">اتبع الدائرة لمدة دقيقة من الهدوء.</Text>

      <View className="w-64 h-64 rounded-full bg-primary/10 items-center justify-center mb-12">
        <Animated.View
          className="w-40 h-40 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
          style={animatedStyle}
        >
          <Text className="text-primary-foreground text-xl font-bold">{PHASES[phaseIndex]}</Text>
        </Animated.View>
      </View>

      <Text className="text-muted-foreground mb-8">دورات: {cycles}</Text>

      {!started ? (
        <Button onPress={() => setStarted(true)} className="rounded-xl h-12 px-8">
          <Text className="text-primary-foreground font-semibold">ابدأ</Text>
        </Button>
      ) : (
        <Button variant="outline" onPress={() => setStarted(false)} className="rounded-xl h-12 px-8">
          <Text className="text-foreground font-semibold">إيقاف</Text>
        </Button>
      )}
    </View>
  );
}
