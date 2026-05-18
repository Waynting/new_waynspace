import { Resend } from 'resend';
import { render } from '@react-email/render';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not set');
    _resend = new Resend(key);
  }
  return _resend;
}

export const MAIL_FROM = process.env.MAIL_FROM ?? 'Wayn <hi@mail.waynspace.com>';
export const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO ?? 'wayntingliu@gmail.com';

// Derive the base URL from the incoming request when possible so confirmation /
// unsubscribe links land on whatever host the user actually came from
// (localhost in dev, preview domain on Vercel previews, prod in prod).
export function getBaseUrl(req?: Request): string {
  if (req) {
    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    if (host) return `${proto}://${host}`;
  }
  return (
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://waynspace.com'
  );
}

const DRY_RUN = process.env.NEWSLETTER_DRY_RUN === '1';

type SendOne = {
  to: string;
  subject: string;
  react: React.ReactElement;
  headers?: Record<string, string>;
};

export async function sendEmail({ to, subject, react, headers }: SendOne) {
  if (DRY_RUN) {
    const html = await render(react);
    console.log('[DRY_RUN] sendEmail', { to, subject, headers, htmlBytes: html.length });
    return { id: 'dry-run' };
  }
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: MAIL_FROM,
    to,
    replyTo: MAIL_REPLY_TO,
    subject,
    react,
    headers,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data!;
}

type BatchItem = {
  to: string;
  subject: string;
  react: React.ReactElement;
  headers?: Record<string, string>;
};

/**
 * Send a batch (up to 100 per Resend's batch endpoint).
 * Returns the batch response, including ids.
 */
export async function sendBatch(items: BatchItem[]) {
  if (items.length === 0) return { data: [] };
  if (DRY_RUN) {
    console.log(`[DRY_RUN] sendBatch (${items.length} messages)`);
    return { data: items.map((_, i) => ({ id: `dry-run-${i}` })) };
  }
  const resend = getResend();
  const payload = await Promise.all(
    items.map(async (it) => ({
      from: MAIL_FROM,
      to: it.to,
      replyTo: MAIL_REPLY_TO,
      subject: it.subject,
      html: await render(it.react),
      headers: it.headers,
    }))
  );
  const { data, error } = await resend.batch.send(payload);
  if (error) throw new Error(`Resend batch error: ${error.message}`);
  return data!;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
