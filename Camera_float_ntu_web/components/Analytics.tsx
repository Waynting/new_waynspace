"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Google Analytics 配置
// 使用主站的 GA4 Measurement ID，这样可以在一个地方查看所有数据
// 设置环境变量 NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX（主站的 GA ID）
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// 初始化 Google Analytics（备用方法，如果 layout.tsx 中的初始化失败）
// 注意：GA4 代码已经在 layout.tsx 的 head 中初始化，这里作为备用
export function initGA() {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) {
    return;
  }

  // 如果已经初始化（在 layout.tsx 中），跳过
  if ('gtag' in window && typeof window.gtag === 'function' && window.dataLayer) {
    return;
  }

  // 初始化 dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // 定义 gtag 函数
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // 配置
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });

  // 加载 gtag.js 脚本（如果还没加载）
  if (!document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
}

// 内部组件：处理 searchParams
function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    // 确保 GA 已初始化（备用）
    if (!('gtag' in window) || typeof window.gtag !== 'function') {
      initGA();
    }

    // 追踪页面浏览
    // Next.js 的 usePathname() 在设置了 basePath 时会自动包含 basePath
    // 例如：如果 basePath 是 /camera-float-ntu，pathname 会是 /camera-float-ntu/...
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    // 使用 requestAnimationFrame 确保在下一帧执行，给 gtag 时间初始化
    const frameId = requestAnimationFrame(() => {
      if ('gtag' in window && typeof window.gtag === 'function') {
        window.gtag("config", GA_MEASUREMENT_ID, {
          page_path: url,
          send_page_view: true,
        });
      } else if (window.dataLayer) {
        // 如果 gtag 还没加载，将事件推入 dataLayer
        window.dataLayer.push({
          event: 'page_view',
          page_path: url,
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, searchParams]);

  return null;
}

// 页面浏览追踪组件
export function Analytics() {
  // 如果未配置 GA ID，不渲染任何内容
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}

// 声明全局类型
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}


