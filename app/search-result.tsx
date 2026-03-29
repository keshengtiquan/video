import { usePlaySources } from "@/context/PlaySourceContext";
import { searchFromAllSources, SearchResult, SourceError } from "@/services/search";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const { selectedSources, sources } = usePlaySources();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [errors, setErrors] = useState<SourceError[]>([]);
  const [loading, setLoading] = useState(false);

  const getSourceLabel = (url: string) => {
    const source = sources.find((s) => s.value === url);
    return source?.label || url;
  };

  const doSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    const { results: allResults, errors: searchErrors } = await searchFromAllSources(selectedSources, query);

    setResults(allResults);
    setErrors(searchErrors);
    setLoading(false);
  };

  const hasSearchedRef = useRef(false);

  useEffect(() => {
    if (params.query && !hasSearchedRef.current) {
      hasSearchedRef.current = true;
      doSearch(params.query);
    }
  }, [params.query]);

  const handleItemPress = (item: SearchResult) => {
    router.push({
      pathname: "/play",
      params: {
        name: item.name,
        url: item.url,
        pic: item.pic,
        source: item.source,
      },
    });
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.pic }} style={styles.resultPic} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={2}>
          {item.name}
        </Text>
        {(item.vodLang || item.vodDuration || item.vodYear) && (
          <Text style={styles.resultMeta}>
            {[item.vodLang, item.vodDuration, item.vodYear].filter(Boolean).join(' · ')}
          </Text>
        )}
        <Text style={styles.resultSource}>
          来源: {getSourceLabel(item.source)}
        </Text>
      </View>
      <FontAwesome name="play-circle" size={28} color="#007aff" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{params.query}</Text>
          <View style={styles.placeholder} />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007aff" />
            <Text style={styles.loadingText}>
              正在搜索 {selectedSources.length} 个播放源...
            </Text>
          </View>
        )}

        {!loading && results.length === 0 && params.query && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>未找到相关结果</Text>
            <Text style={styles.emptySubText}>
              请尝试其他关键词或检查播放源设置
            </Text>
          </View>
        )}

        {!loading && errors.length > 0 && results.length > 0 && (
          <View style={styles.errorBanner}>
            <FontAwesome name="exclamation-triangle" size={16} color="#f5a623" />
            <Text style={styles.errorText}>
              {errors.length} 个源失败: {errors.map(e => getSourceLabel(e.source)).join(", ")}
            </Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.source}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.resultList}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                共找到 {results.length} 个结果
              </Text>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  placeholder: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  resultList: {
    padding: 16,
  },
  resultCount: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ffe4b5",
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#f5a623",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  resultPic: {
    width: 60,
    height: 80,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  resultSource: {
    fontSize: 12,
    color: "#999",
  },
});
