import { DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { 
  useFonts, 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';

const YachaiYaNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6CC6FF',
    background: '#F2F2F2',
    card: '#FFFFFF',
    text: '#111111',
    border: '#E6E6E6',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={YachaiYaNavigationTheme}>
        <AnimatedSplashOverlay />
        <Slot />
      </ThemeProvider>
    </AuthProvider>
  );
}

