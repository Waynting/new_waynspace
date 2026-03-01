import Link from 'next/link';

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
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: name + copyright */}
          <div>
            <p className="text-xs font-medium text-foreground">Waynspace</p>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              © {year} Wei-Ting Liu
            </p>
          </div>

          {/* Right: nav + socials */}
          <div className="flex flex-col sm:items-end gap-2">
            {/* Quick nav */}
            <div className="flex items-center gap-4">
              <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Articles</Link>
              <Link href="/photos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Photos</Link>
              <Link href="/camera-float-ntu" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Camera Float</Link>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-4">
              {socials.map(s => (
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
        </div>
      </div>
    </footer>
  );
}
