import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';
import { Avatar } from './Avatar';

export interface HeaderProps {
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const roleLabel = user?.role === 'alumno' ? '🎓 Alumno' : '👨‍🏫 Docente';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderBottomColor: theme.border,
        }
      ]}
    >
      <View style={styles.leftRow}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.greeting,
              {
                fontFamily: Typography.fontFamily.semiBold,
                color: theme.text,
              }
            ]}
          >
            {user?.full_name?.split(' ')[0] || 'Estudiante'}
          </ThemedText>
          <ThemedText
            style={[
              styles.role,
              {
                fontFamily: Typography.fontFamily.medium,
                color: theme.textSecondary,
              }
            ]}
          >
            {roleLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightRow}>
        <Pressable
          onPress={onNotificationPress}
          style={({ pressed }) => [
            styles.notificationBtn,
            { borderColor: theme.border, backgroundColor: theme.backgroundElement },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Bell size={18} color={theme.textSecondary} />
        </Pressable>

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
    borderBottomWidth: 1,
    height: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.ten,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.body,
    lineHeight: 18,
  },
  role: {
    fontSize: Typography.sizes.caption - 1,
    lineHeight: 14,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
