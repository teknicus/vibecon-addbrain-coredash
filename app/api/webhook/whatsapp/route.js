import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { processIncomingMessage } from '@/lib/agent/waba-agent';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-hub-signature-256');

    if (!signatureHeader) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 403 });
    }

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    
    if (appSecret && appSecret !== 'your_app_secret_here') {
      const expectedHex = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      const expected = `sha256=${expectedHex}`;
      const sigBuffer = Buffer.from(signatureHeader);
      const expectedBuffer = Buffer.from(expected);

      const signaturesMatch =
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer);

      if (!signaturesMatch) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    } else {
      console.log('[webhook] App secret not configured, skipping signature verification');
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    processIncomingMessage(payload).catch((err) => {
      console.error('[webhook] processing error:', err);
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
