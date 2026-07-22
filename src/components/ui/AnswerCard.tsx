import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { ThemedText } from '../themed-text';
import { Avatar } from './Avatar';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface AnswerCardProps {
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  isAccepted?: boolean;
  dateStr: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  authorName,
  authorAvatar,
  content,
  isAccepted = false,
  dateStr,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <Card
      style={[
        styles.card,
        isAccepted && {
          borderColor: '#10B981',
          borderWidth: 2,
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)',
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Avatar uri={authorAvatar} name={authorName} size="s" />
          <View style={styles.authorInfo}>
            <ThemedText
              style={[
                styles.authorName,
                {
                  fontFamily: Typography.fontFamily.semiBold,
                  color: colorPalette.text,
                }
              ]}
            >
              {authorName}
            </ThemedText>
            <ThemedText
              style={[
                styles.date,
                {
                  fontFamily: Typography.fontFamily.regular,
                  color: colorPalette.textSecondary,
                }
              ]}
            >
              {dateStr}
            </ThemedText>
          </View>
        </View>

        {isAccepted && (
          <View style={styles.acceptedBadge}>
            <ThemedText style={styles.acceptedIcon}>🏆</ThemedText>
            <ThemedText
              style={[
                styles.acceptedText,
                { fontFamily: Typography.fontFamily.semiBold }
              ]}
            >
              Solución Aceptada
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText
        style={[
          styles.content,
          {
            fontFamily: Typography.fontFamily.regular,
            color: colorPalette.text,
          }
        ]}
      >
        {content}
      </ThemedText>
    </Card>
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: Spacing.twelve,
  },
  authorName: {
    fontSize: Typography.sizes.body,
  },
  date: {
    fontSize: Typography.sizes.caption,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: Radius.r8,
  },
  acceptedIcon: {
    fontSize: 12,
    marginRight: Spacing.four,
  },
  acceptedText: {
    fontSize: Typography.sizes.small + 1,
    color: '#10B981',
  },
  content: {
    fontSize: Typography.sizes.body,
    lineHeight: 22,
  },
});
