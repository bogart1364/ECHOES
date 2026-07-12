import type { MetadataRoute } from "next";
import { getAllStories } from "@/lib/stories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://echoes-drab.vercel.app";

  const staticRoutes = ["", "/record", "/competitions", "/signal"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  let storyRoutes: MetadataRoute.Sitemap = [];
  try {
    const stories = await getAllStories();
    storyRoutes = stories.map((s) => ({
      url: `${base}/story/${s.id}`,
      lastModified: s.createdAt,
    }));
  } catch {
    // If the blob store isn't reachable at build time, ship the static routes only.
  }

  return [...staticRoutes, ...storyRoutes];
}
