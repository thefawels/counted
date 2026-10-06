export function anomaly(original, value, unit) {
  if (!Number.isFinite(original) || !Number.isFinite(value) || value < 0) return null;
  const difference = Math.round((value - original) * 1000) / 1000;
  const minimum = String(unit).trim().toLowerCase() === 'шт' ? 5 : 1;
  if (Math.abs(difference) + 1e-9 < minimum) return null;
  const ratio = original === 0 ? null : Math.abs(difference) / Math.abs(original);
  if (ratio !== null && ratio + 1e-9 < 0.85) return null;
  const sign = difference < 0 ? '−' : '+';
  const amount = new Intl.NumberFormat('ru-RU', {maximumFractionDigits:3}).format(Math.abs(difference));
  return { direction: difference < 0 ? 'minus' : 'plus',
    label: `${sign}${amount} ${unit}${ratio === null ? '' : ` · ${sign}${Math.round(ratio * 100)}%`}` };
}
export function nextUncounted(products, currentId, reviews) {
  const index = products.findIndex(product => product.id === currentId);
  // Wrap to earlier uncounted positions, but never reopen the current product.
  const ordered = index < 0 ? products : [...products.slice(index + 1), ...products.slice(0, index)];
  return ordered.find(product => product.id !== currentId && !reviews[product.id]) ?? null;
}
