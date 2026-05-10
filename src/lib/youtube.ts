const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

export type YTVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
};

export async function searchNASAVideos(
  query: string,
  apiKey: string,
  maxResults = 10
): Promise<YTVideo[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: `NASA ${query}`,
    channelId: "UCLA_DiR1FfKNvjuUpBHmylQ", // NASA official YouTube
    type: "video",
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(`${YT_API_BASE}/search?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("YouTube API error");
  const data = await res.json();

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}
