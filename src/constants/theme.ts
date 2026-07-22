import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F2F2F2', // Gris muy claro (Screen background)
    backgroundElement: '#FFFFFF', // Blanco (Card / Container background)
    backgroundSelected: '#E6E6E6',
    textSecondary: '#60646C',
    primary: '#6CC6FF',
    accent: '#FF1493',
    border: '#E6E6E6',
    white: '#FFFFFF',
    black: '#111111',
  },
  dark: {
    text: '#FFFFFF',
    background: '#111111',
    backgroundElement: '#222222',
    backgroundSelected: '#333333',
    textSecondary: '#B0B4BA',
    primary: '#6CC6FF',
    accent: '#FF1493',
    border: '#333333',
    white: '#FFFFFF',
    black: '#111111',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  sizes: {
    display: 32,
    h1: 24,
    h2: 20,
    h3: 16,
    body: 14,
    caption: 12,
    small: 10,
  },
} as const;

export const Spacing = {
  four: 4,
  eight: 8,
  twelve: 12,
  sixteen: 16,
  twenty: 20,
  twentyFour: 24,
  thirtyTwo: 32,
  forty: 40,
  fortyEight: 48,
  sixtyFour: 64,
  
  // Legacy aliases for backwards compatibility
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  fourLegacy: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  r4: 4,
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
  r24: 24,
  r32: 32,
} as const;

export const Shadows = {
  xs: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

