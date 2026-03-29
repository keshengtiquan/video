import { useState, useCallback, useRef, useEffect } from "react";
import { Movie, MovieCategory } from "@/types/movie";
import { fetchMovies } from "@/services/douban";

const PAGE_SIZE = 20;

// 全局 Set，追踪已加载过的标签
const loadedTags = new Set<string>();

interface UseMovieListResult {
  movies: Movie[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onRefresh: () => Promise<void>;
  onLoadMore: () => void;
}

export function useMovieList(
  type: "movie" | "tv",
  tag: MovieCategory,
  isActive: boolean
): UseMovieListResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(0);
  const prevActiveRef = useRef(false);
  const tagRef = useRef(tag);
  const typeRef = useRef(type);

  // 加载电影列表
  const loadMovies = useCallback(
    async (isRefresh: boolean) => {
      if (loadingMore || refreshing) return;

      try {
        setError(null);

        if (isRefresh) {
          pageRef.current = 0;
          setHasMore(true);
        }

        const result = await fetchMovies(typeRef.current, tagRef.current, PAGE_SIZE, pageRef.current);

        if (isRefresh) {
          setMovies(result.movies);
        } else {
          setMovies((prev) => [...prev, ...result.movies]);
        }

        setHasMore(result.hasMore);
        pageRef.current += 1;
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      }
    },
    [loadingMore, refreshing]
  );

  // 只在 isActive 从 false 变为 true 时加载数据
  useEffect(() => {
    if (!isActive) {
      prevActiveRef.current = false;
      return;
    }

    // 标签激活过就不再加载（数据已缓存在组件状态中）
    if (prevActiveRef.current) return;
    prevActiveRef.current = true;

    // 如果该标签已从其他 Tab 加载过，使用缓存数据，不再请求
    if (loadedTags.has(tag)) return;
    loadedTags.add(tag);

    setLoading(true);
    loadMovies(true).finally(() => setLoading(false));
  }, [isActive, tag, loadMovies]);

  // 同步 tagRef
  useEffect(() => {
    tagRef.current = tag;
  }, [tag]);

  // 同步 typeRef
  useEffect(() => {
    typeRef.current = type;
  }, [type]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMovies(true);
    setRefreshing(false);
  }, [loadMovies]);

  // 上拉加载更多
  const onLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadMovies(false).finally(() => setLoadingMore(false));
  }, [loadMovies, loadingMore, hasMore]);

  return {
    movies,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    onLoadMore,
  };
}
