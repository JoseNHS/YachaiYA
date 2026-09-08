import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Coins, Award, GraduationCap, CheckCircle2, ArrowUpRight } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export interface DocenteSummaryCardProps {
  tokens: number;
  reputation: number;
  answersCount: number;
  acceptedAnswersCount: number;
  onPressWallet?: () => void;
}

export const DocenteSummaryCard: React.FC<DocenteSummaryCardProps> = ({
  tokens,
  reputation,
  answersCount,
  acceptedAnswersCount,
  onPressWallet,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        Shadows.xs,
      ]}
    >
      <View style={styles.gridRow}>
        {/* Metric 1: Tokens (Celeste) */}
        <Pressable
          onPress={onPressWallet}
          style={({ pressed }) => [
            styles.metricCell,
            { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
          ]}
        >
          <View style={styles.cellHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
              <Coins size={16} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.cellLabel, { color: '#0284C7' }]}>
              Tokens
            </ThemedText>
            {onPressWallet && <ArrowUpRight size={14} color="#0284C7" style={{ marginLeft: 'auto' }} />}
          </View>
          <ThemedText style={[styles.cellValue, { color: '#0369A1' }]}>
            {tokens}
          </ThemedText>
        </Pressable>

        {/* Metric 2: Reputación Experto (Fucsia) */}
        <View style={[styles.metricCell, { backgroundColor: '#FDF2F8', borderColor: '#FBCFE8' }]}>
          <View style={styles.cellHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
              <Award size={16} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.cellLabel, { color: '#BE185D' }]}>
              Reputación
            </ThemedText>
          </View>
          <ThemedText style={[styles.cellValue, { color: '#9D174D' }]}>
            {reputation} <ThemedText style={{ fontSize: 12, color: '#BE185D' }}>pts</ThemedText>
          </ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.gridRow}>
        {/* Metric 3: Soluciones Propuestas */}
        <View style={[styles.metricCell, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
          <View style={styles.cellHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#0284C7' }]}>
              <GraduationCap size={16} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.cellLabel, { color: '#475569' }]}>
              Respuestas
            </ThemedText>
          </View>
          <ThemedText style={[styles.cellValue, { color: '#1E293B' }]}>
            {answersCount} <ThemedText style={{ fontSize: 12, color: '#64748B' }}>propuestas</ThemedText>
          </ThemedText>
        </View>

        {/* Metric 4: Soluciones Aceptadas */}
        <View style={[styles.metricCell, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <View style={styles.cellHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
              <CheckCircle2 size={16} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.cellLabel, { color: '#047857' }]}>
              Aceptadas
            </ThemedText>
          </View>
          <ThemedText style={[styles.cellValue, { color: '#065F46' }]}>
            {acceptedAnswersCount} <ThemedText style={{ fontSize: 12, color: '#047857' }}>oficiales</ThemedText>
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.r20,
    borderWidth: 1,
    padding: Spacing.sixteen,
    marginBottom: Spacing.sixteen,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
  metricCell: {
    flex: 1,
    borderRadius: Radius.r16,
    borderWidth: 1,
    padding: Spacing.twelve,
    justifyContent: 'space-between',
    minHeight: 84,
  },
  cellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fontFamily.medium,
  },
  cellValue: {
    fontSize: Typography.sizes.h2,
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.four,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.twelve,
  },
});
