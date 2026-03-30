import type { VideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  getPlayHistoryById,
  savePlayHistory,
  type PlayHistoryItem,
} from "../utils/history";

interface VideoInfo {
  id: string;
  name: string;
  url: string;
  pic?: string;
  sourceIndex: number;
  episodeIndex: number;
}

const THROTTLE_INTERVAL = 5000; // 5秒

export function useSaveProgress(
  player: VideoPlayer | null,
  videoInfo: VideoInfo | null,
) {
  const lastSaveTimeRef = useRef<number>(0);
  const videoInfoRef = useRef(videoInfo);
  const playerRef = useRef(player);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // 保持引用最新
  videoInfoRef.current = videoInfo;
  playerRef.current = player;

  const saveProgress = useCallback(async () => {
    const info = videoInfoRef.current;
    const p = playerRef.current;
    if (!info || !p) return;

    let currentTime: number;
    try {
      currentTime = p.currentTime;
    } catch {
      return;
    }
    if (currentTime <= 0) return;

    const item: PlayHistoryItem = {
      id: info.id,
      name: info.name,
      url: info.url,
      pic: info.pic,
      sourceIndex: info.sourceIndex,
      episodeIndex: info.episodeIndex,
      currentTime,
      timestamp: Date.now(),
    };

    await savePlayHistory(item);
  }, []);

  // 节流保存
  const scheduleSave = useCallback(() => {
    const now = Date.now();
    if (now - lastSaveTimeRef.current < THROTTLE_INTERVAL) {
      return;
    }
    lastSaveTimeRef.current = now;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveProgress();
    }, 500); // 延迟一点执行，确保播放已稳定
  }, [saveProgress]);

  // 立即保存（防止重复调用）
  const immediateSave = useCallback(() => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    lastSaveTimeRef.current = Date.now();

    saveProgress().finally(() => {
      isSavingRef.current = false;
    });
  }, [saveProgress]);

  // 恢复进度
  const restoreProgress = useCallback(async () => {
    if (!player || !videoInfo) return;
    console.log(`[恢复进度] videoInfo:`, JSON.stringify(videoInfo));
    const history = await getPlayHistoryById(videoInfo.id);
    if (history) {
      console.log(
        `[历史记录] ${history.name} - 第${history.episodeIndex + 1}集 - 找到进度: ${Math.floor(history.currentTime)}秒, url: ${history.url}`,
      );
      if (history.currentTime > 10) {
        player.currentTime = history.currentTime;
      }
    } else {
      console.log(`[历史记录] 未找到 ${videoInfo.name} 的播放记录`);
    }
  }, [player, videoInfo]);

  // 监听播放状态变化
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener(
      "playingChange",
      ({ isPlaying }) => {
        if (!isPlaying) {
          immediateSave();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [player, immediateSave]);

  // 播放过程中每8秒自动保存
  useEffect(() => {
    if (!player) return;

    const intervalId = setInterval(() => {
      if (player.playing) {
        scheduleSave();
      }
    }, THROTTLE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [player, scheduleSave]);

  // App 生命周期
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        immediateSave();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [immediateSave]);

  // 卸载时保存
  useEffect(() => {
    return () => {
      immediateSave();
    };
  }, [immediateSave]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return { restoreProgress };
}
