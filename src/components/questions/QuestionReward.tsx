import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Coins } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography } from '@/constants/theme';

export interface QuestionRewardProps {
  amount: number;
}

export const QuestionReward: React.FC<QuestionRewardProps> = ({ amount }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(108, 198, 255, 0.12)',
          borderColor: theme.primary,
        }
      ]}
    >
      <Coins size={14} color="#0284C7" style={{ marginRight: Spacing.four }} />
      <ThemedText
        style={[
          styles.text,
          {
            fontFamily: Typography.fontFamily.semiBold,
            color: '#0284C7',
          }
        ]}
      >
        {amount} Tokens
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.ten,
    paddingVertical: Spacing.four,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.sizes.caption,
  },
});
