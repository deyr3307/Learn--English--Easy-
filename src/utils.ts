/**
 * Computes the Levenshtein distance between two strings
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i: number, j: number;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (i = 0; i <= a.length; i++) tmp[i] = [i];
  for (j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Returns spelling suggestions from dictionary keys
 */
export function getSpellingSuggestions(word: string, dictKeys: string[]): string[] {
  const target = word.trim().toLowerCase();
  if (!target) return [];

  const candidates: { word: string; score: number }[] = [];

  for (const key of dictKeys) {
    const k = key.toLowerCase();
    if (k === target) continue;

    const isSubstring = k.includes(target) || target.includes(k);
    const dist = getLevenshteinDistance(target, k);

    // Reasonable thresholds based on word length
    const maxLen = Math.max(target.length, k.length);
    const allowedDist = maxLen <= 4 ? 2 : maxLen <= 7 ? 3 : 4;

    if (isSubstring || dist <= allowedDist) {
      // Prioritize substring matches by reducing their score
      const score = dist + (isSubstring ? -1.5 : 0);
      candidates.push({ word: key, score });
    }
  }

  // Sort ascending by score (lower is better)
  candidates.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.1) {
      return a.word.length - b.word.length;
    }
    return a.score - b.score;
  });

  return Array.from(new Set(candidates.map((c) => c.word))).slice(0, 4);
}
