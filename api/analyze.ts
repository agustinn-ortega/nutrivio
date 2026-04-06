// Vercel Edge Function - Gemini API proxy
// This keeps the API key server-side and secure

export const config = { runtime: 'edge' };

const GEMINI_KEY = process.env.GOOGLE_AI_KEY || '';
const MODEL = 'gemini-2.5-flash';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  if (!GEMINI_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { prompt, imageBase64, imageMimeType } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const parts: Array<Record<string, unknown>> = [];

    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
    }

    parts.push({ text: prompt });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const error = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini error: ${geminiRes.status}`, details: error }), {
        status: geminiRes.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
