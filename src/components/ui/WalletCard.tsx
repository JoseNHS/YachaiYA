import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Coins, Award, ArrowUpRight } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export interface WalletCardProps {
  onPressWallet?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ onPressWallet }) => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {/* Tarjeta Tokens (Celeste) */}
      <Pressable
        onPress={onPressWallet}
        style={({ pressed }) => [
          styles.statCard,
          {
            backgroundColor: '#F0F9FF',
            borderColor: '#BAE6FD',
          },
          Shadows.xs,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Coins size={18} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.statLabel, { color: '#0284C7' }]}>
            Tokens
          </ThemedText>
        </View>
        <ThemedText style={[styles.statValue, { color: '#0369A1' }]}>
          {user?.tokens ?? 0}
        </ThemedText>
        <View style={styles.cardFooter}>
          <ThemedText style={[styles.footerText, { color: '#0284C7' }]}>
            Billetera
          </ThemedText>
          <ArrowUpRight size={14} color="#0284C7" />
        </View>
      </Pressable>

      {/* Tarjeta Reputación (Fucsia) */}
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: '#FDF2F8',
            borderColor: '#FBCFE8',
          },
          Shadows.xs,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.accent }]}>
            <Award size={18} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.statLabel, { color: '#BE185D' }]}>
            Reputación
          </ThemedText>
        </View>
        <ThemedText style={[styles.statValue, { color: '#9D174D' }]}>
          {user?.reputation ?? 0} <ThemedText style={{ fontSize: 13, color: '#BE185D' }}>pts</ThemedText>
        </ThemedText>
        <View style={styles.cardFooter}>
          <ThemedText style={[styles.footerText, { color: '#BE185D' }]}>
            {user?.role === 'alumno' ? 'Estudiante' : 'Docente'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.twelve,
    marginBottom: Spacing.sixteen,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.r20,
    borderWidth: 1,
    padding: Spacing.sixteen,
    justifyContent: 'space-between',
    minHeight: 112,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fontFamily.medium,
  },
  statValue: {
    fontSize: Typography.sizes.h1,
    fontFamily: Typography.fontFamily.bold,
    marginVertical: Spacing.four,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: Typography.sizes.small,
    fontFamily: Typography.fontFamily.medium,
  },
});
