import { Metadata } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/posts';
import BlogClient from '@/components/BlogClient';

export const metadata: Metadata = {
  title: 'Articles - Wei-Ting Liu',
  description: 'Articles, thoughts and learning notes',
};

export default async function PostsPage() {
  const posts = await getAllPosts();
  const categories = await getAllCategories();

  const categoriesWithCount = categories
    .filter(cat => cat.slug !== 'uncategorized')
    .map(category => {
      const count = posts.filter(post => post.category === category.name).length;
      return { ...category, count };
    })
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  return <BlogClient posts={posts} categories={categoriesWithCount} />;
}
