import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@video_play_history";

export interface PlayHistoryItem {
  id: string;
  name: string;
  url: string;
  pic?: string;
  sourceIndex: number;
  episodeIndex: number;
  currentTime: number;
  timestamp: number;
}

export async function getPlayHistory(): Promise<PlayHistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
}

export async function savePlayHistory(item: PlayHistoryItem): Promise<void> {
  try {
    const history = await getPlayHistory();
    const existingIndex = history.findIndex((h) => h.id === item.id);

    // If it already exists, update it and move to top
    if (existingIndex >= 0) {
      history.splice(existingIndex, 1);
    }

    history.unshift(item);

    // Limit history size to 100 items to avoid memory/storage issues
    if (history.length > 100) {
      history.pop();
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    console.log(`[进度保存] ${item.name} - 第${item.episodeIndex + 1}集 - ${Math.floor(item.currentTime)}秒`);
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

export async function getPlayHistoryById(
  id: string,
): Promise<PlayHistoryItem | null> {
  const history = await getPlayHistory();
  return history.find((h) => h.id === id) || null;
}

export async function removePlayHistory(id: string): Promise<void> {
  try {
    const history = await getPlayHistory();
    const newHistory = history.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to remove history", e);
  }
}

export async function clearPlayHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
