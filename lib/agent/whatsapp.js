const GRAPH_API_VERSION = 'v20.0';

export async function sendWhatsAppText(to, body) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId || accessToken === 'your_whatsapp_access_token_here') {
    console.log('[whatsapp] API not configured, skipping message send');
    return;
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[whatsapp] Graph API error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('[whatsapp] Send error:', error);
  }
}
