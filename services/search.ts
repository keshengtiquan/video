export interface SearchResult {
  name: string;
  pic: string;
  url: string;
  downUrl?: string;
  source: string;
  vodLang?: string;
  vodYear?: string;
  vodDuration?: string;
  vodDoubanScore?: string;
  typeName?: string;
}

export interface SourceError {
  source: string;
  error: string;
}

export async function searchFromSource(
  source: string,
  query: string,
  timeout = 10000,
): Promise<{ results: SearchResult[]; error?: SourceError }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `${source}?ac=videolist&wd=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        results: [],
        error: { source, error: `HTTP ${response.status}` },
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            data = JSON.parse(match[0]);
          } catch {
            return { results: [], error: { source, error: "解析响应失败" } };
          }
        } else {
          return { results: [], error: { source, error: "解析响应失败" } };
        }
      }
    }

    if (data.code !== 1 || !Array.isArray(data.list)) {
      return { results: [], error: { source, error: "数据格式错误" } };
    }

    const results: SearchResult[] = data.list.map((item: any) => ({
      name: item.vod_name || item.name || "",
      pic: item.vod_pic || item.pic || "",
      url: item.vod_play_url || item.url || "",
      downUrl: item.vod_down_url || item.downUrl || "",
      source,
      vodLang: item.vod_lang || "",
      vodYear: item.vod_year || "",
      vodDuration: item.vod_duration || "",
      vodDoubanScore: item.vod_douban_score || "",
      typeName: item.type_name || "",
    }));

    return { results };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { results: [], error: { source, error: "请求超时" } };
    }
    return {
      results: [],
      error: { source, error: error.message || "网络错误" },
    };
  }
}

export async function searchFromAllSources(
  sources: string[],
  query: string,
): Promise<{ results: SearchResult[]; errors: SourceError[] }> {
  const responses = await Promise.all(
    sources.map((source) => searchFromSource(source, query)),
  );

  const results: SearchResult[] = [];
  const errors: SourceError[] = [];

  responses.forEach((response) => {
    results.push(...response.results);
    if (response.error) {
      errors.push(response.error);
    }
  });

  return { results, errors };
}
