import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const app = express();
const port = process.env.PORT || 8080;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: OPENROUTER_MODEL, aiConfigured: Boolean(OPENROUTER_API_KEY) });
});

app.post('/api/question-assist', async (req, res) => {
  const { question, name } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'AI is not configured on the server.' });
  }

  const systemPrompt = [
    'You help moderate live conference Q&A boards.',
    'Return strict JSON only with keys: polished, tags, moderatorHint.',
    'polished: rewrite the audience question into a concise, sharper stage-ready version.',
    'tags: array of 2 or 3 short topic tags.',
    'moderatorHint: one short sentence telling the speaker why this question matters now.',
    'Do not include markdown fences.'
  ].join(' ');

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.sundai.club',
        'X-Title': 'Talk Question Board'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Question asker: ${name || 'Anonymous'}\nQuestion: ${question}`
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'OpenRouter request failed', detail: text.slice(0, 500) });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const trimmed = content.match(/\{[\s\S]*\}/)?.[0] || '{}';
      parsed = JSON.parse(trimmed);
    }

    res.json({
      polished: parsed.polished || question,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
      moderatorHint: parsed.moderatorHint || 'Useful question for the speaker to prioritize.'
    });
  } catch (error) {
    res.status(500).json({ error: 'AI assist failed', detail: String(error.message || error) });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Talk Question Board listening on ${port}`);
});
