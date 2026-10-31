// 第4・5章：タブの切り替え・検索欄のフォーカス
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const searchInput = document.getElementById('search-input');

function activateTab(index, moveFocus = false) {
  if (index < 0 || index >= tabs.length || !panels[index]) return;
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (moveFocus) tabs[index].focus();
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => activateTab(index)));

window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.altKey && (event.key === '1' || event.key === '2')) {
    const index = Number(event.key) - 1;
    if (index < tabs.length) {
      event.preventDefault();
      activateTab(index);
    }
  } else if (event.altKey && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    activateTab(0);
    searchInput.focus();
  } else if (!event.altKey && event.key === '/' &&
    !event.target.closest('input, textarea, select, [contenteditable="true"]')) {
    event.preventDefault();
    activateTab(0);
    searchInput.focus();
  }
});

activateTab(0);
