import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, FlatList, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Bell, Sparkles } from 'lucide-react-native';
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
import { UserSummaryCard } from '@/components/ui/UserSummaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMarketplace } from '@/hooks/useMarketplace';
import { notificationService } from '@/services/notificationService';

export default function AlumnoHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState('inicio');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const {
    questions,
    categories,
    myQuestions,
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
    initialStatus: 'all',
    loadMyQuestions: true,
  });

  useFocusEffect(triggerFocusRefresh);

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

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn('Error marking notification as read:', e);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'publicar') {
      router.push('/(app)/alumno/publish' as any);
    } else {
      setActiveTab(tabId);
    }
  };

  // Compute total answers received across all alumno questions
  const answersReceivedCount = myQuestions.reduce((acc, q) => {
    const qAnswers = q.answers ? q.answers.filter((a: any) => a.deleted_at === null).length : 0;
    return acc + qAnswers;
  }, 0);

  const renderMarketplaceHeader = () => (
    <View style={styles.feedHeaderContainer}>
      {/* 1. User Summary Metrics Card */}
      <UserSummaryCard
        tokens={user?.tokens ?? 0}
        reputation={user?.reputation ?? 0}
        questionsCount={myQuestions.length}
        answersReceivedCount={answersReceivedCount}
        onPressWallet={() => router.push('/(app)/wallet' as any)}
      />

      {/* 2. Main CTA Button: Emphasis Fucsia with Plus Icon */}
      <Button
        variant="emphasis"
        title="Publicar Nuevo Ejercicio"
        onPress={() => router.push('/(app)/alumno/publish' as any)}
        style={styles.publishBtn}
      />

      {/* 3. Section: Mis Ejercicios Publicados */}
      <View style={styles.sectionHeaderRow}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}>
          Mis Ejercicios Publicados ({myQuestions.length})
        </ThemedText>
      </View>

      {myQuestions.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={36} color={theme.primary} />}
          title="Aún no has publicado ningún ejercicio"
          description="Publica tu primera consulta matemática para que la comunidad de docentes expertos comience a resolverla."
          actionButton={
            <Button
              variant="outline"
              title="Crear primera pregunta"
              onPress={() => router.push('/(app)/alumno/publish' as any)}
              size="sm"
            />
          }
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myQuestionsScroll}
        >
          {myQuestions.map((q) => (
            <Pressable
              key={q.id}
              style={({ pressed }) => [
                styles.myQuestionItem,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => router.push(`/(app)/question/${q.id}` as any)}
            >
              <ThemedText
                numberOfLines={2}
                style={[styles.myQuestionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}
              >
                {q.title}
              </ThemedText>
              <View style={styles.myQuestionMeta}>
                <ThemedText style={{ fontSize: Typography.sizes.caption, color: theme.primary, fontFamily: Typography.fontFamily.semiBold }}>
                  🪙 {q.reward_tokens} TK
                </ThemedText>
                <ThemedText style={{ fontSize: Typography.sizes.small, color: q.status === 'solved' ? '#10B981' : theme.textSecondary, fontFamily: Typography.fontFamily.medium }}>
                  {q.status === 'solved' ? '✓ Resuelto' : '⏳ Abierto'}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 4. Section: Marketplace Público */}
      <View style={[styles.sectionHeaderRow, { marginTop: Spacing.twentyFour }]}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: theme.text }]}>
          Marketplace Público
        </ThemedText>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar preguntas de la comunidad..."
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

      {/* Filters Options Grid */}
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
              { label: 'Todos los estados', value: 'all' },
              { label: 'Abiertas', value: 'open' },
              { label: 'Resueltas', value: 'solved' },
              { label: 'En revisión', value: 'in_review' },
            ]}
          />
        </View>
      </View>
    </View>
  );

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
            description="Te notificaremos en cuanto un docente proponga una solución a tus ejercicios."
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
      : 'U';

    const publishedCount = myQuestions.length;
    const solvedCount = myQuestions.filter(q => q.status === 'solved').length;
    const dateJoined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
              <ThemedText style={{ fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF' }}>
                {userInitials}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.sizes.h2, color: theme.text }}>
                {user?.full_name || 'Estudiante'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.body, color: theme.textSecondary }}>
                {user?.email || 'alumno@yachaiya.com'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.sizes.caption, color: theme.primary, marginTop: 4 }}>
                🎓 Rol: Alumno
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: theme.border }]} />

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: Typography.sizes.caption }}>Saldo Tokens</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                🪙 {user?.tokens ?? 0}
              </ThemedText>
            </View>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: Typography.sizes.caption }}>Reputación</ThemedText>
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
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>Preguntas realizadas:</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.medium, fontSize: 13 }}>{publishedCount}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>Ejercicios resueltos:</ThemedText>
              <ThemedText style={{ color: theme.text, fontFamily: Typography.fontFamily.medium, fontSize: 13 }}>{solvedCount}</ThemedText>
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
        description="No se encontraron preguntas en la categoría o filtros seleccionados."
        actionButton={
          <Button
            variant="outline"
            title="Publicar una pregunta"
            onPress={() => router.push('/(app)/alumno/publish' as any)}
            size="sm"
          />
        }
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
            {(activeTab === 'inicio' || activeTab === 'explorar') && (
              error ? (
                renderErrorComponent()
              ) : (
                <FlatList
                  data={questions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <QuestionCard
                      question={item}
                      onPress={() => router.push(`/(app)/question/${item.id}` as any)}
                    />
                  )}
                  ListHeaderComponent={renderMarketplaceHeader}
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
              )
            )}

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
  publishBtn: {
    marginBottom: Spacing.twentyFour,
    height: 48,
    borderRadius: Radius.r16,
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
  myQuestionsScroll: {
    paddingVertical: Spacing.four,
    gap: Spacing.twelve,
    marginBottom: Spacing.eight,
  },
  myQuestionItem: {
    width: 200,
    borderWidth: 1,
    borderRadius: Radius.r16,
    padding: Spacing.sixteen,
    justifyContent: 'space-between',
  },
  myQuestionTitle: {
    fontSize: Typography.sizes.body,
    lineHeight: 20,
    marginBottom: Spacing.twelve,
  },
  myQuestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
