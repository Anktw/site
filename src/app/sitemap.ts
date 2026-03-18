import { readdir, stat } from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://unkit.site";

const STATIC_ROUTES: Array<{
  route: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { route: "/", priority: 1, changeFrequency: "weekly" },
  { route: "/about", priority: 0.6, changeFrequency: "monthly" },
  { route: "/projects", priority: 1, changeFrequency: "weekly" },
  { route: "/writings", priority: 1, changeFrequency: "weekly" },
  { route: "/readings", priority: 0.9, changeFrequency: "monthly" },
  { route: "/resume", priority: 0.8, changeFrequency: "monthly" },
  { route: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

function getBaseUrl(): string {
  const candidate = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL;
  return candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
}

async function readDirectoryNames(directoryPath: string): Promise<string[]> {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function getFileLastModified(filePath: string): Promise<Date> {
  try {
    const fileStats = await stat(filePath);
    return fileStats.mtime;
  } catch {
    return new Date();
  }
}

async function getProjectRoutes(): Promise<MetadataRoute.Sitemap> {
  const projectsRoot = path.join(process.cwd(), "src", "app", "(centered)", "projects");
  const groups = ["(projects)", "(archived)"];

  const groupedSlugs = await Promise.all(
    groups.map(async (group) => {
      const groupPath = path.join(projectsRoot, group);
      const slugs = await readDirectoryNames(groupPath);

      return Promise.all(
        slugs.map(async (slug) => {
          const pagePath = path.join(groupPath, slug, "page.mdx");
          const lastModified = await getFileLastModified(pagePath);

          return {
            url: `${getBaseUrl()}/projects/${slug}`,
            lastModified,
            changeFrequency: "monthly" as const,
            priority: 0.7,
          };
        })
      );
    })
  );

  return groupedSlugs.flat();
}

async function getWritingRoutes(): Promise<MetadataRoute.Sitemap> {
  const writingsRoot = path.join(process.cwd(), "src", "app", "(centered)", "writings", "(post)");
  const slugs = await readDirectoryNames(writingsRoot);

  return Promise.all(
    slugs.map(async (slug) => {
      const pagePath = path.join(writingsRoot, slug, "page.mdx");
      const lastModified = await getFileLastModified(pagePath);

      return {
        url: `${getBaseUrl()}/writings/${slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    })
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  const [projectEntries, writingEntries] = await Promise.all([
    getProjectRoutes(),
    getWritingRoutes(),
  ]);

  return [...staticEntries, ...projectEntries, ...writingEntries];
}