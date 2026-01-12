import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/ui/section';
import { TypingText } from '@/components/ui/typing-text';
import { generateStructuredData } from '@/lib/seo';
import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default async function Home() {
  const structuredData = generateStructuredData('person', {
    sameAs: [
      'https://github.com/Waynting',
      'https://www.instagram.com/waiting_941208',
    ],
    jobTitle: 'Information Management Student',
    worksFor: {
      '@type': 'Organization',
      'name': 'National Taiwan University'
    }
  });

  // 獲取最新的三篇文章
  const allPosts = await getAllPosts();
  const latestPosts = allPosts.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section with Profile Image */}
      <Section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,119,198,0.05),transparent_50%)]" />
        
        <SectionContent className="relative z-10 text-center max-w-5xl mx-auto px-6 py-16">
          {/* Profile Image with glow effect */}
          <div className="mb-6">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative border-3 border-border/50 rounded-full p-1.5 bg-background/80 backdrop-blur-sm">
                <div className="bg-background rounded-full h-full w-full overflow-hidden shadow-2xl">
                  <Image 
                    src="/LIU_0457.jpg" 
                    alt="Wei-Ting Liu profile photo"
                    width={288}
                    height={288}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Title with gradient effect and typing animation */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-foreground tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              <TypingText 
                text="Wei-Ting Liu"
                delay={1500}
                speed={120}
                showCursor={true}
              />
            </span>
          </h1>
          
          <div className="space-y-4 mb-12">
            <p className="text-lg sm:text-xl text-muted-foreground/80">
              Information Management Student at NTU
            </p>
          </div>

          {/* My CV Website Link */}
          <div className="mb-12">
            <Button asChild size="lg" className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <a href="https://waynting.github.io/" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                My CV Website
              </a>
            </Button>
          </div>

          {/* Quick Links - 聯絡方式 */}
          <div className="flex justify-center gap-6">
            <a href="https://github.com/Waynting" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full border border-border/50 hover:border-foreground/20 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
            <a href="mailto:wayntingliu@gmail.com" className="group p-3 rounded-full border border-border/50 hover:border-foreground/20 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="sr-only">Email</span>
            </a>
            <a href="https://www.linkedin.com/in/waiting5928/" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full border border-border/50 hover:border-foreground/20 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/waiting_941208/" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full border border-border/50 hover:border-foreground/20 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.79-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </SectionContent>
      </Section>

      {/* Latest Articles Section */}
      {latestPosts.length > 0 && (
        <Section className="py-16">
          <SectionHeader className="mb-12">
            <SectionTitle className="text-center">Latest Articles</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {latestPosts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={{
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt,
                    date: post.date,
                    readTime: post.readTime,
                    category: post.category,
                    tags: post.tags,
                    author: post.author,
                    featuredImage: post.featuredImage || post.coverImage,
                  }}
                  preloadImage={true}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">View All Articles</Link>
              </Button>
            </div>
          </SectionContent>
        </Section>
      )}
    </>
  );
}
