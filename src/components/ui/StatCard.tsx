import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Shadows, Colors } from '@/constants/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'neutral',
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      default:
        return colorPalette.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.background,
          borderColor: colorPalette.border,
        },
        Shadows.sm
      ]}
    >
      <View style={styles.header}>
        <ThemedText
          style={[
            styles.title,
            {
              fontFamily: Typography.fontFamily.medium,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {title}
        </ThemedText>
        {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      </View>

      <ThemedText
        style={[
          styles.value,
          {
            fontFamily: Typography.fontFamily.bold,
            color: colorPalette.text,
          }
        ]}
      >
        {value}
      </ThemedText>

      {trend && (
        <ThemedText
          style={[
            styles.trend,
            {
              fontFamily: Typography.fontFamily.regular,
              color: getTrendColor(),
            }
          ]}
        >
          {trend}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.r12,
    borderWidth: 1,
    padding: Spacing.sixteen,
    minWidth: 140,
    flex: 1,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.eight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.eight,
  },
  title: {
    fontSize: Typography.sizes.caption,
  },
  icon: {
    fontSize: 16,
  },
  value: {
    fontSize: Typography.sizes.h1,
    marginBottom: Spacing.four,
  },
  trend: {
    fontSize: Typography.sizes.small,
  },
});
