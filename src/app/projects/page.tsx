import { Metadata } from 'next';
import { Container } from '@/components/Container';

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

type Project = {
  title: string;
  url: string;
  description: string;
  features: string[];
  subtitle?: string;
  tech?: string;
};

const projects: Project[] = [
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

function stripUrl(url: string) {
  return url.replace('https://www.', '').replace('https://', '').replace(/\/$/, '');
}

export default function ProjectsPage() {
  return (
    <>
      <Container className="pt-16 pb-12">
        <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
          Wei-Ting Liu
        </div>
        <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          Projects
        </h1>
      </Container>

      {projects.map((project, i) => {
        const num = String(i).padStart(2, '0');
        const slug = project.title.toLowerCase();

        return (
          <Container key={project.title} className="pb-12">
            <section id={slug}>
              <div className="flex items-baseline mb-6 pb-3 gap-3 border-b border-border">
                <span className="text-xs font-light text-muted-foreground/70 tabular-nums">
                  {num}
                </span>
                <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
                  {project.title}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                    {project.title}
                  </h2>
                  {project.subtitle && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{project.subtitle}</p>
                  )}
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {stripUrl(project.url)}
                  <span aria-hidden>↗</span>
                </a>
              </div>

              {project.tech && (
                <p className="mb-4 text-xs text-muted-foreground tracking-[0.01em]">
                  {project.tech}
                </p>
              )}

              <p className="text-sm leading-[1.75] text-muted-foreground max-w-[560px] mb-6">
                {project.description}
              </p>

              <ul className="flex flex-col pl-3 gap-2 border-l border-border list-none">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="pl-3 text-sm leading-[1.7] text-muted-foreground"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          </Container>
        );
      })}

      <div className="pb-24" />
    </>
  );
}
