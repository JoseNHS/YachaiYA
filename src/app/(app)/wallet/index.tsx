import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { walletService } from '@/services/walletService';

export default function WalletScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id;

  const loadWalletData = useCallback(async () => {
    if (!userId) return;
    try {
      const txs = await walletService.getTransactions(userId);
      setTransactions(txs);
    } catch (e) {
      console.warn('Error loading transactions for wallet:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await loadWalletData();
  };

  // Calulate total income and expenses
  const calculateStats = () => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(tx => {
      if (tx.status !== 'completed' && tx.status !== 'pending') return;
      if (tx.receiver_id === user?.id) {
        income += tx.amount;
      } else if (tx.sender_id === user?.id) {
        expenses += tx.amount;
      }
    });
    return { income, expenses };
  };

  const { income, expenses } = calculateStats();
  const recentTransactions = transactions.slice(0, 3);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colorPalette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorPalette.backgroundElement, borderBottomColor: colorPalette.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ThemedText style={[styles.backBtnText, { color: colorPalette.primary, fontFamily: Typography.fontFamily.semiBold }]}>
              ← Volver
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.headerTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
            Mi Billetera
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorPalette.primary} />
          }
        >
          {/* Balance Card */}
          <Card style={styles.balanceCard}>
            <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Saldo Disponible
            </ThemedText>
            <ThemedText style={[styles.balanceValue, { color: colorPalette.text, fontFamily: Typography.fontFamily.bold }]}>
              🪙 {user?.tokens ?? 0} <ThemedText style={{ fontSize: 20, color: colorPalette.textSecondary }}>Tokens</ThemedText>
            </ThemedText>

            <View style={[styles.divider, { backgroundColor: colorPalette.border }]} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 11 }}>Reputación</ThemedText>
                <ThemedText style={{ fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: colorPalette.accent, marginTop: 2 }}>
                  ⭐ {user?.reputation ?? 0} Puntos
                </ThemedText>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: colorPalette.border }]} />
              <View style={styles.statCol}>
                <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 11 }}>Rol Activo</ThemedText>
                <ThemedText style={{ fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: colorPalette.primary, marginTop: 2, textTransform: 'capitalize' }}>
                  {user?.role === 'alumno' ? '🎒 Alumno' : '👨‍🏫 Docente'}
                </ThemedText>
              </View>
            </View>
          </Card>

          {/* Cashflow Card (Income vs Expenses) */}
          <Card style={styles.cashflowCard}>
            <View style={styles.cashflowItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Total Ingresos</ThemedText>
              <ThemedText style={{ color: '#10B981', fontFamily: Typography.fontFamily.semiBold, fontSize: 18, marginTop: 2 }}>
                +🪙 {income}
              </ThemedText>
            </View>
            <View style={[styles.verticalDivider, { backgroundColor: colorPalette.border }]} />
            <View style={styles.cashflowItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Total Gastos</ThemedText>
              <ThemedText style={{ color: colorPalette.accent, fontFamily: Typography.fontFamily.semiBold, fontSize: 18, marginTop: 2 }}>
                -🪙 {expenses}
              </ThemedText>
            </View>
          </Card>

          {/* Recargar tokens Próximamente */}
          <Card style={[styles.reloadCard, { borderColor: colorPalette.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: colorPalette.text }}>
                Recargar Tokens
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: 11, color: colorPalette.textSecondary, marginTop: 2 }}>
                Obtén más tokens para publicar más preguntas y obtener respuestas más rápido.
              </ThemedText>
            </View>
            <View style={[styles.soonBadge, { backgroundColor: colorPalette.border }]}>
              <ThemedText style={{ fontSize: 9, fontFamily: Typography.fontFamily.semiBold, color: colorPalette.textSecondary }}>
                PRÓXIMAMENTE
              </ThemedText>
            </View>
          </Card>

          {/* Recent Activity section */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
              Actividad Reciente
            </ThemedText>
            {transactions.length > 3 && (
              <Pressable onPress={() => router.push('/(app)/wallet/history' as any)}>
                <ThemedText style={{ fontSize: 12, color: colorPalette.primary, fontFamily: Typography.fontFamily.medium }}>
                  Ver todo
                </ThemedText>
              </Pressable>
            )}
          </View>

          {loading ? (
            <Card style={{ padding: Spacing.twenty, alignItems: 'center' }}>
              <ThemedText style={{ color: colorPalette.textSecondary }}>Cargando transacciones...</ThemedText>
            </Card>
          ) : recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <ThemedText style={{ fontSize: 24, marginBottom: Spacing.eight }}>💸</ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.medium, color: colorPalette.textSecondary, textAlign: 'center' }}>
                Sin transacciones registradas todavía
              </ThemedText>
            </Card>
          ) : (
            <View style={{ gap: Spacing.twelve }}>
              {recentTransactions.map((tx) => {
                const isIncoming = tx.receiver_id === user?.id;
                const sign = isIncoming ? '+' : '-';
                const amountColor = isIncoming ? '#10B981' : colorPalette.accent;

                return (
                  <Card key={tx.id} style={styles.txItem}>
                    <View style={{ flex: 1 }}>
                      <ThemedText numberOfLines={1} style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: 13, color: colorPalette.text }}>
                        {tx.question_title}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 10, color: colorPalette.textSecondary, marginTop: 2 }}>
                        {tx.transaction_type === 'publish_question' ? '📌 Ejercicio Publicado' : '🏆 Solución Aceptada'}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 9, color: colorPalette.textSecondary, marginTop: 4 }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <ThemedText style={{ fontSize: 15, fontFamily: Typography.fontFamily.bold, color: amountColor }}>
                      {sign}🪙{tx.amount}
                    </ThemedText>
                  </Card>
                );
              })}
            </View>
          )}

          {transactions.length > 0 && (
            <Button
              variant="outline"
              title="Historial de Transacciones Completo"
              onPress={() => router.push('/(app)/wallet/history' as any)}
              style={{ marginTop: Spacing.eight }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: Spacing.four,
  },
  backBtnText: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 15,
  },
  scrollContent: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
    gap: Spacing.sixteen,
  },
  balanceCard: {
    padding: Spacing.twenty,
    borderWidth: 1,
  },
  balanceValue: {
    fontSize: 32,
    marginTop: Spacing.eight,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sixteen,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 32,
  },
  cashflowCard: {
    padding: Spacing.sixteen,
    flexDirection: 'row',
    borderWidth: 1,
  },
  cashflowItem: {
    flex: 1,
    alignItems: 'center',
  },
  reloadCard: {
    padding: Spacing.sixteen,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  soonBadge: {
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: Radius.r8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.eight,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
  },
  emptyCard: {
    padding: Spacing.twentyFour,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  txItem: {
    padding: Spacing.sixteen,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});
