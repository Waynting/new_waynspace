import { Metadata } from 'next'

export const siteConfig = {
  name: 'Waynspace',
  title: 'Waynspace - Wei-Ting Liu 的個人網站',
  description: '台大資管大二學生的個人部落格，記錄大學生活、ABConvert 實習、Next.js 開發筆記、街頭攝影與讀書心得。',
  url: 'https://waynspace.com',
  author: {
    name: 'Wei-Ting Liu',
    email: 'wayntingliu@gmail.com',
    instagram: '@waiting_941208',
  },
  links: {
    github: 'https://github.com/Waynting',
    linkedin: 'https://www.linkedin.com/in/waiting5928/',
    instagram: 'https://www.instagram.com/waiting_941208/',
  },
  keywords: [
    '個人部落格',
    '台大資管',
    '攝影筆記',
    '技術隨筆',
    '筆記與心得',
    '生活隨筆',
    'Wei-Ting Liu',
    '劉威廷',
  ],
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/blog-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/blog-image.jpg`],
    creator: siteConfig.author.instagram,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
