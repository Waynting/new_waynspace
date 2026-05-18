import { Button, Img, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

type Props = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage?: string | null;
  articleUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
};

export function ArticleEmail({
  title,
  excerpt,
  category,
  date,
  readTime,
  coverImage,
  articleUrl,
  unsubscribeUrl,
  siteUrl,
}: Props) {
  return (
    <Layout
      preview={excerpt || title}
      siteUrl={siteUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={{ paddingTop: 8 }}>
        <Text
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#737373',
            margin: '0 0 12px',
          }}
        >
          新文章 · {category}
        </Text>

        <Link
          href={articleUrl}
          style={{
            color: '#262626',
            textDecoration: 'none',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            display: 'block',
            margin: '0 0 16px',
          }}
        >
          {title}
        </Link>

        <Text
          style={{
            fontSize: 12,
            color: '#737373',
            margin: '0 0 24px',
          }}
        >
          {date} · {readTime}
        </Text>

        {coverImage ? (
          <Section style={{ margin: '0 0 24px' }}>
            <Link href={articleUrl}>
              <Img
                src={coverImage}
                alt={title}
                width="512"
                style={{
                  width: '100%',
                  maxWidth: 512,
                  height: 'auto',
                  display: 'block',
                  border: '0',
                }}
              />
            </Link>
          </Section>
        ) : null}

        {excerpt ? (
          <Text
            style={{
              fontSize: 15,
              lineHeight: 1.85,
              color: '#525252',
              margin: '0 0 24px',
            }}
          >
            {excerpt}
          </Text>
        ) : null}

        <Section style={{ padding: '4px 0 8px' }}>
          <Button
            href={articleUrl}
            style={{
              backgroundColor: '#262626',
              color: '#ffffff',
              padding: '12px 22px',
              fontSize: 14,
              textDecoration: 'none',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            繼續閱讀 →
          </Button>
        </Section>
      </Section>
    </Layout>
  );
}

export default ArticleEmail;
