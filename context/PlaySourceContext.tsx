import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@selected_play_sources";

const playSources = [
  { label: "豆瓣", value: "https://dbzy.tv/api.php/provide/vod" },
  { label: "如意", value: "https://cj.rycjapi.com/api.php/provide/vod" },
  { label: "暴风", value: "https://bfzyapi.com/api.php/provide/vod" },
  { label: "天涯", value: "https://tyyszy.com/api.php/provide/vod" },
  { label: "小猫咪", value: "https://zy.xmm.hk/api.php/provide/vod" },
  { label: "360", value: "https://360zy.com/api.php/provide/vod" },
  { label: "卧龙", value: "https://wolongzyw.com/api.php/provide/vod" },
  { label: "极速", value: "https://jszyapi.com/api.php/provide/vod" },
  { label: "魔抓", value: "https://www.mdzyapi.com/api.php/provide/vod" },
  { label: "最大", value: "https://api.zuidapi.com/api.php/provide/vod" },
  { label: "百度云", value: "https://api.apibdzy.com/api.php/provide/vod" },
  { label: "无尽", value: "https://api.wujinapi.me/api.php/provide/vod" },
  { label: "量子", value: "https://cj.lziapi.com/api.php/provide/vod" },
];

interface PlaySourceContextType {
  selectedSources: string[];
  toggleSource: (value: string) => void;
  sources: typeof playSources;
}

const PlaySourceContext = createContext<PlaySourceContextType | null>(null);

export function PlaySourceProvider({ children }: { children: ReactNode }) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSelectedSources();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSelectedSources(selectedSources);
    }
  }, [selectedSources, isLoaded]);

  const loadSelectedSources = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedSources(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load selected sources:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSelectedSources = async (sources: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    } catch (e) {
      console.error("Failed to save selected sources:", e);
    }
  };

  const toggleSource = (value: string) => {
    setSelectedSources((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <PlaySourceContext.Provider value={{ selectedSources, toggleSource, sources: playSources }}>
      {children}
    </PlaySourceContext.Provider>
  );
}

export function usePlaySources() {
  const context = useContext(PlaySourceContext);
  if (!context) {
    throw new Error("usePlaySources must be used within PlaySourceProvider");
  }
  return context;
}
