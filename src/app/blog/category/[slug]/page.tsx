import { getAllPosts, getAllCategories } from '@/lib/posts';
import { notFound } from 'next/navigation';
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

  const category = categories.find(cat => cat.slug === slug);

  if (!category || category.slug === 'uncategorized') {
    notFound();
  }

  const categoryPosts = posts.filter(post => post.category === category.name);

  const categoriesWithCount = categories
    .filter(cat => cat.slug !== 'uncategorized')
    .map(cat => {
      const count = posts.filter(post => post.category === cat.name).length;
      return { ...cat, count };
    })
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  return <BlogClient posts={categoryPosts} categories={categoriesWithCount} />;
}
