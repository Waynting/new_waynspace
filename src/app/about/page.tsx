import { Metadata } from 'next';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '關於我 - 劉威廷',
  description:
    '全端工程師，具 AI-native 思維，以 Next.js + TypeScript 打造資料驅動的產品。國立台灣大學資訊管理學系，雙主修創新領域學士學位學程。目前於 ABConvert 擔任軟體工程實習生。',
};

type Section = {
  label: string;
  body: () => React.ReactNode;
};

type ExperienceItem = {
  role: string;
  org: string;
  meta: string;
  bullets: string[];
};

type EducationItem = {
  degree: string;
  org: string;
  meta: string;
};

type ProjectItem = {
  title: string;
  description: string;
  tech: string;
};

type AwardItem = {
  date: string;
  title: string;
  description: string;
};

const experiences: ExperienceItem[] = [
  {
    role: '軟體工程實習生',
    org: 'ABConvert — Shopify A/B Testing SaaS',
    meta: '2026.02 – 現在',
    bullets: [
      '以 Next.js + TypeScript 打造內部營運儀表板，涵蓋計費、實驗生命週期與營收監控',
      '採用 SDD（Spec-Driven Development）與 Agile 流程進行功能開發與迭代',
    ],
  },
  {
    role: '夏季實習生（Startup Generalist／Product・AI）',
    org: 'ABConvert — Shopify A/B Testing SaaS',
    meta: '2025.07 – 2025.09',
    bullets: [
      'AI-native 的 generalist，活用 LLM 輔助工作流程，以新創節奏交付 Next.js + TypeScript 前端',
      '透過敏捷迭代優化實驗 UI（A/B instrumentation、sequential monitoring、CUPED）',
    ],
  },
];

const education: EducationItem[] = [
  {
    degree: '資訊管理學系（B.B.A.）',
    org: 'National Taiwan University — 雙主修：創新領域學士學位學程（創新設計學院）',
    meta: '2024 – 2028',
  },
];

const projects: ProjectItem[] = [
  {
    title: 'Spotify GuessSong',
    description:
      '即時多人音樂猜歌遊戲。主持人貼上任一 Spotify 播放清單網址後，應用會以 Spotify Client Credentials 抓取曲目，並進行一輪輪含音訊片段、即時計分與答案比對的問答。',
    tech: 'Next.js 15 · TypeScript · React · Tailwind CSS · Spotify Web API · shadcn/ui',
  },
  {
    title: 'Spotify Statistic',
    description:
      'Spotify 聆聽數據分析平台。實作 OAuth 2.0（PKCE）授權流程、以 cron 排程同步歷史紀錄，提供藝人／曲風／時段等多維度的聆聽行為拆解。',
    tech: 'Next.js 14 · TypeScript · PostgreSQL',
  },
];

const skills: { label: string; value: string }[] = [
  { label: '技術棧', value: 'TypeScript · React · Next.js · PostgreSQL · Tailwind · Python · C++' },
  { label: '工具', value: 'REST / GraphQL · Git · Vercel · SDD · Agile' },
  { label: '修課', value: 'Data Structures · Web Programming · Algorithms · Operating Systems' },
];

const awards: AwardItem[] = [
  {
    date: '2024 – 現在',
    title: 'Camera Drift（NTU）— 主辦人／攝影師',
    description: '跨校園攝影社群活動，負責企劃與影像紀錄',
  },
  {
    date: '2025',
    title: 'PDAO Competition — 總排名第 5、資管系第 1',
    description: '校際資料分析競賽',
  },
];

const contact: { label: string; value: string; href?: string }[] = [
  { label: 'Email', value: 'wayntingliu@gmail.com', href: 'mailto:wayntingliu@gmail.com' },
  { label: '電話', value: '+886 905 172 262' },
  { label: '所在地', value: 'Taipei, Taiwan' },
  { label: '語言', value: '中文（母語）· English (Professional)' },
];

export default function AboutPage() {
  const sections: Section[] = [
    {
      label: '簡介',
      body: () => (
        <>
          <div className="max-w-[560px]">
            <p className="text-sm leading-[1.85] text-muted-foreground">
              全端工程師，具 AI-native 思維，以 Next.js + TypeScript 打造資料驅動的產品。
              端到端的交付經驗橫跨 OAuth／PostgreSQL 後端與 streaming RSC 前端，並專精於 A/B 實驗設計。
              目前就讀於 National Taiwan University，主修資訊管理學系（B.B.A.），雙主修創新領域學士學位學程（創新設計學院）。
              目前於{' '}
              <a
                href="https://www.abconvert.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
              >
                ABConvert
              </a>{' '}
              擔任軟體工程實習生，負責 Shopify A/B testing 產品開發。
            </p>
          </div>

          <div className="flex items-center mt-6 gap-5 flex-wrap text-xs text-muted-foreground">
            <a
              href="https://waynting.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              完整英文履歷 ↗
            </a>
            <span className="text-border" aria-hidden>·</span>
            <a
              href="mailto:wayntingliu@gmail.com"
              className="hover:text-foreground transition-colors"
            >
              wayntingliu@gmail.com
            </a>
          </div>
        </>
      ),
    },
    {
      label: '工作經驗',
      body: () => (
        <div className="flex flex-col gap-10">
          {experiences.map((item) => (
            <div key={`${item.role}-${item.meta}`}>
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                  {item.role}
                </h2>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.meta}
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">{item.org}</p>
              <ul className="flex flex-col pl-3 gap-2 border-l border-border list-none">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="pl-3 text-sm leading-[1.7] text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: '教育背景',
      body: () => (
        <div className="flex flex-col gap-10">
          {education.map((item) => (
            <div key={item.degree}>
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                  {item.degree}
                </h2>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.meta}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.org}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: '技能',
      body: () => (
        <ul className="flex flex-col pl-3 gap-2 border-l border-border list-none max-w-[560px]">
          {skills.map((item) => (
            <li
              key={item.label}
              className="pl-3 text-sm leading-[1.7] text-muted-foreground"
            >
              <span className="text-foreground">{item.label}：</span>
              {item.value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: '專案作品',
      body: () => (
        <div className="flex flex-col gap-10">
          {projects.map((item) => (
            <div key={item.title}>
              <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground mb-1">
                {item.title}
              </h2>
              <p className="mb-4 text-xs text-muted-foreground tracking-[0.01em]">
                {item.tech}
              </p>
              <p className="text-sm leading-[1.75] text-muted-foreground max-w-[560px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: '榮譽與領導',
      body: () => (
        <ul className="flex flex-col pl-3 gap-3 border-l border-border list-none max-w-[560px]">
          {awards.map((item) => (
            <li key={item.title} className="pl-3 text-sm leading-[1.7] text-muted-foreground">
              <div className="flex items-baseline gap-3">
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </span>
                <span className="text-foreground">{item.title}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: '聯絡方式',
      body: () => (
        <ul className="flex flex-col pl-3 gap-2 border-l border-border list-none max-w-[560px]">
          {contact.map((item) => (
            <li key={item.label} className="pl-3 text-sm leading-[1.7] text-muted-foreground">
              <span className="text-foreground">{item.label}：</span>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <Container className="pt-16 pb-12">
        <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
          劉威廷
        </div>
        <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          關於我
        </h1>
      </Container>

      {sections.map((section, i) => {
        const num = String(i).padStart(2, '0');
        return (
          <Container key={section.label} className="pb-12">
            <section>
              <div className="flex items-baseline mb-6 pb-3 gap-3 border-b border-border">
                <span className="text-xs font-light text-muted-foreground/70 tabular-nums">
                  {num}
                </span>
                <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
                  {section.label}
                </span>
              </div>
              {section.body()}
            </section>
          </Container>
        );
      })}

      <div className="pb-24" />
    </>
  );
}
