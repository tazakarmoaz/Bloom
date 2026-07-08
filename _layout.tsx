import { Tabs } from 'expo-router';
import { CalendarDays, Flower, Flower2, BarChart3, Settings, Trophy, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'hsl(164 16% 59%)',
        tabBarInactiveTintColor: 'hsl(140 5% 45%)',
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: 'hsl(100 20% 97%)',
          borderTopColor: 'hsl(100 12% 88%)',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'تسجيل',
          tabBarIcon: ({ color, size }) => <Flower2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'حديقتي',
          tabBarIcon: ({ color, size }) => <Flower size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'التقويم',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'ذكريات',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'رؤى',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'إنجازات',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'إعدادات',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
