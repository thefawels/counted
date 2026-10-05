import { catalog } from './catalog.js';

export function createCountSource(categoryForName) {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return {
    version: 3, mode: 'count', fingerprint: 'standalone-catalog-v1',
    fileName: 'Подсчёт без отчёта', sheetName: '',
    revisions: [{ key: 'count', display: now.toLocaleDateString('ru-RU'), isoDate: date }],
    products: catalog.map(({ sourceCategory, ...product }) => ({
      ...product,
      category: sourceCategory === 'Упаковка' ? 'Упаковка' : categoryForName(product.name),
      revisions: { count: 0 }, loss: 0, unaccountedLossMoney: 0, unitPrice: null,
    })),
    summary: { pizzeria: 'Подсчёт без отчёта', period: '', totalLoss: 0, totalLossPercent: null, unaccountedLoss: 0, unaccountedLossPercent: null, revenue: null },
    warnings: [],
  };
}

export function countExport(products, revision, reviews, includeUnchecked, categories) {
  const included = products.filter(product => includeUnchecked || reviews[product.id]);
  const rows = [], categoryRowNumbers = [];
  for (const category of categories) {
    const group = included.filter(product => product.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru-RU', { sensitivity: 'base' }));
    if (!group.length) continue;
    categoryRowNumbers.push(rows.length + 2);
    rows.push([category, '', '']);
    for (const product of group) rows.push([product.name, product.unit, reviews[product.id]?.value ?? '']);
  }
  return { headers: ['Продукт', 'Ед. изм.', 'Количество'], rows, categoryRowNumbers,
    fileName: `Подсчёт_${revision.isoDate}.xlsx`, rowCount: included.length };
}

export const countFilters = [
  { id: 'all', label: 'Все' },
  { id: 'checked', label: 'Посчитано' },
  { id: 'unchecked', label: 'Не посчитано' },
];
