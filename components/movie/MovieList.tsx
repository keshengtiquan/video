import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { Movie } from "@/types/movie";
import { MovieCard } from "./MovieCard";

interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onMoviePress?: (movie: Movie) => void;
}

export function MovieList({
  movies,
  loading,
  refreshing,
  loadingMore,
  error,
  hasMore,
  onRefresh,
  onLoadMore,
  onMoviePress,
}: MovieListProps) {
  if (loading && movies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (error && movies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.retryText}>点击重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Movie }) => (
    <MovieCard movie={item} onPress={onMoviePress} />
  );

  const renderFooter = () => {
    if (!loadingMore && !hasMore && movies.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>没有更多了</Text>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#999" />
          <Text style={styles.footerText}>加载更多...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={movies}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007aff" />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>暂无数据</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  errorText: {
    fontSize: 14,
    color: "#f56c6c",
    marginBottom: 12,
  },
  retryText: {
    fontSize: 14,
    color: "#007aff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
});
