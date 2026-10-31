// 第8章：完成版。検索・タブ・ニュース・キャッシュ・再取得を統合。
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const searchInput = document.getElementById('search-input');
const newsBox = document.getElementById('news');
const genreBox = document.getElementById('news-genre');
const refreshButton = document.getElementById('refresh-news');
const keywords = ['テクノロジー', 'AI', '経済', '政治', '科学'];
const cacheKey = 'new-tab-gnews-v2';
const cacheMs = 5 * 60 * 1000;
let hasOpenedNews = false;
let requestInProgress = false;

function activateTab(index, moveFocus = false) {
  if (!panels[index]) return;
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
  if (moveFocus) tabs[index].focus();
  if (index === 1 && !hasOpenedNews) {
    hasOpenedNews = true;
    loadNews();
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(index));
  // role=tab の一般的なキーボード操作：左右矢印/Home/End
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(next, true);
  });
});

window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.shiftKey || event.metaKey) return;
  if (event.altKey && /^[1-9]$/.test(event.key)) {
    const index = Number(event.key) - 1;
    if (index < tabs.length) { event.preventDefault(); activateTab(index); }
  } else if (event.altKey && event.key.toLowerCase() === 'd') {
    event.preventDefault(); activateTab(0); searchInput.focus();
  } else if (!event.altKey && event.key === '/' &&
    !event.target.closest('input, textarea, select, [contenteditable="true"]')) {
    event.preventDefault(); activateTab(0); searchInput.focus();
  }
});

function safeWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

function displayNews(articles) {
  newsBox.replaceChildren();
  newsBox.classList.remove('error');
  for (const article of articles) {
    const url = safeWebUrl(article.url);
    if (!url || typeof article.title !== 'string' || !article.title) continue;
    const item = document.createElement('article');
    item.className = 'news-item';
    const image = safeWebUrl(article.image);
    if (image) {
      const img = document.createElement('img');
      img.className = 'news-image'; img.src = image;
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      item.append(img);
    }
    const content = document.createElement('div');
    content.className = 'news-content';
    const link = document.createElement('a');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = article.title;
    content.append(link);
    if (article.description) {
      const description = document.createElement('p');
      description.className = 'news-description';
      description.textContent = article.description;
      content.append(description);
    }
    const details = [];
    if (article.source?.name) details.push(article.source.name);
    if (article.publishedAt) {
      const date = new Date(article.publishedAt);
      if (!Number.isNaN(date.getTime())) details.push(date.toLocaleString('ja-JP'));
    }
    if (details.length) {
      const small = document.createElement('p');
      small.className = 'news-meta'; small.textContent = details.join(' ・ ');
      content.append(small);
    }
    item.append(content);
    newsBox.append(item);
  }
  if (!newsBox.childElementCount) newsBox.textContent = '表示できるニュースがありません。';
}

function readCache() {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved.articles) || !Number.isFinite(saved.time)) throw new Error('invalid cache');
    return saved;
  } catch {
    try { localStorage.removeItem(cacheKey); } catch { /* ブラウザ設定による書込禁止 */ }
    return null;
  }
}
function saveCache(articles, genre) {
  try { localStorage.setItem(cacheKey, JSON.stringify({ articles, genre, time: Date.now() })); }
  catch { /* 保存できなくても表示は可能 */ }
}

async function loadNews(force = false) {
  if (requestInProgress) return;
  const cached = readCache();
  if (!force && cached && Date.now() - cached.time < cacheMs) {
    genreBox.textContent = `ジャンル：${cached.genre}（キャッシュ）`;
    displayNews(cached.articles);
    return;
  }

  requestInProgress = true;
  refreshButton.disabled = true;
  newsBox.classList.remove('error');
  newsBox.textContent = 'ニュースを取得しています…';
  genreBox.textContent = '取得中';
  let lastError = null;
  try {
    for (const keyword of keywords) {
      try {
        const params = new URLSearchParams({ keyword, ...(force ? { refresh: '1' } : {}) });
        const response = await fetch(`/api/news?${params}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        if (!Array.isArray(data.articles)) throw new Error('ニュースの応答形式が不正です。');
        if (data.articles.length === 0) continue;
        displayNews(data.articles);
        genreBox.textContent = `ジャンル：${keyword}`;
        saveCache(data.articles, keyword);
        return;
      } catch (error) {
        lastError = error;
        // APIの設定エラーや通信エラーはジャンルを変えても回復しないので打ち切る。
        break;
      }
    }
    if (lastError) throw lastError;
    genreBox.textContent = '該当するニュースがありません';
    newsBox.textContent = '指定されたジャンルでニュースが見つかりませんでした。';
  } catch (error) {
    console.error('ニュースの取得エラー', error);
    if (cached) {
      displayNews(cached.articles);
      genreBox.textContent = '通信に失敗したため、前回のニュースを表示しています。';
    } else {
      newsBox.classList.add('error');
      newsBox.textContent = `${error.message} 再取得ボタンでもう一度試せます。`;
      genreBox.textContent = 'ニュースを取得できません';
    }
  } finally {
    requestInProgress = false;
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', () => loadNews(true));
activateTab(0);
