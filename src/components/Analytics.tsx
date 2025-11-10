'use client'

import Script from 'next/script'

export function Analytics() {
  // 優先使用環境變數，如果沒有則使用預設值
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-E3R4L3Z9SR'

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
