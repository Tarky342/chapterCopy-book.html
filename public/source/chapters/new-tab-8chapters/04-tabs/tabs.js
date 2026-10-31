// 第4章：タブとパネルをaria-controlsで対応付ける
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

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

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(index));
});

window.addEventListener('keydown', event => {
  if (!event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) return;
  if (event.key === '1' || event.key === '2') {
    const index = Number(event.key) - 1;
    if (index < tabs.length) {
      event.preventDefault();
      activateTab(index);
    }
  }
});

activateTab(0);
