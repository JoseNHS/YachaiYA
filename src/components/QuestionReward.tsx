import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface QuestionRewardProps {
  tokens: number;
  style?: any;
}

export function QuestionReward({ tokens, style }: QuestionRewardProps) {
  return (
    <ThemedText type="smallBold" style={[styles.rewardText, style]}>
      🪙 {tokens} Tokens
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  rewardText: {
    color: '#6366F1',
    fontSize: 13,
  },
});
