import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface ReputationProps {
  score: number;
}

export const Reputation: React.FC<ReputationProps> = ({ score }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getRankInfo = () => {
    if (score >= 500) return { title: 'Leyenda', icon: '🏆', color: '#F59E0B' };
    if (score >= 200) return { title: 'Maestro', icon: '🥇', color: '#FF1493' };
    if (score >= 100) return { title: 'Experto', icon: '🥈', color: '#6CC6FF' };
    if (score >= 50) return { title: 'Colaborador', icon: '🥉', color: '#10B981' };
    return { title: 'Iniciando', icon: '⭐️', color: '#6B7280' };
  };

  const { title, icon, color } = getRankInfo();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderColor: colorPalette.border,
        }
      ]}
    >
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <View>
        <ThemedText
          style={[
            styles.rankTitle,
            {
              fontFamily: Typography.fontFamily.semiBold,
              color,
            }
          ]}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={[
            styles.scoreText,
            {
              fontFamily: Typography.fontFamily.medium,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {score} pts reputación
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.twelve,
    paddingVertical: Spacing.eight,
    borderRadius: Radius.r12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.eight,
  },
  rankTitle: {
    fontSize: Typography.sizes.caption,
  },
  scoreText: {
    fontSize: Typography.sizes.small + 1,
  },
});
