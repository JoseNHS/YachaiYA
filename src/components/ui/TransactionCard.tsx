import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface TransactionCardProps {
  description: string;
  amount: number;
  type: 'publish_question' | 'accept_answer' | 'admin_grant' | 'admin_refund';
  status: 'pending' | 'completed' | 'cancelled';
  dateStr: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  description,
  amount,
  type,
  status,
  dateStr,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getAmountColor = () => {
    switch (type) {
      case 'accept_answer':
      case 'admin_grant':
        return '#10B981'; // Green (Add funds)
      case 'publish_question':
        return '#EF4444'; // Red (Deductions)
      default:
        return colorPalette.text;
    }
  };

  const getAmountSign = () => {
    switch (type) {
      case 'accept_answer':
      case 'admin_grant':
        return '+';
      case 'publish_question':
        return '-';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <ThemedText
            style={[
              styles.description,
              {
                fontFamily: Typography.fontFamily.semiBold,
                color: colorPalette.text,
              }
            ]}
          >
            {description}
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

        <View style={styles.right}>
          <ThemedText
            style={[
              styles.amount,
              {
                fontFamily: Typography.fontFamily.bold,
                color: getAmountColor(),
              }
            ]}
          >
            {getAmountSign()}{amount} Tokens
          </ThemedText>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '1A' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText
              style={[
                styles.statusText,
                {
                  fontFamily: Typography.fontFamily.medium,
                  color: getStatusColor(),
                }
              ]}
            >
              {status}
            </ThemedText>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sixteen,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: Spacing.sixteen,
  },
  right: {
    alignItems: 'flex-end',
  },
  description: {
    fontSize: Typography.sizes.body,
    marginBottom: Spacing.four,
  },
  date: {
    fontSize: Typography.sizes.caption,
  },
  amount: {
    fontSize: Typography.sizes.body + 1,
    marginBottom: Spacing.four,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.two,
    borderRadius: Radius.r8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.six,
  },
  statusText: {
    fontSize: Typography.sizes.small,
  },
});
