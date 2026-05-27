import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Report, Transaction } from '@/types/auth';

export default function AdminHomeScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const [reports, setReports] = useState<Report[]>([
    {
      id: 'rep1',
      reporter_id: 'user-24',
      target_type: 'question',
      target_id: 'q5',
      reason: 'Contenido spam - Publicidad de un curso externo de pago.',
      status: 'pending',
      created_at: 'Hace 30 min',
    },
    {
      id: 'rep2',
      reporter_id: 'user-18',
      target_type: 'answer',
      target_id: 'ans-45',
      reason: 'Fórmula incorrecta y plagio descarado de otra web.',
      status: 'pending',
      created_at: 'Hace 2 horas',
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      sender_id: 'alumno-alex',
      receiver_id: 'docente-roberto',
      amount: 25,
      transaction_type: 'accept_answer',
      created_at: 'Hace 5 min',
    },
    {
      id: 'tx2',
      sender_id: 'alumno-clara',
      receiver_id: null,
      amount: 20,
      transaction_type: 'publish_question',
      created_at: 'Hace 10 min',
    }
  ]);

  const handleResolveReport = (reportId: string, resolution: 'resolved' | 'dismissed') => {
    setReports(prev => prev.map(rep => rep.id === reportId ? { ...rep, status: resolution } : rep));
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

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta de Resumen del Sistema */}
          <View style={styles.systemCard}>
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Reportes Pendientes</ThemedText>
              <ThemedText style={styles.walletValue}>⚠️ {reports.filter(r => r.status === 'pending').length} Alertas</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Transacciones Hoy</ThemedText>
              <ThemedText style={styles.walletValue}>🪙 450 Tokens</ThemedText>
            </View>
          </View>

          {/* Gestión de Reportes / Moderación */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Moderación de Contenido</ThemedText>
          </View>

          {reports.filter(r => r.status === 'pending').length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="small" themeColor="textSecondary">No hay reportes matemáticos por auditar. Todo limpio. 🎉</ThemedText>
            </ThemedView>
          ) : (
            reports.map((report) => (
              <ThemedView key={report.id} type="backgroundElement" style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeBadge}>
                    <ThemedText style={styles.badgeText}>Reporte: {report.target_type === 'question' ? 'Pregunta' : 'Respuesta'}</ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">{report.created_at}</ThemedText>
                </View>

                <ThemedText type="small" style={styles.reportReason}>
                  Motivo: {report.reason}
                </ThemedText>

                <View style={styles.reportActions}>
                  <Pressable
                    style={[styles.reportBtn, styles.dismissBtn, { borderColor: theme.backgroundSelected }]}
                    onPress={() => handleResolveReport(report.id, 'dismissed')}
                  >
                    <ThemedText style={styles.dismissBtnText}>Descartar</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.reportBtn, styles.resolveBtn]}
                    onPress={() => handleResolveReport(report.id, 'resolved')}
                  >
                    <ThemedText style={styles.resolveBtnText}>Penalizar / Borrar</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            ))
          )}

          {/* Historial de Transacciones */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Historial Global de Transacciones</ThemedText>
          </View>

          {transactions.map((tx) => {
            let desc = '';
            if (tx.transaction_type === 'publish_question') {
              desc = `Escrow: Alumno dedujo ${tx.amount} tokens para publicar ejercicio.`;
            } else if (tx.transaction_type === 'accept_answer') {
              desc = `Transferencia: Alumno transfirió ${tx.amount} tokens al Experto por solución aceptada.`;
            }

            return (
              <ThemedView key={tx.id} type="backgroundElement" style={styles.transactionCard}>
                <View style={styles.txHeader}>
                  <ThemedText type="smallBold">🪙 {tx.amount} Tokens</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{tx.created_at}</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
                  {desc}
                </ThemedText>
              </ThemedView>
            );
          })}

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
  transactionCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
