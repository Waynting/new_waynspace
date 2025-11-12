import { getAllPosts, getAllCategories } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Section, SectionHeader, SectionTitle, SectionDescription, SectionContent } from '@/components/ui/section';
import BlogClient from '@/components/BlogClient';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories
    .filter(cat => cat.slug !== 'uncategorized')
    .map((category) => ({
      slug: category.slug,
    }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find(cat => cat.slug === slug);
  const posts = await getAllPosts();
  const categoryPosts = category 
    ? posts.filter(post => post.category === category.name)
    : [];

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Wayn's Blog`,
    description: `所有關於 ${category.name} 的文章，共 ${categoryPosts.length} 篇`,
    openGraph: {
      title: `${category.name} - Wayn's Blog`,
      description: `所有關於 ${category.name} 的文章，共 ${categoryPosts.length} 篇`,
      type: 'website',
    },
    alternates: {
      canonical: `https://www.waynspace.com/blog/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  
  // 找到對應的分類
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category || category.slug === 'uncategorized') {
    notFound();
  }

  // 篩選該分類的文章
  const categoryPosts = posts.filter(post => post.category === category.name);
  
  // 計算每個分類的文章數量（排除未分類）
  const categoriesWithCount = categories
    .filter(cat => cat.slug !== 'uncategorized')
    .map(cat => {
      const count = posts.filter(post => post.category === cat.name).length;
      return { ...cat, count };
    })
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {/* Hero Section */}
      <Section className="py-12 sm:py-16 md:py-20 bg-background">
        <SectionHeader className="text-center px-4">
          <SectionTitle className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            {category.name}
          </SectionTitle>
          <SectionDescription className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            所有關於 {category.name} 的文章
          </SectionDescription>

          {/* 快速統計 */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
            <span>共 {categoryPosts.length} 篇文章</span>
          </div>
        </SectionHeader>
      </Section>

      {/* Blog Client with Category Filter and Posts */}
      <BlogClient posts={categoryPosts} categories={categoriesWithCount} />
    </>
  );
}

