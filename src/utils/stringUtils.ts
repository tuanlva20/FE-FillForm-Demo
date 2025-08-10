// Simple fuzzy similarity based on normalized tokens and containment
export function normalizeForCompare(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

export function tokenSetRatio(a: string, b: string): number {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return 0;

  if (na === nb) return 1;

  // Token sets
  const setA = new Set(na.split(' '));
  const setB = new Set(nb.split(' '));

  let intersection = 0;
  setA.forEach((t) => {
    if (setB.has(t)) intersection += 1;
  });

  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return union === 0 ? 0 : intersection / union;
}

export function partialRatio(a: string, b: string): number {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return 0;
  // containment
  if (na.length > nb.length) {
    return na.includes(nb) ? nb.length / na.length : 0;
  }
  return nb.includes(na) ? na.length / nb.length : 0;
}

export function fuzzyScore(a: string, b: string): number {
  // Blend of token set ratio and partial containment
  const ts = tokenSetRatio(a, b);
  const pr = partialRatio(a, b);
  return Math.max(ts, pr);
}


