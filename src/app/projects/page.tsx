import { Metadata } from 'next';
import { Container } from '@/components/Container';
import { MastheadStrip } from '@/components/MastheadStrip';
import { SectionDivider } from '@/components/SectionDivider';
import { formatDateLabel } from '@/lib/format';

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
  const dateLabel = formatDateLabel();

  return (
    <>
      <Container className="pt-20 pb-12">
        <MastheadStrip
          primary="SECTION 04 / THE PORTFOLIO"
          secondary="專案集"
          right={`UPDATED ${dateLabel}`}
        />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-10 gap-4 sm:gap-6">
          <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[64px] sm:text-[80px] md:text-[112px] lg:text-[128px]">
            Projects.
          </h1>
          <div className="flex flex-col items-start sm:items-end gap-1.5 sm:pb-4">
            <span className="font-serif-tc italic text-sm text-foreground/60">— things I&apos;ve built</span>
            <span className="font-serif-tc font-bold text-2xl md:text-[28px] tracking-[-0.02em] text-foreground tabular-nums">
              {projects.length} 件 / 2023–
            </span>
          </div>
        </div>
      </Container>

      {projects.map((project, i) => {
        const num = String(i + 1).padStart(2, '0');
        const slug = project.title.toLowerCase();

        return (
          <Container key={project.title} className="mt-16 sm:mt-20" >
            <section id={slug}>
              <SectionDivider
                title={`${project.title}.`}
                tagline={project.subtitle ? `— ${project.subtitle}` : undefined}
                right={
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-[11px] tracking-[0.12em] text-foreground/65">№ {num}</span>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs text-foreground border-b border-foreground pb-px hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">{stripUrl(project.url)} </span>↗
                    </a>
                  </div>
                }
              />

              {project.tech && (
                <p className="font-mono text-[10px] tracking-[0.12em] text-foreground/65 mt-4 leading-relaxed">
                  STACK · {project.tech}
                </p>
              )}

              <p className="font-serif-tc text-[17px] sm:text-[19px] leading-[1.7] text-foreground mt-5 max-w-[640px]">
                {project.description}
              </p>

              <div className="flex flex-col mt-8 max-w-[760px]">
                {project.features.map((feature, j) => (
                  <div
                    key={j}
                    className={`flex items-start gap-4 sm:gap-7 py-4 ${j < project.features.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <div className="flex flex-col shrink-0 w-10 sm:w-16 pt-0.5">
                      <span className="font-mono text-[11px] tracking-[0.06em] text-foreground/65">
                        № {String(j + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="font-serif-tc text-[14px] sm:text-[15px] leading-[1.6] text-foreground/85 flex-1 min-w-0">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Container>
        );
      })}

      <div className="pb-24" />
    </>
  );
}
