// Standalone counts retain both the quantity and the original calculation.
export function blocksFor(review) {
  if (!review) return [];
  if (Array.isArray(review.blocks)) return review.blocks;
  if (!Number.isFinite(review.value)) return [];
  return [{ id: 'legacy', value: review.value, expression: String(review.value).replace('.', ',') }];
}

export function blockTotal(blocks) {
  const value = Math.round(blocks.reduce((sum, block) => sum + block.value, 0) * 1000) / 1000;
  if (!Number.isFinite(value)) throw new Error('Слишком большое количество');
  return value;
}

function reviewFor(blocks) {
  return blocks.length ? { blocks, value: blockTotal(blocks), status: 'same', updatedAt: new Date().toISOString() } : null;
}

export function saveBlock(review, expression, value, editId = null) {
  if (!Number.isFinite(value) || value < 0) throw new Error('Количество не может быть отрицательным');
  const blocks = blocksFor(review);
  if (editId !== null && !blocks.some(block => block.id === editId)) {
    throw new Error('Этот подсчёт уже удалён');
  }
  const block = { id: editId ?? globalThis.crypto.randomUUID(), expression, value };
  return reviewFor(editId === null ? [...blocks, block] : blocks.map(item => item.id === editId ? block : item));
}

export function removeBlock(review, id) {
  return reviewFor(blocksFor(review).filter(block => block.id !== id));
}

export function migrateCountReviews(reviews) {
  return Object.fromEntries(Object.entries(reviews ?? {}).flatMap(([id, review]) => {
    const migrated = reviewFor(blocksFor(review));
    return migrated ? [[id, migrated]] : [];
  }));
}

// Refresh the visible catalog; retained review IDs keep existing counts available.
export function refreshCountSource(source, fresh) {
 if(source?.mode !== 'count')return source;
 return {...source,products:fresh.products};
}
