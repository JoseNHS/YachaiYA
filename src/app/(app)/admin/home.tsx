import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Report, Transaction, UserProfile } from '@/types/auth';
import { adminService } from '@/services/adminService';
import { walletService } from '@/services/walletService';

export default function AdminHomeScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    try {
      // 1. Cargar reportes de moderación
      const reps = await adminService.getReports();
      setReports(reps);

      // 2. Cargar transacciones globales
      const txs = await walletService.getTransactions();
      setTransactions(txs);

      // 3. Cargar perfiles de usuarios para gestión
      const users = await adminService.getProfiles();
      setProfiles(users);
    } catch (e) {
      console.error('Error al cargar datos del administrador:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleResolveReport = async (reportId: string, action: 'penalize' | 'dismiss') => {
    setActionLoading(reportId);
    setSuccessMsg(null);
    try {
      await adminService.resolveReport(reportId, action);
      setSuccessMsg(action === 'penalize' 
        ? '✓ Contenido sancionado/eliminado y reputación del infractor penalizada.'
        : '✓ Reporte descartado sin penalizaciones.'
      );
      await loadData(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error('Error al moderar reporte:', e);
      alert(e.message || 'Error al procesar la moderación.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantTokens = async (userId: string, fullName: string, amount: number) => {
    setActionLoading(userId);
    setSuccessMsg(null);
    try {
      await adminService.grantTokens(userId, amount);
      setSuccessMsg(`✓ Se otorgaron 🪙 ${amount} tokens a ${fullName} correctamente.`);
      await loadData(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error('Error al otorgar tokens:', e);
      alert(e.message || 'Error al otorgar tokens.');
    } finally {
      setActionLoading(null);
    }
  };

  const getTxDescription = (tx: Transaction) => {
    switch (tx.transaction_type) {
      case 'publish_question':
        return `Deducción por publicación de ejercicio (Escrow).`;
      case 'accept_answer':
        return `Pago transferido a docente por solución aceptada.`;
      case 'admin_grant':
        return `Abono otorgado por la administración de YachaiYa.`;
      case 'admin_refund':
        return `Reembolso de tokens por cancelación de ejercicio.`;
      default:
        return `Transacción de tokens.`;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Premium */}
        <ThemedView type="backgroundElement" style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Panel de Control General</ThemedText>
            <ThemedText type="smallBold" style={styles.profileName}>Administrador YachaiYa 🛡️</ThemedText>
          </View>
          <Pressable style={styles.logoutBtn} onPress={signOut}>
            <ThemedText style={styles.logoutText}>Salir</ThemedText>
          </Pressable>
        </ThemedView>

        {loading ? (
          <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
            }
          >
            {/* Tarjeta de Resumen del Sistema */}
            <View style={styles.systemCard}>
              <View style={styles.walletStat}>
                <ThemedText style={styles.walletLabel}>Reportes Pendientes</ThemedText>
                <ThemedText style={styles.walletValue}>⚠️ {reports.filter(r => r.status === 'pending').length} Alertas</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.walletStat}>
                <ThemedText style={styles.walletLabel}>Transacciones Totales</ThemedText>
                <ThemedText style={styles.walletValue}>🪙 {transactions.reduce((sum, tx) => sum + tx.amount, 0)} Tokens</ThemedText>
              </View>
            </View>

            {successMsg && (
              <View style={styles.successBanner}>
                <ThemedText style={styles.successBannerText}>{successMsg}</ThemedText>
              </View>
            )}

            {/* Gestión de Reportes / Moderación */}
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Moderación de Contenido</ThemedText>
            </View>

            {reports.filter(r => r.status === 'pending').length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                  No hay reportes matemáticos por auditar. Todo limpio. 🎉
                </ThemedText>
              </ThemedView>
            ) : (
              reports.filter(r => r.status === 'pending').map((report) => (
                <ThemedView key={report.id} type="backgroundElement" style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportTypeBadge}>
                      <ThemedText style={styles.badgeText}>Reporte: {report.target_type === 'question' ? 'Pregunta' : 'Respuesta'}</ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {new Date(report.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>

                  <ThemedText type="small" style={styles.reportReason}>
                    Motivo: {report.reason}
                  </ThemedText>

                  <View style={styles.reportActions}>
                    <Pressable
                      style={[styles.reportBtn, styles.dismissBtn, { borderColor: theme.backgroundSelected }]}
                      onPress={() => handleResolveReport(report.id, 'dismiss')}
                      disabled={actionLoading !== null}
                    >
                      <ThemedText style={styles.dismissBtnText}>Descartar</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.reportBtn, styles.resolveBtn]}
                      onPress={() => handleResolveReport(report.id, 'penalize')}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === report.id ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <ThemedText style={styles.resolveBtnText}>Penalizar / Borrar</ThemedText>
                      )}
                    </Pressable>
                  </View>
                </ThemedView>
              ))
            )}

            {/* Gestión de Usuarios */}
            <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Gestión de Usuarios</ThemedText>
            </View>

            {profiles.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <ThemedText type="small" themeColor="textSecondary">No se encontraron usuarios en la base de datos.</ThemedText>
              </ThemedView>
            ) : (
              profiles.map((profile) => (
                <ThemedView key={profile.id} type="backgroundElement" style={styles.userCard}>
                  <View style={styles.userInfoRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="smallBold">{profile.full_name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{profile.email} • Rol: {profile.role}</ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText type="smallBold" style={{ color: '#10B981' }}>🪙 {profile.tokens} Tokens</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">⭐ {profile.reputation} Rep.</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.userActionsRow}>
                    <Pressable
                      style={[styles.grantActionBtn, { borderColor: theme.backgroundSelected }]}
                      onPress={() => handleGrantTokens(profile.id, profile.full_name, 50)}
                      disabled={actionLoading !== null}
                    >
                      <ThemedText style={styles.grantActionText}>+50 Tokens</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.grantActionBtn, { borderColor: theme.backgroundSelected }]}
                      onPress={() => handleGrantTokens(profile.id, profile.full_name, 100)}
                      disabled={actionLoading !== null}
                    >
                      <ThemedText style={styles.grantActionText}>+100 Tokens</ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
              ))
            )}

            {/* Historial de Transacciones */}
            <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Historial Global de Transacciones</ThemedText>
            </View>

            {transactions.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <ThemedText type="small" themeColor="textSecondary">No hay registros de transacciones.</ThemedText>
              </ThemedView>
            ) : (
              transactions.map((tx) => (
                <ThemedView key={tx.id} type="backgroundElement" style={styles.transactionCard}>
                  <View style={styles.txHeader}>
                    <ThemedText type="smallBold" style={{ color: '#10B981' }}>🪙 {tx.amount} Tokens</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
                    {getTxDescription(tx)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 10, marginTop: 4 }}>
                    Origen: {tx.sender_id || 'Servidor/Escrow'} • Destino: {tx.receiver_id || 'Servidor/Escrow'}
                  </ThemedText>
                </ThemedView>
              ))
            )}

          </ScrollView>
        )}
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
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  systemCard: {
    backgroundColor: '#10B981',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  walletStat: {
    flex: 1,
    alignItems: 'center',
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: Spacing.one,
  },
  walletValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  successBanner: {
    backgroundColor: '#10B98115',
    borderColor: '#10B98140',
    borderWidth: 1.5,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  successBannerText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  reportCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    gap: Spacing.three,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTypeBadge: {
    backgroundColor: '#EF444415',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  reportReason: {
    fontSize: 13,
    lineHeight: 18,
  },
  reportActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  reportBtn: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    borderWidth: 1.5,
  },
  dismissBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resolveBtn: {
    backgroundColor: '#EF4444',
  },
  resolveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    gap: Spacing.three,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  grantActionBtn: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  grantActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  transactionCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: Spacing.two,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
