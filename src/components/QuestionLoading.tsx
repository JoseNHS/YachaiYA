import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedView } from './themed-view';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

export function QuestionLoading() {
  const theme = useTheme();
  const [animatedValue] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [animatedValue]);

  const skeletonCard = (key: number) => (
    <ThemedView key={key} type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonPill, { backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
        <Animated.View style={[styles.skeletonPill, { backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
      </View>
      <Animated.View style={[styles.skeletonTitle, { backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
      <Animated.View style={[styles.skeletonText, { backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
      <Animated.View style={[styles.skeletonText, { width: '60%', backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
      <View style={styles.footer}>
        <Animated.View style={[styles.skeletonPill, { width: 60, backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
        <Animated.View style={[styles.skeletonPill, { width: 80, backgroundColor: theme.backgroundSelected, opacity: animatedValue }]} />
      </View>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      {skeletonCard(1)}
      {skeletonCard(2)}
      {skeletonCard(3)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  skeletonPill: {
    height: 18,
    width: 70,
    borderRadius: 6,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: Spacing.two,
  },
  skeletonText: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.05)',
    paddingTop: Spacing.two,
  },
});
