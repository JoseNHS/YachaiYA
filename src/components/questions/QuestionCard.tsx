import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { ThemedText } from '../themed-text';
import { QuestionHeader } from './QuestionHeader';
import { QuestionReward } from './QuestionReward';
import { QuestionDifficulty } from './QuestionDifficulty';
import { QuestionStatus } from './QuestionStatus';
import { QuestionFooter } from './QuestionFooter';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { Question } from '@/types/auth';

export interface QuestionCardProps {
  question: Question;
  onPress: () => void;
}

const getRelativeTime = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
};

export const QuestionCard: React.FC<QuestionCardProps> = React.memo(({ question, onPress }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const authorName = question.author?.full_name || 'Usuario YachaiYa';
  const authorReputation = question.author?.reputation || 0;
  const answersCount = question.answers ? question.answers.filter((a: any) => a.deleted_at === null).length : 0;
  const relativeTime = getRelativeTime(question.created_at);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <QuestionHeader
          authorName={authorName}
          authorReputation={authorReputation}
          dateStr={relativeTime}
        />

        <View style={styles.titleRow}>
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
            {question.title}
          </ThemedText>
        </View>

        <ThemedText
          style={[
            styles.description,
            {
              fontFamily: Typography.fontFamily.regular,
              color: colorPalette.textSecondary,
            }
          ]}
          numberOfLines={2}
        >
          {question.description}
        </ThemedText>

        <View style={styles.badgesRow}>
          <View style={styles.leftBadges}>
            <QuestionDifficulty difficulty={question.difficulty} />
            <QuestionStatus status={question.status} />
            {question.category?.name && (
              <View style={[styles.categoryBadge, { backgroundColor: colorPalette.backgroundElement }]}>
                <ThemedText
                  style={[
                    styles.categoryText,
                    {
                      fontFamily: Typography.fontFamily.medium,
                      color: colorPalette.textSecondary,
                    }
                  ]}
                >
                  📚 {question.category.name}
                </ThemedText>
              </View>
            )}
          </View>
          <QuestionReward amount={question.reward_tokens} />
        </View>

        <QuestionFooter answersCount={answersCount} />
      </Card>
    </Pressable>
  );
});

QuestionCard.displayName = 'QuestionCard';

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sixteen,
    marginBottom: Spacing.twelve,
  },
  titleRow: {
    marginBottom: Spacing.eight,
  },
  title: {
    fontSize: Typography.sizes.h3 - 1,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.sizes.body,
    lineHeight: 20,
    marginBottom: Spacing.twelve,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  leftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: Typography.sizes.small + 1,
  },
});
