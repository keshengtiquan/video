import { Movie, DoubanResponse, MovieCategory } from "@/types/movie";

const BASE_URL = "https://movie.douban.com/j/search_subjects";

export async function fetchMovies(
  type: "movie" | "tv",
  tag: MovieCategory,
  pageSize: number,
  page: number
): Promise<{ movies: Movie[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    type,
    tag,
    sort: "recommend",
    page_limit: String(pageSize),
    page_start: String(page * pageSize),
  });

  const response = await fetch(`${BASE_URL}?${params}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: DoubanResponse = await response.json();

  return {
    movies: data.subjects || [],
    hasMore: data.subjects?.length === pageSize,
  };
}
