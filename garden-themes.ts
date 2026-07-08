export type GardenThemeKey =
  | 'default' | 'sunset' | 'ocean' | 'forest' | 'night'
  | 'spring' | 'desert' | 'aurora' | 'sakura' | 'golden';

export interface GardenTheme {
  key: GardenThemeKey;
  name: string;
  skyLight: string;
  skyDark: string;
  grassLight: string;
  grassDark: string;
  accent: string;
}

export const GARDEN_THEMES: Record<GardenThemeKey, GardenTheme> = {
  default: {
    key: 'default',
    name: 'افتراضي',
    skyLight: '#BAE6FD', skyDark: '#0C4A6E',
    grassLight: '#6EE7B7', grassDark: '#065F46',
    accent: '#FDE68A',
  },
  sunset: {
    key: 'sunset',
    name: 'غروب',
    skyLight: '#FED7AA', skyDark: '#7C2D12',
    grassLight: '#A3E635', grassDark: '#3F6212',
    accent: '#FDBA74',
  },
  ocean: {
    key: 'ocean',
    name: 'محيط',
    skyLight: '#CFFAFE', skyDark: '#155E75',
    grassLight: '#5EEAD4', grassDark: '#115E59',
    accent: '#FDE68A',
  },
  forest: {
    key: 'forest',
    name: 'غابة',
    skyLight: '#DCFCE7', skyDark: '#14532D',
    grassLight: '#86EFAC', grassDark: '#166534',
    accent: '#FEF08A',
  },
  night: {
    key: 'night',
    name: 'ليل',
    skyLight: '#E0E7FF', skyDark: '#1E1B4B',
    grassLight: '#818CF8', grassDark: '#312E81',
    accent: '#FCD34D',
  },
  spring: {
    key: 'spring',
    name: 'ربيع',
    skyLight: '#FDF4FF', skyDark: '#4A044E',
    grassLight: '#D9F99D', grassDark: '#365314',
    accent: '#F0ABFC',
  },
  desert: {
    key: 'desert',
    name: 'صحراء',
    skyLight: '#FEF3C7', skyDark: '#78350F',
    grassLight: '#FDE68A', grassDark: '#92400E',
    accent: '#FCA5A5',
  },
  aurora: {
    key: 'aurora',
    name: 'شفق قطبي',
    skyLight: '#CCFBF1', skyDark: '#134E4A',
    grassLight: '#A5F3FC', grassDark: '#0E7490',
    accent: '#C4B5FD',
  },
  sakura: {
    key: 'sakura',
    name: 'أزهار كرز',
    skyLight: '#FFF1F2', skyDark: '#881337',
    grassLight: '#FBCFE8', grassDark: '#9D174D',
    accent: '#FDE68A',
  },
  golden: {
    key: 'golden',
    name: 'ذهبي',
    skyLight: '#FFFBEB', skyDark: '#713F12',
    grassLight: '#FDE68A', grassDark: '#854D0E',
    accent: '#FB923C',
  },
};
