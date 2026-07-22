import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '../themed-text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { Avatar } from './Avatar';
import { IconButton } from './IconButton';

export interface HeaderProps {
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;


  const roleLabel = user?.role === 'alumno' ? '🎒 Alumno' : '👨‍🏫 Docente';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderBottomColor: colorPalette.border,
        }
      ]}
    >
      <View style={styles.leftRow}>
        <Image
          source={require('@/assets/images/react-logo.png')} // Fallback asset or logo
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.greeting,
              {
                fontFamily: Typography.fontFamily.semiBold,
                color: colorPalette.text,
              }
            ]}
          >
            Hola, {user?.full_name?.split(' ')[0] || 'Estudiante'}
          </ThemedText>
          <ThemedText
            style={[
              styles.role,
              {
                fontFamily: Typography.fontFamily.medium,
                color: colorPalette.textSecondary,
              }
            ]}
          >
            {roleLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightRow}>
        <IconButton
          icon="🔔"
          variant="outline"
          size="md"
          onPress={onNotificationPress}
          style={styles.notificationBtn}
        />
        <Avatar
          name={user?.full_name || 'Estudiante'}
          size="s"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: 1,
    height: 72,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.body + 1,
    lineHeight: 18,
  },
  role: {
    fontSize: Typography.sizes.caption,
    lineHeight: 14,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  notificationBtn: {
    borderWidth: 1,
  },
});
