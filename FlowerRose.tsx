import { View } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { MoodKey } from '@/lib/types';
import { MOODS } from '@/lib/moods';

type FlowerShape = 'bloom' | 'bud' | 'droopy' | 'star' | 'leafy';

const SHAPE_MAP: Record<string, FlowerShape> = {
  sunny: 'star',
  bright: 'star',
  hopeful: 'star',
  calm: 'leafy',
  peaceful: 'leafy',
  grateful: 'bloom',
  energized: 'bloom',
  focused: 'bloom',
  creative: 'bloom',
  uneasy: 'bud',
  confused: 'bud',
  tired: 'bud',
  heavy: 'droopy',
  sad: 'droopy',
  motivated: 'star',
};

interface FlowerRoseProps {
  moodKey: MoodKey;
  size?: number;
  animated?: boolean;
}

export function FlowerRose({ moodKey, size = 40, animated = true }: FlowerRoseProps) {
  const mood = MOODS[moodKey];
  const color = mood?.colorHex ?? '#94A3B8';
  const shape = (mood as { flower?: FlowerShape } | undefined)?.flower ?? SHAPE_MAP[moodKey] ?? 'bloom';

  const pulse = useSharedValue(1);
  if (animated) {
    pulse.value = withRepeat(
      withTiming(1.07, { duration: 1600 }),
      -1,
      true
    );
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const Wrapper = animated ? Animated.View : View;

  const isDroopy = shape === 'droopy';
  const isBud = shape === 'bud';
  const centerY = isDroopy ? 28 : 24;
  const petalY = isDroopy ? 30 : 24;

  return (
    <Wrapper
      entering={animated ? FadeIn.duration(600).springify() : undefined}
      className="items-center justify-center"
      style={animated ? animatedStyle : undefined}
    >
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <RadialGradient id={`center-${moodKey}`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </RadialGradient>
        </Defs>

        {/* Soft drop shadow */}
        <Ellipse cx="24" cy="42" rx="9" ry="2.5" fill="#000000" opacity={0.06} />

        {shape === 'star' ? (
          <>
            {[0, 72, 144, 216, 288].map((angle) => (
              <Path
                key={angle}
                d="M24 6 L27 18 L38 18 L29 25 L32 37 L24 30 L16 37 L19 25 L10 18 L21 18 Z"
                fill={color}
                opacity={0.9}
                transform={`rotate(${angle} 24 24)`}
              />
            ))}
            <Circle cx="24" cy="24" r="6" fill={`url(#center-${moodKey})`} />
          </>
        ) : shape === 'bud' ? (
          <>
            <Path d="M24 10 C14 16, 14 32, 24 42 C34 32, 34 16, 24 10" fill={color} opacity={0.9} />
            <Path d="M24 10 C28 18, 20 30, 24 42" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth="1.5" />
            <Ellipse cx="24" cy="16" rx="4" ry="6" fill={color} opacity={0.7} />
          </>
        ) : (
          <>
            {/* Outer petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <Ellipse
                key={`outer-${angle}`}
                cx="24"
                cy={petalY}
                rx="6.5"
                ry={isDroopy ? 12 : 14}
                fill={color}
                opacity={0.85}
                transform={`rotate(${angle} 24 ${petalY})`}
              />
            ))}
            {/* Inner petals */}
            {[22, 67, 112, 157, 202, 247, 292, 337].map((angle) => (
              <Ellipse
                key={`inner-${angle}`}
                cx="24"
                cy={petalY}
                rx="4"
                ry={isDroopy ? 7 : 9}
                fill={color}
                opacity={0.55}
                transform={`rotate(${angle} 24 ${petalY})`}
              />
            ))}
            <Circle cx="24" cy={centerY} r="6.5" fill={`url(#center-${moodKey})`} />
            {/* Stamen dots */}
            {[0, 72, 144, 216, 288].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const r = 3;
              return (
                <Circle
                  key={`dot-${angle}`}
                  cx={centerY + r * Math.cos(rad)}
                  cy={centerY + r * Math.sin(rad)}
                  r="1"
                  fill="#FFFFFF"
                  opacity={0.75}
                />
              );
            })}
          </>
        )}
      </Svg>
    </Wrapper>
  );
}
