import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, FlatList, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, Bell, Sparkles, CheckCircle2, Clock } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, MaxContentWidth } from '@/constants/theme';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionSkeleton } from '@/components/questions/QuestionSkeleton';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Header } from '@/components/ui/Header';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { DocenteSummaryCard } from '@/components/ui/DocenteSummaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMarketplace } from '@/hooks/useMarketplace';
import { answerService } from '@/services/answerService';
import { notificationService } from '@/services/notificationService';
import { Answer } from '@/types/auth';

export default function DocenteHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState('inicio');
  const [myAnswers, setMyAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const {
    questions,
    categories,
    loading,
    loadingMore,
    refreshing,
    error,
    search,
    setSearch,
    selectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedStatus,
    setSelectedStatus,
    orderBy,
    setOrderBy,
    onRefresh,
    handleLoadMore,
    handleCategoryPress,
    handleRetry,
    triggerFocusRefresh,
    hasMore,
  } = useMarketplace({
    initialStatus: 'open',
  });

  useFocusEffect(triggerFocusRefresh);

  // Fetch teacher's notifications when tab active
  useEffect(() => {
    if (activeTab === 'notificaciones' && user?.id) {
      setLoadingNotifications(true);
      notificationService.getNotifications(user.id)
        .then((list: any[]) => {
          setNotifications(list);
          setLoadingNotifications(false);
        })
        .catch((err: any) => {
          console.warn('Error loading notifications:', err);
          setLoadingNotifications(false);
        });
    }
  }, [activeTab, user?.id]);

  // Fetch teacher's proposed answers when tab active or on screen load
  useEffect(() => {
    if (user?.id) {
      setLoadingAnswers(true);
      answerService.getAnswersByUser(user.id)
        .then(ans => {
          setMyAnswers(ans);
          setLoadingAnswers(false);
        })
        .catch(err => {
          console.warn('Error fetching answers by user:', err);
          setLoadingAnswers(false);
        });
    }
  }, [user?.id, activeTab]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn('Error marking notification as read:', e);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const acceptedAnswersCount = myAnswers.filter(a => a.is_accepted).length;

  const renderFeedHeader = (showTitleOnly: boolean = false) => (
    <View style={styles.feedHeaderContainer}>
      {!showTitleOnly && (
        <DocenteSummaryCard
          tokens={user?.tokens ?? 0}
          reputation={user?.reputation ?? 0}
          answersCount={myAnswers.length}
          acceptedAnswersCount={acceptedAnswersCount}
          onPressWallet={() => router.push('/(app)/wallet' as any)}
        />
      )}

      {/* Section Title */}
      <View style={styles.sectionHeaderRow}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}>
          {showTitleOnly ? 'Marketplace de Ejercicios' : 'Ejercicios Abiertos para Resolver'}
        </ThemedText>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar ejercicios para resolver..."
      />

      {/* Category Horizontal Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsScroll}
      >
        <Chip
          label="Todas"
          selected={selectedCategory === null}
          onPress={() => handleCategoryPress(null)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={selectedCategory === cat.id}
            onPress={() => handleCategoryPress(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Filter Grid options */}
      <View style={styles.filterGrid}>
        <View style={styles.filterHalf}>
          <Select
            label="Dificultad"
            selectedValue={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
            options={[
              { label: 'Todas', value: 'all' },
              { label: 'Básica', value: 'Básica' },
              { label: 'Intermedia', value: 'Intermedia' },
              { label: 'Avanzada', value: 'Avanzada' },
              { label: 'Olímpica', value: 'Olimpiada' },
            ]}
          />
        </View>
        <View style={styles.filterHalf}>
          <Select
            label="Ordenar"
            selectedValue={orderBy}
            onValueChange={setOrderBy}
            options={[
              { label: 'Más recientes', value: 'recent' },
              { label: 'Mayor Recompensa', value: 'highest_reward' },
              { label: 'Menor Recompensa', value: 'lowest_reward' },
              { label: 'Más respuestas', value: 'most_answers' },
              { label: 'Mayor reputación', value: 'highest_reputation' },
            ]}
          />
        </View>
      </View>

      <View style={styles.filterGrid}>
        <View style={{ flex: 1 }}>
          <Select
            label="Estado"
            selectedValue={selectedStatus}
            onValueChange={setSelectedStatus}
            options={[
              { label: 'Solo Abiertas', value: 'open' },
              { label: 'Todos los estados', value: 'all' },
              { label: 'Resueltas', value: 'solved' },
              { label: 'En revisión', value: 'in_review' },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderInicio = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuestionCard
              question={item}
              onPress={() => router.push(`/(app)/question/${item.id}` as any)}
            />
          )}
          ListHeaderComponent={() => renderFeedHeader(false)}
          ListFooterComponent={renderFooterComponent}
          ListEmptyComponent={
            loading ? (
              <View style={styles.skeletonsContainer}>
                <QuestionSkeleton />
                <QuestionSkeleton />
                <QuestionSkeleton />
              </View>
            ) : (
              renderEmptyComponent()
            )
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderMarketplace = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuestionCard
              question={item}
              onPress={() => router.push(`/(app)/question/${item.id}` as any)}
            />
          )}
          ListHeaderComponent={() => renderFeedHeader(true)}
          ListFooterComponent={renderFooterComponent}
          ListEmptyComponent={
            loading ? (
              <View style={styles.skeletonsContainer}>
                <QuestionSkeleton />
                <QuestionSkeleton />
                <QuestionSkeleton />
              </View>
            ) : (
              renderEmptyComponent()
            )
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderRespuestas = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}>
          Mis Soluciones Propuestas ({myAnswers.length})
        </ThemedText>

        {loadingAnswers ? (
          <View style={{ paddingVertical: Spacing.thirtyTwo }}>
            <QuestionSkeleton />
          </View>
        ) : myAnswers.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={40} color={theme.primary} />}
            title="Aún no has propuesto soluciones"
            description="Explora los ejercicios abiertos del marketplace y propone soluciones de alta calidad para ganar tokens y reputación docente."
            actionButton={
              <Button
                variant="primary"
                title="Explorar Ejercicios"
                onPress={() => setActiveTab('inicio')}
                size="sm"
              />
            }
          />
        ) : (
          <View style={{ gap: Spacing.twelve }}>
            {myAnswers.map((ans) => (
              <Pressable
                key={ans.id}
                style={({ pressed }) => [
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => router.push(`/(app)/question/${ans.question_id}` as any)}
              >
                <Card style={[styles.answerHistoryCard, ans.is_accepted && { borderColor: '#10B981', borderWidth: 1.5 }]}>
                  <View style={styles.answerHistoryHeader}>
                    <ThemedText numberOfLines={1} style={{ fontFamily: Typography.fontFamily.semiBold, color: theme.text, flex: 1 }}>
                      {(ans as any).question_title || 'Ejercicio Resuelto'}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: theme.textSecondary }}>
                      {new Date(ans.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>

                  <ThemedText numberOfLines={2} style={{ fontSize: Typography.sizes.body, color: theme.textSecondary, marginTop: Spacing.eight, lineHeight: 20 }}>
                    {ans.content}
                  </ThemedText>

                  <View style={styles.answerHistoryFooter}>
                    {ans.is_accepted ? (
                      <View style={styles.statusBadgeAccepted}>
                        <CheckCircle2 size={14} color="#047857" style={{ marginRight: 4 }} />
                        <ThemedText style={{ fontSize: 12, color: '#047857', fontFamily: Typography.fontFamily.semiBold }}>
                          🏆 Solución Oficial Aceptada
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.statusBadgePending}>
                        <Clock size={14} color="#0284C7" style={{ marginRight: 4 }} />
                        <ThemedText style={{ fontSize: 12, color: '#0284C7', fontFamily: Typography.fontFamily.medium }}>
                          ⏳ Pendiente de Selección
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderNotificaciones = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}>
          Notificaciones ({notifications.filter(n => !n.is_read).length} sin leer)
        </ThemedText>

        {loadingNotifications ? (
          <Card style={{ padding: Spacing.twenty, alignItems: 'center' }}>
            <ThemedText style={{ color: theme.textSecondary }}>Cargando notificaciones...</ThemedText>
          </Card>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} color={theme.textSecondary} />}
            title="Sin alertas nuevas"
            description="Te notificaremos cuando un alumno acepte tus soluciones y ganes tokens de recompensa."
          />
        ) : (
          <View style={{ gap: Spacing.twelve }}>
            {notifications.map((notif) => (
              <Pressable
                key={notif.id}
                onPress={() => handleMarkAsRead(notif.id)}
              >
                <Card
                  style={[
                    styles.notificationCard,
                    !notif.is_read && { borderColor: theme.primary, borderWidth: 1.5, backgroundColor: 'rgba(108, 198, 255, 0.04)' }
                  ]}
                >
                  <View style={styles.notifHeader}>
                    <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: theme.text }}>
                      {notif.title}
                    </ThemedText>
                    {!notif.is_read && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                  <ThemedText style={{ fontSize: Typography.sizes.body, color: theme.textSecondary, marginTop: Spacing.four }}>
                    {notif.message}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 11, color: theme.textSecondary, marginTop: Spacing.eight }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </ThemedText>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPerfil = () => {
    const userInitials = user?.full_name
      ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'D';

    const proposedCount = myAnswers.length;
    const acceptedCount = acceptedAnswersCount;
    const dateJoined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.accent }]}>
              <ThemedText style={{ fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF' }}>
                {userInitials}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.sizes.h2, color: theme.text }}>
                {user?.full_name || 'Profesor'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.body, color: theme.textSecondary }}>
                {user?.email || 'docente@yachaiya.com'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.sizes.caption, color: theme.accent, marginTop: 4 }}>
                👨‍🏫 Rol: Docente / Experto
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: theme.border }]} />

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: Typography.sizes.caption }}>Balance Tokens</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                🪙 {user?.tokens ?? 0}
              </ThemedText>
            </View>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: Typography.sizes.caption }}>Reputación Docente</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                ⭐ {user?.reputation ?? 0}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: theme.border }]} />

          <View style={{ gap: Spacing.eight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>Miembro desde:</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.medium, fontSize: 13 }}>{dateJoined}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>Respuestas propuestas:</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.medium, fontSize: 13 }}>{proposedCount}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>Soluciones aceptadas:</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.medium, fontSize: 13 }}>{acceptedCount}</ThemedText>
            </View>
          </View>
        </Card>

        {/* Access to Wallet */}
        <Button
          variant="outline"
          title="💳 Ver Mi Billetera"
          onPress={() => router.push('/(app)/wallet' as any)}
          style={{ marginTop: Spacing.sixteen }}
        />

        <Button
          variant="danger"
          title="Cerrar Sesión"
          onPress={signOut}
          style={{ marginTop: Spacing.twenty }}
        />
      </ScrollView>
    );
  };

  const renderFooterComponent = () => {
    if (!hasMore) {
      return (
        <View style={styles.endOfFeedContainer}>
          <ThemedText style={{ color: theme.textSecondary, fontSize: Typography.sizes.caption }}>
            Has llegado al final del Marketplace
          </ThemedText>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <QuestionSkeleton />
        </View>
      );
    }
    return null;
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon={<Sparkles size={40} color={theme.primary} />}
        title="Sin ejercicios disponibles"
        description="No se encontraron preguntas abiertas en la categoría o filtros seleccionados."
      />
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <ThemedText style={styles.errorText}>No pudimos cargar los ejercicios del Marketplace.</ThemedText>
      <Button title="Reintentar" onPress={handleRetry} style={{ marginTop: Spacing.twelve }} />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onNotificationPress={() => handleTabChange('notificaciones')} />

        <View style={styles.centeredWrapper}>
          <View style={styles.content}>
            {activeTab === 'inicio' && (error ? renderErrorComponent() : renderInicio())}
            {activeTab === 'marketplace' && (error ? renderErrorComponent() : renderMarketplace())}
            {activeTab === 'respuestas' && renderRespuestas()}
            {activeTab === 'notificaciones' && renderNotificaciones()}
            {activeTab === 'perfil' && renderPerfil()}
          </View>

          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
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
  centeredWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.twelve,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
  },
  categoryChipsScroll: {
    paddingVertical: Spacing.four,
    marginTop: Spacing.twelve,
    marginBottom: Spacing.twelve,
    gap: Spacing.eight,
  },
  filterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.twelve,
    marginBottom: Spacing.eight,
  },
  filterHalf: {
    flex: 1,
  },
  skeletonsContainer: {
    gap: Spacing.twelve,
  },
  listContainer: {
    paddingHorizontal: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
  },
  feedHeaderContainer: {
    marginTop: Spacing.sixteen,
    marginBottom: Spacing.twelve,
  },
  endOfFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.twentyFour,
  },
  footerLoader: {
    marginVertical: Spacing.sixteen,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.twentyFour,
  },
  errorText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    color: '#EF4444',
  },
  profileCard: {
    padding: Spacing.twenty,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sixteen,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalDivider: {
    height: 1,
    marginVertical: Spacing.sixteen,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStatItem: {
    alignItems: 'center',
  },
  answerHistoryCard: {
    padding: Spacing.sixteen,
  },
  answerHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerHistoryFooter: {
    marginTop: Spacing.twelve,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: Radius.full,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: Radius.full,
  },
  notificationCard: {
    padding: Spacing.sixteen,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
