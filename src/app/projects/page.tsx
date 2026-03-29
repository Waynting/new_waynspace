import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

const pageDescription = '個人專案作品集。Capsule 個人記憶管理應用、Guessong 音樂猜歌派對遊戲、UniLink 大學申請諮詢平台。';

export const metadata: Metadata = {
  title: 'Projects - Wei-Ting Liu',
  description: pageDescription,
  keywords: ['Capsule', 'Guessong', 'UniLink', '專案作品集', 'memory capsule', 'Spotify 猜歌', '大學申請諮詢', 'Wei-Ting Liu'],
  openGraph: {
    title: 'Projects - Wei-Ting Liu',
    description: pageDescription,
    url: 'https://waynspace.com/projects',
    type: 'website',
    locale: 'zh_TW',
    siteName: 'Waynspace',
    images: [
      {
        url: 'https://waynspace.com/blog-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Waynspace Projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects - Wei-Ting Liu',
    description: pageDescription,
    images: ['https://waynspace.com/blog-image.jpg'],
  },
  alternates: {
    canonical: 'https://waynspace.com/projects',
  },
};

const projects = [
  {
    title: 'Capsule',
    subtitle: 'Your memories, the way you actually lived them.',
    url: 'https://www.usecapsule.app/',
    tech: 'Next.js · TypeScript · Tailwind CSS · Supabase · OpenAI GPT-4o · Vercel',
    description:
      'A personal memory management web app that pairs your photos with your own written reflections to create inseparable "Memory Capsules." Unlike typical journaling apps, AI organizes and responds to your entries — it never writes for you. Browse memories through timeline views (week/month/year), organize them into chapters, and revisit moments with AI-powered reflections and summaries.',
    features: [
      'Photo + text memory capsules with calendar-based timeline navigation',
      'AI reflections that ask thoughtful follow-up questions (never summarize or write for you)',
      'Chapter-based organization with AI-generated narrative summaries',
      'Built with privacy-first architecture (row-level security, private storage)',
    ],
  },
  {
    title: 'Guessong',
    url: 'https://www.guessong.app/',
    description:
      'A browser-based multiplayer music guessing party game powered by Spotify playlists. Paste any public Spotify playlist URL, add player names, choose a clip duration (5–30s), and compete to guess songs from short audio previews. No login required.',
    features: [
      'Zero-auth Spotify integration — uses Client Credentials flow, no user login needed',
      'Smart audio fallback — when Spotify deprecated preview URLs, seamlessly falls back to iTunes Search API and Deezer API',
      'Intelligent answer matching — normalizes text by stripping brackets, "feat.", punctuation, and matches on keyword overlap',
      'Progressive album art hints — cover art unblurs gradually during gameplay',
      'Exportable results — final scoreboard renders as a downloadable PNG with rankings',
      'Fully stateless — no database; all game state lives in sessionStorage',
    ],
  },
  {
    title: 'UniLink',
    url: 'https://www.unilink-ntu.com/',
    description:
      'A full-stack web platform connecting high school students in Taiwan with university mentors for personalized academic guidance. Built as part of NTU\'s Leadership Introduction course.',
    features: [
      'Smart mentor matching algorithm (weighted scoring across academic field, keywords, and workload balancing)',
      'Searchable Q&A database with 30+ curated entries on admissions and career planning',
      'Admin dashboard with full CRUD for users, members, resources, and bookings',
      'Google OAuth authentication with email verification (Resend integration)',
      'Event pages for "18-Minute" online mentor marathon sessions',
    ],
  },
];

function SectionHeading({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-8 border-b border-border pb-4">
      <span className="text-muted-foreground text-xs font-light tabular-nums w-5 shrink-0">{num}</span>
      <h2 className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </h2>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 space-y-20">

      {/* Page Header */}
      <header>
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
          Wei-Ting Liu
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Projects
        </h1>
      </header>

      {/* Project Sections */}
      {projects.map((project, i) => (
        <section key={project.title}>
          <SectionHeading num={String(i).padStart(2, '0')} label={project.title} />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight">{project.title}</h3>
              {'subtitle' in project && project.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{project.subtitle}</p>
              )}
            </div>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {project.url.replace('https://www.', '').replace('https://', '').replace(/\/$/, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {'tech' in project && project.tech && (
            <p className="text-xs text-muted-foreground mb-4 tracking-wide">{project.tech}</p>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            {project.description}
          </p>

          <ul className="space-y-2 pl-3 border-l border-border">
            {project.features.map((feature, j) => (
              <li key={j} className="text-sm text-muted-foreground leading-relaxed pl-3">
                {feature}
              </li>
            ))}
          </ul>
        </section>
      ))}

    </main>
  );
}
