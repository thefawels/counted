import { supplyBranches } from './supplies-data-v09.js';
import { suppliesTemplateBase64 } from './supplies-template-v09.js';
export { supplyBranches };

export function isManual(source) {
  return source?.mode === 'count' || source?.mode === 'supplies';
}

export function createSuppliesSource(branchId) {
  const branch = supplyBranches.find(item => item.id === branchId);
  if (!branch) throw new Error('Пиццерия не найдена');
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  return {
    version: 3, mode: 'supplies', branchId,
    fingerprint: `standalone-supplies-v1:${branchId}`,
    fileName: `Расходники — ${branch.name}`, sheetName: branch.name,
    revisions: [{key: 'supplies', display: now.toLocaleDateString('ru-RU'), isoDate: date}],
    products: branch.products.map(product => ({...product, revisions: {supplies: 0}, loss: 0, unaccountedLossMoney: 0, unitPrice: null})),
    summary: {pizzeria: `Расходники · ${branch.name}`, period: '', totalLoss: 0, totalLossPercent: null, unaccountedLoss: 0, unaccountedLossPercent: null, revenue: null},
    warnings: [],
  };
}

// Modify only the chosen sheet's quantity cells in the original XLSX ZIP.
// This avoids re-creating the workbook and losing its print layout or styles.
export function exportSuppliesTemplate(source, reviews, CFB) {
  const branch = supplyBranches.find(item => item.id === source.branchId);
  if (source.mode !== 'supplies' || !branch) throw new Error('Пиццерия не найдена');
  const zip = CFB.read(suppliesTemplateBase64, {type: 'base64'});
  const read = path => {
    const entry = CFB.find(zip, '/' + path);
    if (!entry) throw new Error('Не удалось открыть бланк расходников');
    return new TextDecoder().decode(new Uint8Array(entry.content));
  };
  const put = (path, value) => CFB.utils.cfb_add(zip, '/' + path, new TextEncoder().encode(value));
  let xml = read(branch.sheetPath);
  for (const product of branch.products) {
    const review = reviews[product.id];
    if (!review) continue;
    if (!Number.isFinite(review.value) || review.value < 0) throw new Error('Некорректное количество');
    const pattern = new RegExp(`<c\\b([^>]*\\br="${product.quantityCell}"[^>]*?)(?:\\s*/>|>[\\s\\S]*?</c>)`);
    if (!pattern.test(xml)) throw new Error(`В бланке нет ячейки ${product.quantityCell}`);
    xml = xml.replace(pattern, (_match, attrs) => `<c${attrs.replace(/\s+t="[^"]*"/g, '')}><v>${review.value}</v></c>`);
  }
  put(branch.sheetPath, xml);
  // Open the exported workbook on the pizzeria that was counted.
  let workbook = read('xl/workbook.xml');
  workbook = workbook.replace(/<workbookView\b([^>]*?)(\/?)>/, (_match, attrs, slash) =>
    `<workbookView${attrs.replace(/\s+activeTab="[^"]*"/g, '')} activeTab="${branch.sheetIndex}"${slash}>`);
  put('xl/workbook.xml', workbook);
  return {
    bytes: new Uint8Array(CFB.write(zip, {fileType: 'zip', type: 'array', compression: true})),
    fileName: `Расходники_${branch.name}_${source.revisions[0].isoDate}.xlsx`,
  };
}
