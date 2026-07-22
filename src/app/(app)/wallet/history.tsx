import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { walletService } from '@/services/walletService';

export default function WalletHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id;

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const txs = await walletService.getTransactions(userId);
      setTransactions(txs);
    } catch (e) {
      console.warn('Error fetching transaction history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return colorPalette.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'publish_question':
        return '📌 Publicación de Ejercicio';
      case 'accept_answer':
        return '🏆 Solución Aceptada';
      case 'admin_grant':
        return '🎁 Bonificación Admin';
      case 'admin_refund':
        return '💸 Reembolso Admin';
      default:
        return type;
    }
  };

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
          <View style={{ flex: 1, alignItems: 'center', marginRight: 60 }}>
            <ThemedText style={[styles.headerTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
              Historial de Transacciones
            </ThemedText>
          </View>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorPalette.primary} />
          }
          ListEmptyComponent={
            !loading ? (
              <Card style={styles.emptyCard}>
                <ThemedText style={{ fontSize: 32, marginBottom: Spacing.twelve }}>💸</ThemedText>
                <ThemedText style={{ fontFamily: Typography.fontFamily.medium, color: colorPalette.textSecondary, textAlign: 'center' }}>
                  Aún no tienes movimientos registrados en tu cuenta.
                </ThemedText>
              </Card>
            ) : (
              <Card style={{ padding: Spacing.twenty, alignItems: 'center' }}>
                <ThemedText style={{ color: colorPalette.textSecondary }}>Cargando historial...</ThemedText>
              </Card>
            )
          }
          renderItem={({ item }) => {
            const isIncoming = item.receiver_id === user?.id;
            const sign = isIncoming ? '+' : '-';
            const amountColor = isIncoming ? '#10B981' : colorPalette.accent;

            return (
              <Card style={styles.txCard}>
                <View style={styles.txHeader}>
                  <ThemedText style={{ fontSize: 10, color: colorPalette.textSecondary }}>
                    {new Date(item.created_at).toLocaleString()}
                  </ThemedText>
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <ThemedText style={{ fontSize: 9, fontFamily: Typography.fontFamily.medium, color: getStatusColor(item.status) }}>
                      {getStatusLabel(item.status)}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={[styles.txTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
                  {item.question_title}
                </ThemedText>

                <ThemedText style={{ fontSize: 11, color: colorPalette.textSecondary, marginTop: Spacing.four }}>
                  {getTransactionTypeLabel(item.transaction_type)}
                </ThemedText>

                <View style={[styles.divider, { backgroundColor: colorPalette.border }]} />

                <View style={styles.txFooter}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 10, color: colorPalette.textSecondary }}>
                      De: <ThemedText style={{ fontFamily: Typography.fontFamily.medium, color: colorPalette.text }}>{item.sender_name}</ThemedText>
                    </ThemedText>
                    <ThemedText style={{ fontSize: 10, color: colorPalette.textSecondary, marginTop: 2 }}>
                      Para: <ThemedText style={{ fontFamily: Typography.fontFamily.medium, color: colorPalette.text }}>{item.receiver_name}</ThemedText>
                    </ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 16, fontFamily: Typography.fontFamily.bold, color: amountColor }}>
                    {sign}🪙{item.amount}
                  </ThemedText>
                </View>
              </Card>
            );
          }}
        />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: Spacing.four,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 15,
  },
  listContent: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
    gap: Spacing.sixteen,
  },
  emptyCard: {
    padding: Spacing.thirtyTwo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  txCard: {
    padding: Spacing.sixteen,
    borderWidth: 1,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.eight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.two,
    borderRadius: Radius.r8,
    gap: Spacing.four,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txTitle: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.twelve,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
