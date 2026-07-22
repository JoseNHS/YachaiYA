import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Colors } from '@/constants/theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
}

const SIZE_MAP = {
  xs: 24,
  s: 36,
  m: 48,
  l: 64,
  xl: 96,
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name = 'Usuario', size = 'm' }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const diameter = SIZE_MAP[size];

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          }
        ]}
      />
    );
  }

  // Fallback initial avatar with clean pastel background matching design aesthetics
  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: colorPalette.backgroundElement,
          borderColor: colorPalette.border,
          borderWidth: 1,
        }
      ]}
    >
      <ThemedText
        style={{
          fontFamily: Typography.fontFamily.semiBold,
          fontSize: diameter * 0.4,
          color: colorPalette.primary,
        }}
      >
        {getInitials(name)}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#CCCCCC',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
