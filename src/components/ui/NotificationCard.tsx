import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';

export interface NotificationCardProps {
  title: string;
  message: string;
  isRead?: boolean;
  dateStr: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  isRead = false,
  dateStr,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        !isRead && {
          borderLeftColor: theme.accent,
          borderLeftWidth: 4,
        }
      ]}
    >
      <View style={styles.header}>
        <ThemedText
          style={[
            styles.title,
            {
              fontFamily: Typography.fontFamily.semiBold,
              color: theme.text,
            }
          ]}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={[
            styles.date,
            {
              fontFamily: Typography.fontFamily.regular,
              color: theme.textSecondary,
            }
          ]}
        >
          {dateStr}
        </ThemedText>
      </View>

      <ThemedText
        style={[
          styles.message,
          {
            fontFamily: Typography.fontFamily.regular,
            color: theme.textSecondary,
          }
        ]}
      >
        {message}
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
    marginBottom: Spacing.eight,
  },
  title: {
    fontSize: Typography.sizes.body + 1,
    flex: 1,
    marginRight: Spacing.eight,
  },
  date: {
    fontSize: Typography.sizes.caption,
  },
  message: {
    fontSize: Typography.sizes.body,
    lineHeight: 20,
  },
});
