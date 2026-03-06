import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

interface ApifyVideoResult {
  platformVideoId: string;
  title?: string;
  description?: string;
  tags: string[];
  url: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: number;
  publishedAt?: Date;
}

// Apify actor IDs per platform (verified via Apify API)
const ACTORS: Record<string, string> = {
  youtube: "streamers/youtube-channel-scraper",
  tiktok: "clockworks/free-tiktok-scraper",
  instagram: "apify/instagram-post-scraper",
};

/**
 * Scrape all videos from a creator's channel on a given platform.
 * Returns normalized video data regardless of platform.
 */
export async function scrapeChannel(
  platform: string,
  handle: string
): Promise<ApifyVideoResult[]> {
  const actorId = ACTORS[platform];
  if (!actorId) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const input = buildInput(platform, handle);
  console.log(`Starting Apify actor ${actorId} for ${platform}:${handle}`);

  const run = await client.actor(actorId).call(input, {
    waitSecs: 600, // Wait up to 10 minutes
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log(`Apify returned ${items.length} items for ${platform}:${handle}`);

  return items.map((item: any) => normalizeVideo(platform, item));
}

function buildInput(platform: string, handle: string): Record<string, any> {
  switch (platform) {
    case "youtube": {
      // Handle both @handle and full URL formats
      const channelUrl = handle.startsWith("http")
        ? handle
        : `https://www.youtube.com/${handle.startsWith("@") ? handle : "@" + handle}`;
      return {
        startUrls: [{ url: channelUrl }],
        maxResults: 5000,
        sortBy: "date",
      };
    }
    case "tiktok":
      return {
        profiles: [handle.replace("@", "")],
        resultsPerPage: 5000,
      };
    case "instagram": {
      const username = handle.replace("@", "").replace(/\/$/, "");
      return {
        username: [username],
        resultsLimit: 5000,
      };
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function normalizeVideo(platform: string, item: any): ApifyVideoResult {
  switch (platform) {
    case "youtube":
      return {
        platformVideoId: item.id || item.videoId || extractYouTubeId(item.url),
        title: item.title,
        description: item.description,
        tags: item.tags || item.hashtags || [],
        url: item.url || `https://www.youtube.com/watch?v=${item.id || item.videoId}`,
        thumbnailUrl: item.thumbnailUrl || item.thumbnail,
        viewCount: item.viewCount || item.views || 0,
        likeCount: item.likeCount || item.likes || 0,
        commentCount: item.commentCount || item.comments || 0,
        duration: item.duration,
        publishedAt: item.uploadDate
          ? new Date(item.uploadDate)
          : item.publishedAt
          ? new Date(item.publishedAt)
          : undefined,
      };

    case "tiktok":
      return {
        platformVideoId: item.id || String(item.videoId),
        title: item.text || item.description,
        description: item.text || item.description,
        tags: item.hashtags?.map((h: any) => (typeof h === "string" ? h : h.name)) || [],
        url: item.webVideoUrl || item.url || `https://www.tiktok.com/@${item.authorMeta?.name}/video/${item.id}`,
        thumbnailUrl: item.covers?.default || item.videoMeta?.coverUrl,
        viewCount: item.playCount || item.views || 0,
        likeCount: item.diggCount || item.likes || 0,
        commentCount: item.commentCount || item.comments || 0,
        duration: item.videoMeta?.duration,
        publishedAt: item.createTime
          ? new Date(item.createTime * 1000)
          : item.createTimeISO
          ? new Date(item.createTimeISO)
          : undefined,
      };

    case "instagram": {
      // Handle all IG post types: photo, video, reel, carousel (sidecar)
      const shortCode = item.shortCode || item.code || item.id;
      const caption = item.caption || item.text || item.description || "";
      // Extract hashtags from caption if not provided
      const hashtagsFromCaption = caption.match(/#[\w]+/g) || [];
      const hashtags = item.hashtags || item.tags || hashtagsFromCaption;

      return {
        platformVideoId: shortCode || String(item.id),
        title: caption.substring(0, 200),
        description: caption,
        tags: hashtags.map((h: any) => (typeof h === "string" ? h.replace("#", "") : h.name || h)),
        url: item.url || item.postUrl || `https://www.instagram.com/p/${shortCode}/`,
        thumbnailUrl: item.displayUrl || item.thumbnailUrl || item.imageUrl || item.previewUrl,
        viewCount: item.videoViewCount || item.videoPlayCount || item.playCount || item.likesCount || 0,
        likeCount: item.likesCount || item.likes || 0,
        commentCount: item.commentsCount || item.comments || 0,
        duration: item.videoDuration || item.duration,
        publishedAt: item.timestamp
          ? new Date(item.timestamp)
          : item.takenAt
          ? new Date(item.takenAt * 1000)
          : undefined,
      };
    }

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function extractYouTubeId(url: string): string {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || "unknown";
}
