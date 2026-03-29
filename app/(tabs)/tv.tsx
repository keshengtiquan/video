import { MovieList } from "@/components/movie/MovieList";
import { useMovieList } from "@/hooks/useMovieList";
import { Movie, MovieCategory } from "@/types/movie";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import { useRouter } from "expo-router";

const categories: MovieCategory[] = [
  "热门",
  "美剧",
  "英剧",
  "韩剧",
  "日剧",
  "国产剧",
  "综艺",
  "港剧",
  "日本动画",
  "纪录片",
];

function MovieTabContent({
  tag,
  isActive,
}: {
  tag: MovieCategory;
  isActive: boolean;
}) {
  const router = useRouter();
  const {
    movies,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    onLoadMore,
  } = useMovieList("tv", tag, isActive);

  const handleMoviePress = useCallback((movie: Movie) => {
    router.push({ pathname: "/search-result", params: { query: movie.title } });
  }, [router]);

  return (
    <View style={styles.page}>
      <MovieList
        movies={movies}
        loading={loading}
        refreshing={refreshing}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
        onMoviePress={handleMoviePress}
      />
    </View>
  );
}

export default function TVScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      scrollEnabled
      style={styles.tabBar}
      tabStyle={styles.tab}
      indicatorStyle={styles.indicator}
      labelStyle={styles.label}
      activeColor="#000"
      inactiveColor="#999"
    />
  );

  const renderScene = ({
    route,
  }: {
    route: { key: string; title: string };
  }) => <MovieTabContent tag={route.title as MovieCategory} isActive={true} />;

  return (
    <TabView
      style={styles.container}
      renderTabBar={renderTabBar}
      navigationState={{
        index,
        routes: categories.map((c) => ({ key: c, title: c })),
      }}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderScene={renderScene}
      lazy
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabBar: { backgroundColor: "#fff", elevation: 0, shadowOpacity: 0 },
  tab: { paddingHorizontal: 0, width: 80 },
  indicator: { backgroundColor: "#000", height: 3 },
  label: { fontSize: 16, fontWeight: "bold" },
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  loader: { marginTop: 100 },
});
