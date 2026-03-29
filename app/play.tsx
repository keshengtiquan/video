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
  console.log("原始播放地址:", url);

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
      const firstUrl = firstPart.substring(dollarIndex + 1);

      if (firstUrl.startsWith("http")) {
        episodes.push({ name: sourceName, url: firstUrl });
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

  console.log("解析后的播放源:", JSON.stringify(sources, null, 2));

  return { sources, rawUrl: url };
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    url?: string;
    pic?: string;
    source?: string;
  }>();

  const parsedInfo = useMemo(() => {
    return parsePlayUrl(params.url || "");
  }, [params.url]);

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const { width } = useWindowDimensions();

  const currentSource = parsedInfo.sources[currentSourceIndex];
  const currentEpisode = currentSource?.episodes[currentEpisodeIndex];
  const videoHeight = (width / 16) * 9;

  const player = useVideoPlayer(currentEpisode?.url || "");

  useEffect(() => {
    return () => {
      if (player && typeof player.release === "function") {
        player.release();
      }
    };
  }, [player]);

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
