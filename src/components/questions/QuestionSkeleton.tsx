import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Loading';
import { Spacing } from '@/constants/theme';

export const QuestionSkeleton: React.FC = () => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <View style={styles.authorInfo}>
            <Skeleton width={100} height={12} />
            <Skeleton width={60} height={8} />
          </View>
        </View>
        <Skeleton width={50} height={16} />
      </View>

      <Skeleton width="80%" height={18} />
      <View style={styles.spacing} />
      <Skeleton width="95%" height={10} />
      <Skeleton width="90%" height={10} />
      <Skeleton width="60%" height={10} />

      <View style={styles.footer}>
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={20} borderRadius={10} />
      </View>
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
    marginBottom: Spacing.sixteen,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: Spacing.twelve,
    gap: Spacing.four,
  },
  spacing: {
    height: Spacing.eight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sixteen,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.08)',
    paddingTop: Spacing.twelve,
  },
});
