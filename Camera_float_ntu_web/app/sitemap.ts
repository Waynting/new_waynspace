import { MetadataRoute } from "next";
import { listFolders } from "@/lib/r2";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://camera-float-ntu-web.waynspace.com";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // 基础页面
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}${basePath}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}${basePath}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 动态添加相簿页面
  try {
    const folders = await listFolders();
    if (folders && folders.length > 0) {
      // 添加主相簿列表
      for (const folder of folders) {
        routes.push({
          url: `${baseUrl}${basePath}/folder/${folder}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });

        // 尝试获取子文件夹
        try {
          const subFolders = await listFolders({ prefix: `${folder}/` });
          if (subFolders && subFolders.length > 0) {
            for (const subFolder of subFolders) {
              routes.push({
                url: `${baseUrl}${basePath}/folder/${folder}/${subFolder}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.6,
              });
            }
          }
        } catch (error) {
          // 忽略子文件夹获取错误
          console.warn(`Failed to get subfolders for ${folder}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}

