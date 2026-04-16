import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SAFE_DEFAULTS = {
  tags: [],
  topic: 'uncategorised',
  summary: '',
  sentiment: 'neutral',
};

export async function enrichCard(content) {
  if (!content.trim()) return SAFE_DEFAULTS;

  // If no API key, return safe defaults with basic summary
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.log('[enrichment] No API key configured, using defaults');
    return {
      ...SAFE_DEFAULTS,
      summary: content.slice(0, 60),
    };
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      system: `You are a personal knowledge management assistant. Analyze the captured note and return a JSON object with exactly these fields:
- tags: string[] (2-5 lowercase kebab-case topic tags, e.g. ["product-strategy", "machine-learning"])
- topic: string (single primary topic label, max 3 words)
- summary: string (one sentence, max 15 words, action-oriented starting with a verb)
- sentiment: "positive" | "neutral" | "negative"

Return ONLY valid JSON. No markdown fences, no explanation, no extra text.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this captured note:\n\n${content}`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const parsed = JSON.parse(text.trim());

    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      topic: typeof parsed.topic === 'string' ? parsed.topic : 'uncategorised',
      summary: typeof parsed.summary === 'string' ? parsed.summary : content.slice(0, 60),
      sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
        ? parsed.sentiment
        : 'neutral',
    };
  } catch (err) {
    console.error('[enrichment] failed:', err);
    return {
      ...SAFE_DEFAULTS,
      summary: content.slice(0, 60),
    };
  }
}
