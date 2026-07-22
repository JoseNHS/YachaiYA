import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export type BadgeVariant = 
  | 'alumno'
  | 'docente'
  | 'administrador'
  | 'open'
  | 'solved'
  | 'in_review'
  | 'expired'
  | 'cancelled'
  | 'difficulty_easy'
  | 'difficulty_medium'
  | 'difficulty_hard'
  | 'difficulty_olympiad';

export interface BadgeProps {
  variant: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ variant, style }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getVariantStyles = () => {
    let bg: string = colorPalette.backgroundElement;
    let color: string = colorPalette.text;
    let label = '';

    switch (variant) {
      case 'alumno':
        bg = 'rgba(108, 198, 255, 0.15)';
        color = '#2563EB'; // Blue
        label = 'Alumno';
        break;
      case 'docente':
        bg = 'rgba(16, 185, 129, 0.15)';
        color = '#059669'; // Green
        label = 'Docente';
        break;
      case 'administrador':
        bg = 'rgba(139, 92, 246, 0.15)';
        color = '#7C3AED'; // Purple
        label = 'Admin';
        break;
      case 'open':
        bg = 'rgba(16, 185, 129, 0.1)';
        color = '#10B981';
        label = 'Abierta';
        break;
      case 'solved':
        bg = 'rgba(108, 198, 255, 0.15)';
        color = '#2563EB';
        label = 'Resuelta';
        break;
      case 'in_review':
        bg = 'rgba(245, 158, 11, 0.15)';
        color = '#D97706'; // Amber
        label = 'En Revisión';
        break;
      case 'expired':
        bg = 'rgba(107, 114, 128, 0.15)';
        color = '#4B5563'; // Grey
        label = 'Vencida';
        break;
      case 'cancelled':
        bg = 'rgba(239, 68, 68, 0.15)';
        color = '#DC2626'; // Red
        label = 'Cancelada';
        break;
      case 'difficulty_easy':
        bg = 'rgba(16, 185, 129, 0.1)';
        color = '#10B981';
        label = 'Básica';
        break;
      case 'difficulty_medium':
        bg = 'rgba(245, 158, 11, 0.1)';
        color = '#F59E0B';
        label = 'Intermedia';
        break;
      case 'difficulty_hard':
        bg = 'rgba(239, 68, 68, 0.1)';
        color = '#EF4444';
        label = 'Avanzada';
        break;
      case 'difficulty_olympiad':
        bg = 'rgba(255, 20, 147, 0.15)'; // Fucsia color
        color = '#FF1493';
        label = 'Olímpica';
        break;
    }

    return { bg, color, label };
  };

  const { bg, color, label } = getVariantStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <ThemedText
        style={[
          styles.text,
          {
            color,
            fontFamily: Typography.fontFamily.medium,
          }
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.eight,
    borderRadius: Radius.r8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.sizes.small + 1,
    fontWeight: '600',
  },
});
