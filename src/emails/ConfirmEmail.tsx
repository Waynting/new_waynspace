import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

type Props = {
  confirmUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
};

export function ConfirmEmail({ confirmUrl, unsubscribeUrl, siteUrl }: Props) {
  return (
    <Layout
      preview="再點一下下面的連結，就完成訂閱了"
      siteUrl={siteUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={{ paddingTop: 8 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#262626',
            letterSpacing: '-0.01em',
            margin: '0 0 20px',
            lineHeight: 1.25,
          }}
        >
          請確認訂閱 Waynspace
        </Text>

        <Text style={{ fontSize: 15, lineHeight: 1.85, color: '#525252', margin: '0 0 12px' }}>
          Hi，
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 1.85, color: '#525252', margin: '0 0 12px' }}>
          感謝你訂閱 Waynspace。再點一下下面的連結，就完成訂閱了：
        </Text>

        <Section style={{ padding: '12px 0 20px' }}>
          <Button
            href={confirmUrl}
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
            確認訂閱 →
          </Button>
        </Section>

        <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#737373', margin: '0 0 8px' }}>
          如果按鈕無法使用，也可以複製這個網址到瀏覽器：
        </Text>
        <Text
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: '#737373',
            margin: '0 0 24px',
            wordBreak: 'break-all',
          }}
        >
          {confirmUrl}
        </Text>

        <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#737373', margin: 0 }}>
          如果這封信不是你本人觸發的，可以直接忽略，我不會再寄信過去。
        </Text>
      </Section>
    </Layout>
  );
}

export default ConfirmEmail;
