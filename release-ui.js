export const version = 'ver 0.5';
// Release notes approved by the owner on 05.10.2026.
export const releaseNotes = [{
  date: '05.10.2026',
  items: [
    'Добавлен подсчёт без отчёта.',
    'Убрана кнопка полного сброса C.',
    'Переработан тактильный отклик клавиш для iPhone.',
    'Обновлён главный экран.',
  ],
}];
export function renderCredit(w) {
  return w.jsxs('footer', { className: 'brand-credit', children: [
    w.jsx('p', { children: 'Made by fw with 🤍' }),
    w.jsx('a', { href: 'https://t.me/fawels', target: '_blank', rel: 'noopener noreferrer', children: 'contact: telegram' }),
  ] });
}
export function renderReleasePanel(w, close) {
  return w.jsx('div', { className: 'modal-backdrop info-backdrop', onMouseDown: e => { if (e.target === e.currentTarget) close(); }, children:
    w.jsxs('section', { className: 'info-sheet release-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'release-title', children: [
      w.jsxs('header', { className: 'info-heading', children: [
        w.jsxs('div', { children: [w.jsx('p', { children: version }), w.jsx('h2', { id: 'release-title', children: 'Что нового' })] }),
        w.jsx('button', { type: 'button', className: 'icon-button', 'aria-label': 'Закрыть изменения', onClick: close, children: '×' }),
      ] }),
      w.jsx('div', { className: 'info-content', children: releaseNotes.map(note => w.jsxs('article', { children: [
        w.jsx('p', { className: 'release-date', children: note.date }),
        w.jsx('ul', { children: note.items.map(item => w.jsx('li', { children: item }, item)) }),
      ] }, note.date)) }),
    ] }),
  });
}
