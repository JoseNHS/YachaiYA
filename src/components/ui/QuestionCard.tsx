import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card } from './Card';
import { ThemedText } from '../themed-text';
import { Badge } from './Badge';
import { TokenChip } from './TokenChip';
import { Avatar } from './Avatar';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';

export interface QuestionCardProps {
  title: string;
  description: string;
  category: string;
  difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada';
  reward: number;
  authorName: string;
  authorAvatar?: string | null;
  status: 'open' | 'solved' | 'in_review' | 'expired' | 'cancelled';
  onPress?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  description,
  category,
  difficulty,
  reward,
  authorName,
  authorAvatar,
  status,
  onPress,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'Básica': return 'difficulty_easy';
      case 'Intermedia': return 'difficulty_medium';
      case 'Avanzada': return 'difficulty_hard';
      default: return 'difficulty_olympiad';
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <View style={[styles.dot, { backgroundColor: colorPalette.primary }]} />
            <ThemedText
              style={[
                styles.categoryText,
                {
                  fontFamily: Typography.fontFamily.medium,
                  color: colorPalette.textSecondary,
                }
              ]}
            >
              {category}
            </ThemedText>
          </View>
          <Badge variant={getDifficultyBadge()} />
        </View>

        <ThemedText
          style={[
            styles.title,
            {
              fontFamily: Typography.fontFamily.semiBold,
              color: colorPalette.text,
            }
          ]}
          numberOfLines={2}
        >
          {title}
        </ThemedText>

        <ThemedText
          style={[
            styles.description,
            {
              fontFamily: Typography.fontFamily.regular,
              color: colorPalette.textSecondary,
            }
          ]}
          numberOfLines={3}
        >
          {description}
        </ThemedText>

        <View style={styles.footer}>
          <View style={styles.authorRow}>
            <Avatar uri={authorAvatar} name={authorName} size="xs" />
            <ThemedText
              style={[
                styles.authorName,
                {
                  fontFamily: Typography.fontFamily.medium,
                  color: colorPalette.text,
                }
              ]}
            >
              {authorName}
            </ThemedText>
          </View>

          <View style={styles.rightFooter}>
            <Badge variant={status} style={{ marginRight: Spacing.eight }} />
            <TokenChip amount={reward} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sixteen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.twelve,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.six,
  },
  categoryText: {
    fontSize: Typography.sizes.caption,
  },
  title: {
    fontSize: Typography.sizes.h3,
    marginBottom: Spacing.eight,
  },
  description: {
    fontSize: Typography.sizes.body,
    lineHeight: 20,
    marginBottom: Spacing.sixteen,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.eight,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: Typography.sizes.caption,
    marginLeft: Spacing.eight,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
