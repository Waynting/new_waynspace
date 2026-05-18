import { Metadata } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/posts';
import BlogClient from '@/components/BlogClient';
import { Container } from '@/components/Container';
import { EmailSubscribe } from '@/components/EmailSubscribe';

export const metadata: Metadata = {
  title: '文章列表',
  description: '分享生活隨筆、技術筆記、攝影心得、閱讀筆記與行旅隨筆。',
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

  return (
    <>
      <BlogClient posts={posts} categories={categoriesWithCount} />
      <Container className="pb-24">
        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-border">
          <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
            Newsletter
          </span>
        </div>
        <EmailSubscribe location="blog" />
      </Container>
    </>
  );
}
