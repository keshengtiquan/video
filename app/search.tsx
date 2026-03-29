import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SEARCH_HISTORY_KEY = "@search_history";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 加载搜索历史
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error("加载搜索历史失败:", error);
      }
    };
    loadHistory();
  }, []);

  // 保存搜索历史
  const saveHistory = async (history: string[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("保存搜索历史失败:", error);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      const newHistory = prev.includes(query)
        ? prev
        : [query, ...prev].slice(0, 10);
      saveHistory(newHistory);
      return newHistory;
    });

    router.push({ pathname: "/search-result", params: { query } });
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("清空搜索历史失败:", error);
    }
  };

  const removeHistoryItem = (item: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter((i) => i !== item);
      saveHistory(newHistory);
      return newHistory;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <FontAwesome
              name="search"
              size={16}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索电影、电视剧..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <FontAwesome name="times-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
            <Text style={styles.searchButton}>搜索</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearText}>清空</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleSearch(item)}
              >
                <FontAwesome name="history" size={14} color="#999" />
                <Text style={styles.historyText}>{item}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeHistoryItem(item)}
                >
                  <FontAwesome name="times" size={14} color="#ccc" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyHistory}>暂无搜索历史</Text>
            }
          />
        </View>
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
  searchBar: {
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
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  searchButton: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  clearText: {
    fontSize: 12,
    color: "#999",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  deleteButton: {
    padding: 4,
  },
  emptyHistory: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 40,
  },
});
