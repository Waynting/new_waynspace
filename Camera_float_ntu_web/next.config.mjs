/** @type {import('next').NextConfig} */
const nextConfig = {
  // 部署配置
  // 實際部署在: https://camera-float-ntu-web.waynspace.com/ (根域名，不需要 basePath)
  // 如果部署在子路徑（如 https://www.waynspace.com/camera-float-ntu），則需要設置環境變數 NEXT_PUBLIC_BASE_PATH=/camera-float-ntu
  // R2 图片 CDN: https://camera-float-ntu.waynspace.com

  // basePath 配置：
  // - 如果部署在根域名（如 https://camera-float-ntu-web.waynspace.com/），不需要設置 basePath（不設置 NEXT_PUBLIC_BASE_PATH）
  // - 如果部署在子路徑（如 https://www.waynspace.com/camera-float-ntu），需要設置環境變數 NEXT_PUBLIC_BASE_PATH=/camera-float-ntu
  // 可以通過環境變數 NEXT_PUBLIC_BASE_PATH 來控制，如果未設置則不設置 basePath
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH } : {}),

  images: {
    // path 會自動根據 basePath 調整，不需要手動設置
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'photos.waynspace.com', // 相机漂流计划照片存储
      },
      {
        protocol: 'https',
        hostname: 'camera.waynspace.com', // 备选域名
      },
      {
        protocol: 'https',
        hostname: 'gallery.waynspace.com', // 备选域名
      },
      {
        protocol: 'https',
        hostname: 'camera-float-ntu.waynspace.com', // 子域名
      },
      {
        protocol: 'https',
        hostname: 'camara-float-ntu.waynspace.com', // 拼写变体（兼容）
      },
      {
        protocol: 'https',
        hostname: 'img.waynspace.com', // 图片域名
      },
    ],
    // 优化图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 启用现代图片格式
    formats: ['image/avif', 'image/webp'],
    // 最小化图片优化时间
    minimumCacheTTL: 60,
  },
};

export default nextConfig;

