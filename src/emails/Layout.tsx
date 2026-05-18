import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';

type LayoutProps = {
  preview: string;
  siteUrl: string;
  unsubscribeUrl: string;
  children: React.ReactNode;
};

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Noto Sans TC", "PingFang TC", "Helvetica Neue", Arial, sans-serif';

export function Layout({ preview, siteUrl, unsubscribeUrl, children }: LayoutProps) {
  return (
    <Html lang="zh-TW">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: '#ffffff',
          color: '#262626',
          fontFamily,
          margin: 0,
          padding: '24px 0',
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: '24px 24px 32px',
          }}
        >
          <Section style={{ paddingBottom: 16 }}>
            <Link
              href={siteUrl}
              style={{
                color: '#262626',
                fontSize: 13,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Waynspace
            </Link>
          </Section>

          {children}

          <Hr style={{ borderColor: '#e6e6e6', margin: '40px 0 16px' }} />

          <Section>
            <Text
              style={{
                color: '#737373',
                fontSize: 12,
                lineHeight: 1.6,
                margin: '0 0 8px',
              }}
            >
              你收到這封信是因為訂閱了 Waynspace 的更新。
            </Text>
            <Text
              style={{
                color: '#737373',
                fontSize: 12,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <Link href={siteUrl} style={{ color: '#737373' }}>
                waynspace.com
              </Link>
              <span style={{ margin: '0 8px', color: '#d4d4d4' }}>·</span>
              <Link href={unsubscribeUrl} style={{ color: '#737373' }}>
                取消訂閱
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
