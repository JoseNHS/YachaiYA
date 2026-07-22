import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface QuestionStatusBadgeProps {
  status: 'open' | 'in_review' | 'solved' | 'expired' | 'cancelled';
}

export function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  let badgeText = '';
  let badgeColor = '#6B7280';
  let badgeBg = 'rgba(107, 114, 128, 0.1)';

  switch (status) {
    case 'open':
      badgeText = '⚡ Abierto';
      badgeColor = '#F59E0B';
      badgeBg = 'rgba(245, 158, 11, 0.1)';
      break;
    case 'in_review':
      badgeText = '🔍 En revisión';
      badgeColor = '#3B82F6';
      badgeBg = 'rgba(59, 130, 246, 0.1)';
      break;
    case 'solved':
      badgeText = '✓ Resuelta';
      badgeColor = '#10B981';
      badgeBg = 'rgba(16, 185, 129, 0.1)';
      break;
    case 'expired':
      badgeText = '⏳ Expirado';
      badgeColor = '#EF4444';
      badgeBg = 'rgba(239, 68, 68, 0.1)';
      break;
    case 'cancelled':
      badgeText = '✕ Cancelado';
      badgeColor = '#EF4444';
      badgeBg = 'rgba(239, 68, 68, 0.1)';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <ThemedText style={[styles.text, { color: badgeColor }]}>{badgeText}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
