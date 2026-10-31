// 第6章：ブラウザは自分のサーバー（/api/news）だけに接続します。
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const searchInput = document.getElementById('search-input');
const newsBox = document.getElementById('news');
const genreBox = document.getElementById('news-genre');
let newsStarted = false;

function activateTab(index, focus = false) {
  if (index < 0 || index >= tabs.length || !panels[index]) return;
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (focus) tabs[index].focus();
  if (index === 1 && !newsStarted) {
    newsStarted = true;
    loadNews();
  }
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => activateTab(index)));
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.shiftKey || event.metaKey) return;
  if (event.altKey && /^[12]$/.test(event.key)) {
    event.preventDefault(); activateTab(Number(event.key) - 1);
  } else if (event.altKey && event.key.toLowerCase() === 'd') {
    event.preventDefault(); activateTab(0); searchInput.focus();
  } else if (!event.altKey && event.key === '/' &&
    !event.target.closest('input, textarea, select, [contenteditable="true"]')) {
    event.preventDefault(); activateTab(0); searchInput.focus();
  }
});

function safeWebUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

function displayNews(articles) {
  newsBox.replaceChildren();
  for (const article of articles) {
    const url = safeWebUrl(article.url);
    if (!url || !article.title) continue;
    const item = document.createElement('article'); item.className = 'news-item';
    const image = safeWebUrl(article.image);
    if (image) {
      const img = document.createElement('img');
      img.className = 'news-image'; img.src = image; img.alt = ''; img.loading = 'lazy';
      item.append(img);
    }
    const content = document.createElement('div'); content.className = 'news-content';
    const link = document.createElement('a');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = article.title;
    content.append(link);
    if (article.description) {
      const p = document.createElement('p'); p.className = 'news-description';
      p.textContent = article.description; content.append(p);
    }
    if (article.source?.name) {
      const small = document.createElement('p'); small.className = 'news-meta';
      small.textContent = article.source.name; content.append(small);
    }
    item.append(content); newsBox.append(item);
  }
  if (!newsBox.childElementCount) newsBox.textContent = '表示できるニュースがありません。';
}

async function loadNews() {
  newsBox.textContent = 'ニュースを取得しています…';
  genreBox.textContent = '取得中';
  try {
    const response = await fetch('/api/news?keyword=' + encodeURIComponent('テクノロジー'));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    genreBox.textContent = `ジャンル：${data.genre}`;
    displayNews(data.articles);
  } catch (error) {
    genreBox.textContent = 'ニュースを取得できません';
    newsBox.textContent = error.message;
    newsBox.classList.add('error');
  }
}
activateTab(0);
