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
    <footer className="border-t border-border mt-20">
      <Container>
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-light text-muted-foreground">
            © {year} Wei-Ting Liu
          </span>
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
