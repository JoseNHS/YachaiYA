import { useState, useEffect, useCallback } from 'react';
import { questionService, GetQuestionsOptions } from '@/services/questionService';
import { Question, Category } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

export interface UseMarketplaceOptions {
  initialStatus?: string;
  initialDifficulty?: string;
  initialOrderBy?: string;
  authorId?: string;
  loadMyQuestions?: boolean;
}

export function useMarketplace(options: UseMarketplaceOptions = {}) {
  const { user, refreshProfile } = useAuth();
  const userId = user?.id;

  // Feed states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(options.initialDifficulty || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(options.initialStatus || 'all');
  const [orderBy, setOrderBy] = useState<string>(options.initialOrderBy || 'recent');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch categories once
  useEffect(() => {
    let active = true;
    const fetchCats = async () => {
      try {
        const cats = await questionService.getCategories();
        if (active) setCategories(cats);
      } catch (e) {
        console.warn('Error loading categories:', e);
      }
    };
    fetchCats();
    return () => {
      active = false;
    };
  }, []);

  const loadData = useCallback(async (
    pageNum: number,
    searchVal: string,
    catId: string | null,
    diff: string,
    stat: string,
    order: string,
    append = false
  ) => {
    if (!userId) return;
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      if (pageNum === 1 && options.loadMyQuestions) {
        const mine = await questionService.getQuestions({ authorId: userId, limit: 10 });
        setMyQuestions(mine);
      }

      const queryOpts: GetQuestionsOptions = {
        page: pageNum,
        limit: 20,
        search: searchVal || undefined,
        category: catId || undefined,
        difficulty: diff === 'all' ? undefined : diff,
        status: stat === 'all' ? undefined : stat,
        orderBy: order as any,
        authorId: options.authorId || undefined,
      };

      const feed = await questionService.getQuestions(queryOpts);

      if (append) {
        setQuestions(prev => {
          const combined = [...prev, ...feed];
          const unique = combined.filter((q, index, self) =>
            self.findIndex(t => t.id === q.id) === index
          );
          return unique;
        });
      } else {
        setQuestions(feed);
      }

      setHasMore(feed.length >= 20);
    } catch (e) {
      console.error('Error loading marketplace feed in hook:', e);
      setError(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [userId, options.authorId, options.loadMyQuestions]);

  // Debounced query logic
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadData(1, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy, false);
    }, 450);
    return () => clearTimeout(delay);
  }, [search, selectedCategory, selectedDifficulty, selectedStatus, orderBy, refreshTrigger, loadData]);

  const triggerFocusRefresh = useCallback(() => {
    refreshProfile().catch(err => console.warn('Error refreshing profile on focus:', err));
    setRefreshTrigger(prev => prev + 1);
  }, [refreshProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refreshProfile();
    } catch (e) {
      console.warn('Error refreshing profile on pull:', e);
    }
    await loadData(1, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy, false);
  }, [refreshProfile, loadData, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy, true);
  }, [loading, loadingMore, hasMore, page, loadData, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy]);

  const handleCategoryPress = useCallback((catId: string | null) => {
    setSelectedCategory(catId);
  }, []);

  const handleRetry = useCallback(() => {
    setPage(1);
    loadData(1, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy, false);
  }, [loadData, search, selectedCategory, selectedDifficulty, selectedStatus, orderBy]);

  return {
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
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedStatus,
    setSelectedStatus,
    orderBy,
    setOrderBy,
    page,
    hasMore,
    onRefresh,
    handleLoadMore,
    handleCategoryPress,
    handleRetry,
    triggerFocusRefresh,
  };
}
