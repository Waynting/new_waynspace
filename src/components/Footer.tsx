import { Container } from '@/components/Container';

const socials = [
  { label: 'GitHub', href: 'https://github.com/Waynting' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/waiting5928/' },
  { label: 'Instagram', href: 'https://www.instagram.com/waiting_941208/' },
  { label: 'Medium', href: 'https://medium.com/@wliu5928' },
  { label: 'Email', href: 'mailto:wayntingliu@gmail.com' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground mt-20">
      <Container>
        <div className="py-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3.5">
              <span className="font-serif-tc font-bold text-base text-foreground tracking-[-0.01em]">Waynspace.</span>
              <span className="font-mono text-[10px] tracking-[0.12em] text-foreground/55 hidden sm:inline">
                A PERSONAL PUBLICATION · EST. 2019
              </span>
            </div>
            <div className="flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="text-xs text-foreground/65 hover:text-foreground transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="font-mono text-[10px] tracking-[0.08em] text-foreground/45">
              © {year} Wei-Ting Liu · 劉威廷 · Set in Noto Serif TC + Noto Sans TC + JetBrains Mono
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-foreground/45 hidden md:inline">
              Built with Next.js + Lenis + Canvas 2D
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
