export interface Movie {
  id: number;
  title: string;
  rate: string;
  cover: string;
  url: string;
  playable: boolean;
}

export interface DoubanResponse {
  subjects: Movie[];
  total: number;
}

export type MovieCategory =
  | "热门"
  | "最新"
  | "豆瓣高分"
  | "经典"
  | "华语"
  | "欧美"
  | "动作"
  | "喜剧"
  | "爱情"
  | "科幻"
  | "悬疑"
  | "治愈"
  | "美剧"
  | "英剧"
  | "韩剧"
  | "日剧"
  | "国产剧"
  | "综艺"
  | "港剧"
  | "日本动画"
  | "纪录片";
