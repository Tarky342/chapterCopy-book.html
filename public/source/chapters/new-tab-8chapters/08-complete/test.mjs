import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));

test('タブ数とパネル数が一致し、aria-controlsが対応する', async () => {
  const html = await readFile(join(folder, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/id="(panel-[^"]+)"/g)].map(m => m[1]);
  const controls = [...html.matchAll(/aria-controls="(panel-[^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, controls.length);
  assert.deepEqual(ids.sort(), controls.sort());
});

test('JavaScriptファイルに構文エラーがない', () => {
  for (const filename of ['app.js', 'server.mjs']) {
    const result = spawnSync(process.execPath, ['--check', join(folder, filename)], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('APIキー未設定ならニュースAPIは503で、秘密ファイルは配信しない', async () => {
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: folder,
    env: { ...process.env, GNEWS_API_KEY: '', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    const url = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('起動に時間がかかりすぎました')), 5000);
      child.once('error', error => { clearTimeout(timeout); reject(error); });
      child.stdout.on('data', chunk => {
        const match = String(chunk).match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) { clearTimeout(timeout); resolve(`http://127.0.0.1:${match[1]}`); }
      });
      child.once('exit', code => { clearTimeout(timeout); reject(new Error(`サーバー終了: ${code}`)); });
    });
    const html = await fetch(url);
    assert.equal(html.status, 200);
    const news = await fetch(url + '/api/news');
    assert.equal(news.status, 503);
    assert.match((await news.json()).error, /GNEWS_API_KEY/);
    for (const path of ['/server.mjs', '/.env', '/.env.example']) {
      assert.equal((await fetch(url + path)).status, 404);
    }
  } finally {
    child.kill();
  }
});
