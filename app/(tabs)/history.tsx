import {
  clearPlayHistory,
  getPlayHistory,
  PlayHistoryItem,
  removePlayHistory,
} from "@/utils/history";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const router = useRouter();

  const loadHistory = async () => {
    const data = await getPlayHistory();
    setHistory(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert("清空历史记录", "确定要清空所有播放历史吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          await clearPlayHistory();
          loadHistory();
        },
      },
    ]);
  };

  const handleRemoveItem = async (id: string) => {
    await removePlayHistory(id);
    loadHistory();
  };

  const handlePlay = (item: PlayHistoryItem) => {
    router.push({
      pathname: "/play",
      params: {
        name: item.name,
        url: item.url,
        pic: item.pic || "",
        sourceIndex: item.sourceIndex,
        episodeIndex: item.episodeIndex,
      },
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }: { item: PlayHistoryItem }) => {
    const date = new Date(item.timestamp);
    const dateString = `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handlePlay(item)}
      >
        {item.pic ? (
          <Image source={{ uri: item.pic }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.noCover]}>
            <FontAwesome name="film" size={24} color="#ccc" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name || "未知视频"}
          </Text>
          <Text style={styles.subInfo} numberOfLines={1}>
            第{item.episodeIndex + 1}集 · 观看到 {formatTime(item.currentTime)}
          </Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <FontAwesome name="trash-o" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {history.length > 0 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearText}>清空历史</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome
              name="history"
              size={48}
              color="#ddd"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>暂无播放历史</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: "#ff3b30",
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cover: {
    width: 80,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  noCover: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  subInfo: {
    fontSize: 13,
    color: "#007aff",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
  },
});
