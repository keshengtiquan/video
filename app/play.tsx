import { useEventListener } from "expo";
import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSaveProgress } from "../hooks/useSaveProgress";

interface Episode {
  name: string;
  url: string;
}

interface PlaySource {
  name: string;
  episodes: Episode[];
}

export interface ParsedPlayInfo {
  sources: PlaySource[];
  rawUrl: string;
}

function parsePlayUrl(url: string): ParsedPlayInfo {
  if (!url) {
    return { sources: [], rawUrl: url };
  }

  const sourceParts = url.split("$$$");
  const sources: PlaySource[] = [];

  sourceParts.forEach((part, index) => {
    if (!part.trim()) return;

    const hashParts = part.split("#");
    const firstPart = hashParts[0];
    let sourceName = `源${index + 1}`;
    let episodes: Episode[] = [];

    if (firstPart.includes("$") && !firstPart.startsWith("http")) {
      const dollarIndex = firstPart.indexOf("$");
      // 忽略原始源名，强制使用"播放源1"、"播放源2"
      sourceName = `播放源${index + 1}`;
      const firstEpName = firstPart.substring(0, dollarIndex);
      const firstUrl = firstPart.substring(dollarIndex + 1);

      if (firstUrl.startsWith("http")) {
        episodes.push({ name: firstEpName, url: firstUrl });
      }

      for (let i = 1; i < hashParts.length; i++) {
        const epPart = hashParts[i];
        const epDollarIndex = epPart.indexOf("$");
        if (epDollarIndex > 0) {
          const epName = epPart.substring(0, epDollarIndex);
          const epUrl = epPart.substring(epDollarIndex + 1);
          if (epUrl.startsWith("http")) {
            episodes.push({ name: epName, url: epUrl });
          }
        }
      }
    } else {
      for (let i = 0; i < hashParts.length; i++) {
        const epPart = hashParts[i];
        const epDollarIndex = epPart.indexOf("$");
        if (epDollarIndex > 0) {
          const epName = epPart.substring(0, epDollarIndex);
          const epUrl = epPart.substring(epDollarIndex + 1);
          if (epUrl.startsWith("http")) {
            episodes.push({ name: epName, url: epUrl });
          }
        }
      }
    }

    if (episodes.length > 0) {
      sources.push({ name: sourceName, episodes });
    }
  });

  return { sources, rawUrl: url };
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    url?: string;
    pic?: string;
    source?: string;
    sourceIndex?: string;
    episodeIndex?: string;
  }>();

  const parsedInfo = useMemo(() => {
    return parsePlayUrl(params.url || "");
  }, [params.url]);

  const [currentSourceIndex, setCurrentSourceIndex] = useState(
    params.sourceIndex ? parseInt(params.sourceIndex, 10) : 0,
  );
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    params.episodeIndex ? parseInt(params.episodeIndex, 10) : 0,
  );
  const { width } = useWindowDimensions();

  // 如果是直接视频URL（不是编码格式），创建一个虚拟的播放源
  const effectiveSources = useMemo(() => {
    if (parsedInfo.sources.length === 0 && params.url?.startsWith("http")) {
      return [
        {
          name: "播放源1",
          episodes: [{ name: "第1集", url: params.url || "" }],
        },
      ];
    }
    return parsedInfo.sources;
  }, [parsedInfo, params.url]);

  const currentSource = effectiveSources[currentSourceIndex];
  const currentEpisode = currentSource?.episodes[currentEpisodeIndex];
  const videoHeight = (width / 16) * 9;

  const player = useVideoPlayer(currentEpisode?.url || "", (player) => {
    player.play();
  });
  useEventListener(player, "statusChange", ({ status }) => {
    console.log("Player status changed: ", status);
  });

  // 视频信息，用于保存进度
  // 用 name + url 作为 id，同一部剧只保存一条记录
  const videoInfo = useMemo(
    () =>
      currentEpisode && params.name
        ? {
            id: `${params.name}-${params.url}`,
            name: params.name,
            url: params.url || currentEpisode.url,
            pic: params.pic,
            sourceIndex: currentSourceIndex,
            episodeIndex: currentEpisodeIndex,
          }
        : null,
    [
      params.name,
      params.pic,
      currentEpisode,
      params.url,
      currentSourceIndex,
      currentEpisodeIndex,
    ],
  );

  const { restoreProgress } = useSaveProgress(player, videoInfo);

  // 加载历史进度
  useEffect(() => {
    if (player && videoInfo) {
      restoreProgress();
    }
  }, [player, videoInfo, restoreProgress]);

  const handleEpisodePress = (index: number) => {
    setCurrentEpisodeIndex(index);
  };

  const handleSourcePress = (index: number) => {
    setCurrentSourceIndex(index);
    setCurrentEpisodeIndex(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scrollView}>
        {/* 视频播放器 */}
        <View style={[styles.videoContainer, { height: videoHeight }]}>
          {currentEpisode ? (
            <VideoView
              player={player}
              style={styles.video}
              fullscreenOptions={{ orientation: "landscape", enable: true }}
            />
          ) : (
            <View style={styles.noVideo}>
              <Text style={styles.noVideoText}>暂无播放地址</Text>
            </View>
          )}
        </View>

        {/* 视频信息 */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{params.name}</Text>
          {currentEpisode && (
            <Text style={styles.currentEpisode}>
              当前集: {currentEpisode.name}
            </Text>
          )}
        </View>

        {/* 播放源切换 */}
        {parsedInfo.sources.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>播放源</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sourceList}>
                {parsedInfo.sources.map((source, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sourceItem,
                      index === currentSourceIndex && styles.sourceItemActive,
                    ]}
                    onPress={() => handleSourcePress(index)}
                  >
                    <Text
                      style={[
                        styles.sourceText,
                        index === currentSourceIndex && styles.sourceTextActive,
                      ]}
                    >
                      {source.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 剧集列表 */}
        {currentSource && currentSource.episodes.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>剧集列表</Text>
            <View style={styles.episodeGrid}>
              {currentSource.episodes.map((ep, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.episodeItem,
                    index === currentEpisodeIndex && styles.episodeItemActive,
                  ]}
                  onPress={() => handleEpisodePress(index)}
                >
                  <Text
                    style={[
                      styles.episodeText,
                      index === currentEpisodeIndex && styles.episodeTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {ep.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 播放地址 */}
        {currentEpisode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>播放地址</Text>
            <Text style={styles.playUrl} numberOfLines={3}>
              {currentEpisode.url}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width: "100%",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  noVideoText: {
    color: "#666",
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  currentEpisode: {
    fontSize: 14,
    color: "#007aff",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sourceList: {
    flexDirection: "row",
    gap: 8,
  },
  sourceItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  sourceItemActive: {
    backgroundColor: "#007aff",
  },
  sourceText: {
    fontSize: 14,
    color: "#666",
  },
  sourceTextActive: {
    color: "#fff",
  },
  episodeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  episodeItem: {
    width: "23%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  episodeItemActive: {
    backgroundColor: "#007aff",
  },
  episodeText: {
    fontSize: 13,
    color: "#666",
  },
  episodeTextActive: {
    color: "#fff",
  },
  playUrl: {
    fontSize: 12,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 6,
  },
});
