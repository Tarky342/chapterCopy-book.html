// 第6章：APIキーはサーバー側の環境変数から読み込み、ブラウザへ返さない。
// 起動: node --env-file=.env server.mjs （Node.js 20.6以上）
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const folder = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? '3000');
const apiKey = process.env.GNEWS_API_KEY?.trim();
const keywords = new Set(['テクノロジー', 'AI', '経済', '政治', '科学']);
const ttlMs = 5 * 60 * 1000;
const cache = new Map();
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function news(reqUrl, res) {
  const keyword = reqUrl.searchParams.get('keyword') || 'テクノロジー';
  if (!keywords.has(keyword)) return json(res, 400, { error: '未対応のジャンルです。' });
  if (!apiKey) return json(res, 503, { error: 'GNEWS_API_KEY が未設定です。.env を確認してください。' });

  const force = reqUrl.searchParams.get('refresh') === '1';
  const saved = cache.get(keyword);
  if (!force && saved && Date.now() - saved.time < ttlMs) {
    return json(res, 200, { articles: saved.articles, genre: keyword, cache: true });
  }

  const params = new URLSearchParams({ q: keyword, lang: 'ja', country: 'jp', max: '5' });
  try {
    // APIキーをクエリ文字列に含めず、ヘッダーで渡す。
    const response = await fetch(`https://gnews.io/api/v4/search?${params}`, {
      headers: { 'X-Api-Key': apiKey },
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) {
      const message = response.status === 401 ? 'APIキーが無効です。'
        : response.status === 403 ? 'APIの利用枠に達しました。'
        : response.status === 429 ? 'APIへのリクエストが多すぎます。'
        : `GNewsがHTTP ${response.status}を返しました。`;
      return json(res, 502, { error: message });
    }
    const data = await response.json();
    if (!Array.isArray(data.articles)) return json(res, 502, { error: 'GNewsの応答形式が不正です。' });
    // 公開してよい情報のみ返す。公式の発行元フィールドは article.source.name。
    const articles = data.articles.map(article => ({
      title: article.title ?? '',
      description: article.description ?? '',
      url: article.url ?? '',
      image: article.image ?? '',
      publishedAt: article.publishedAt ?? '',
      source: { name: article.source?.name ?? '' },
    }));
    cache.set(keyword, { time: Date.now(), articles });
    return json(res, 200, { articles, genre: keyword, cache: false });
  } catch {
    return json(res, 502, { error: 'GNewsとの通信に失敗しました。ネットワークを確認してください。' });
  }
}

const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; img-src 'self' https:; connect-src 'self'; " +
    "script-src 'self'; style-src 'self'; form-action https://www.google.com; base-uri 'none'; object-src 'none'");
  if (req.method !== 'GET') return json(res, 405, { error: 'GETのみ対応しています。' });

  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/news') return news(url, res);
  const entry = staticFiles.get(url.pathname);
  if (!entry) return json(res, 404, { error: 'ファイルが見つかりません。' });
  try {
    const body = await readFile(join(folder, entry[0]));
    res.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    json(res, 500, { error: 'ファイルを読み込めませんでした。' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`起動: http://127.0.0.1:${server.address().port}`);
});
