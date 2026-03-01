import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - Wei-Ting Liu',
  description: 'Information Management student at NTU. Next.js + TypeScript, A/B testing, data-driven product work.',
};

const experience = [
  {
    company: "ABConvert",
    role: "Startup Generalist Summer Intern (Product/AI)",
    period: "2025 – Present",
    bullets: [
      "Built Next.js + TypeScript frontend with SSR/ISR, streaming UI; optimized Core Web Vitals.",
      "Shipped experimentation UI: A/B instrumentation, sequential monitoring, CUPED variance reduction.",
    ],
    project: {
      name: "Price Test Smalltool",
      description: "Pricing simulator showing conversion/revenue impact. CSV upload, COGS model, OEC optimization.",
      links: {
        github: "https://github.com/wen5928/price_test_smalltool",
        live: "https://price-test-smalltool.vercel.app/",
      },
    },
  },
];

const projects = [
  {
    title: "Headless CMS Blog",
    url: "https://waynspace.com",
    description: "Next.js + WordPress API. Migrated blog to headless CMS; image optimization, Vercel deployment.",
    technologies: ["Next.js", "TypeScript", "WordPress API", "Vercel"],
  },
];

const education = [
  {
    school: "National Taiwan University",
    degree: "B.B.A., Information Management",
    period: "2024 – 2028",
  },
  {
    school: "NTU",
    degree: "Double Major, Trans-disciplinary Program (College of Innovation)",
    period: "2025 – 2028",
  },
];

const coursework = ["Web Programming", "Algorithm", "Data Structure"];

const skills = [
  {
    category: "Languages / FE",
    items: ["TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "C++", "Python"],
  },
  {
    category: "Frameworks",
    items: ["React", "Next.js", "App Router", "RSC/Streaming", "SSR/ISR", "Edge Runtime"],
  },
  {
    category: "Data / State",
    items: ["React Query", "SWR", "REST/GraphQL", "SQL"],
  },
  {
    category: "Product / UX",
    items: ["Accessibility (WCAG)", "Design Systems", "Design Tokens", "Metrics-driven Iteration"],
  },
];

const awards = [
  {
    year: "2024 – Present",
    title: "Camera Drift (NTU)",
    role: "Organizer / Photographer",
    description: "Cross-campus photo program — logistics, onboarding, exhibition.",
    href: "/camera-float-ntu",
  },
  {
    year: "2025",
    title: "PDAO Competition",
    results: ["5th Overall", "1st in IM Dept."],
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

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 space-y-20">

      {/* Page Header */}
      <header>
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
          Wei-Ting Liu
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          About
        </h1>
      </header>

      {/* 00 — Summary */}
      <section>
        <SectionHeading num="00" label="Summary" />
        <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
          Information Management student at NTU with a passion for learning and tackling challenges through
          technology. Experienced in building{' '}
          <span className="text-foreground font-medium">Next.js + TypeScript</span>{' '}
          applications with SSR/ISR, A/B testing frameworks, and data-driven optimization. Eager to bridge
          business insights and technical implementation, from rapid prototyping to production-ready solutions.
        </p>
      </section>

      {/* 01 — Experience */}
      <section>
        <SectionHeading num="01" label="Experience" />
        <div className="space-y-10">
          {experience.map((job) => (
            <div key={job.company}>
              {/* Role header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{job.company}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.role}</p>
                </div>
                <span className="text-xs text-muted-foreground font-light tabular-nums shrink-0">
                  {job.period}
                </span>
              </div>

              {/* Bullets */}
              <ul className="space-y-2 mb-5 pl-3 border-l border-border">
                {job.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-3">
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Inline project under the internship */}
              {job.project && (
                <div className="bg-muted/40 rounded-md px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-medium">{job.project.name}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {job.project.links.github && (
                        <a
                          href={job.project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="GitHub"
                        >
                          <GitHubLogoIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {job.project.links.live && (
                        <a
                          href={job.project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {job.project.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 02 — Projects */}
      <section>
        <SectionHeading num="02" label="Projects" />
        <div className="space-y-0">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className={`py-6 ${i < projects.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold tracking-tight">{project.title}</h3>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {project.url.replace('https://', '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs font-normal px-2 py-0.5">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 — Education */}
      <section>
        <SectionHeading num="03" label="Education" />
        <div className="space-y-5">
          {education.map((edu) => (
            <div key={edu.degree} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{edu.school}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{edu.degree}</p>
              </div>
              <span className="text-xs text-muted-foreground font-light tabular-nums shrink-0">
                {edu.period}
              </span>
            </div>
          ))}

          {/* Coursework */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase mb-2">
              Relevant Coursework
            </p>
            <div className="flex flex-wrap gap-1.5">
              {coursework.map((course) => (
                <Badge key={course} variant="secondary" className="text-xs font-normal px-2 py-0.5">
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Skills */}
      <section>
        <SectionHeading num="04" label="Skills" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
          {skills.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2.5">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-normal px-2 py-0.5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 — Awards & Leadership */}
      <section>
        <SectionHeading num="05" label="Awards & Leadership" />
        <div className="space-y-6">
          {awards.map((item) => (
            <div key={item.title} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-medium hover:underline underline-offset-4"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium">{item.title}</p>
                  )}
                  {item.role && (
                    <span className="text-xs text-muted-foreground">· {item.role}</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground font-light tabular-nums">{item.year}</span>
                {item.results && (
                  <div className="flex gap-1.5 flex-wrap">
                    {item.results.map((r) => (
                      <Badge key={r} variant="outline" className="text-xs font-normal">
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
