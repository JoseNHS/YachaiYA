import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';

export interface QuestionHeaderProps {
  authorName: string;
  authorAvatar?: string | null;
  authorReputation: number;
  dateStr: string;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  authorName,
  authorAvatar,
  authorReputation,
  dateStr,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Avatar uri={authorAvatar} name={authorName} size="s" />
        <View style={styles.info}>
          <View style={styles.authorRow}>
            <ThemedText
              style={[
                styles.name,
                {
                  fontFamily: Typography.fontFamily.semiBold,
                  color: colorPalette.text,
                }
              ]}
            >
              {authorName}
            </ThemedText>
            <View style={styles.repBadge}>
              <ThemedText style={styles.star}>⭐</ThemedText>
              <ThemedText
                style={[
                  styles.repText,
                  {
                    fontFamily: Typography.fontFamily.medium,
                    color: colorPalette.textSecondary,
                  }
                ]}
              >
                {authorReputation}
              </ThemedText>
            </View>
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.twelve,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: Spacing.twelve,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  name: {
    fontSize: Typography.sizes.body,
  },
  repBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.eight,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.two,
    borderRadius: 6,
  },
  star: {
    fontSize: 10,
    marginRight: 2,
  },
  repText: {
    fontSize: Typography.sizes.small,
  },
  date: {
    fontSize: Typography.sizes.caption,
  },
});
