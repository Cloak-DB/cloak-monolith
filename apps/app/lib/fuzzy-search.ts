/**
 * Fuzzy search utilities using Damerau-Levenshtein distance
 *
 * Handles typos including:
 * - Insertions (hell -> hello)
 * - Deletions (hello -> helo)
 * - Substitutions (hello -> hallo)
 * - Transpositions (hello -> hlelo)
 */

/**
 * Calculate Damerau-Levenshtein distance between two strings
 * Returns the minimum number of operations (insert, delete, substitute, transpose)
 * needed to transform string a into string b
 */
export function damerauLevenshtein(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  // Handle edge cases
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  // Create distance matrix
  const d: number[][] = Array(lenA + 1)
    .fill(null)
    .map(() => Array(lenB + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= lenA; i++) d[i][0] = i;
  for (let j = 0; j <= lenB; j++) d[0][j] = j;

  // Fill in the rest of the matrix
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );

      // Check for transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  return d[lenA][lenB];
}

/**
 * Calculate max allowed distance based on string length
 * Shorter strings allow fewer errors
 */
function getMaxDistance(length: number): number {
  if (length <= 2) return 0; // No typos for very short strings
  if (length <= 4) return 1; // 1 typo for short strings
  if (length <= 7) return 2; // 2 typos for medium strings
  return 3; // Max 3 typos for long strings
}

/**
 * Check if needle fuzzy matches haystack
 * Returns true if the needle is found within acceptable edit distance
 */
export function fuzzyMatch(
  needle: string,
  haystack: string,
  maxDistance?: number,
): boolean {
  const needleLower = needle.toLowerCase();
  const haystackLower = haystack.toLowerCase();

  // Exact substring match is always a match
  if (haystackLower.includes(needleLower)) {
    return true;
  }

  // For very short needles, only allow exact matches
  if (needleLower.length <= 2) {
    return false;
  }

  const allowedDistance = maxDistance ?? getMaxDistance(needleLower.length);

  // Check if any word in haystack is close enough
  const words = haystackLower.split(/\s+/);
  for (const word of words) {
    if (damerauLevenshtein(needleLower, word) <= allowedDistance) {
      return true;
    }
  }

  // Also check sliding window for partial matches in longer strings
  if (haystackLower.length >= needleLower.length) {
    for (let i = 0; i <= haystackLower.length - needleLower.length; i++) {
      const substring = haystackLower.substring(i, i + needleLower.length);
      if (damerauLevenshtein(needleLower, substring) <= allowedDistance) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Convert any value to a searchable string
 */
function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

/**
 * Search rows with fuzzy matching
 * Returns rows where any column matches the query
 */
export function fuzzySearchRows<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
): T[] {
  // Defensive: ensure rows is a valid array
  if (!rows || !Array.isArray(rows)) {
    return [];
  }

  if (!query.trim()) {
    return rows;
  }

  const searchTerms = query.trim().toLowerCase().split(/\s+/);

  return rows.filter((row) => {
    // Skip null/undefined rows
    if (!row || typeof row !== 'object') {
      return false;
    }
    // All search terms must match at least one column
    return searchTerms.every((term) => {
      return Object.values(row).some((value) => {
        const strValue = valueToString(value);
        return fuzzyMatch(term, strValue);
      });
    });
  });
}

/**
 * Get columns that match the search query for a specific row
 * Used for highlighting matched cells
 */
export function getMatchingColumns<T extends Record<string, unknown>>(
  row: T,
  query: string,
): string[] {
  if (!query.trim()) {
    return [];
  }

  const searchTerms = query.trim().toLowerCase().split(/\s+/);
  const matchingCols: string[] = [];

  for (const [key, value] of Object.entries(row)) {
    const strValue = valueToString(value);
    const matches = searchTerms.some((term) => fuzzyMatch(term, strValue));
    if (matches) {
      matchingCols.push(key);
    }
  }

  return matchingCols;
}

/**
 * Calculate a fuzzy match score between query and target string.
 * Lower score = better match.
 * Returns Infinity for poor matches.
 */
export function fuzzyScore(query: string, target: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerTarget = target.toLowerCase();

  // Exact match
  if (lowerTarget === lowerQuery) return 0;

  // Starts with query (very good match)
  if (lowerTarget.startsWith(lowerQuery)) return 0.5;

  // Contains query as substring (good match)
  if (lowerTarget.includes(lowerQuery)) return 1;

  // For short queries, be more lenient
  const distance = damerauLevenshtein(lowerQuery, lowerTarget);

  // Normalize by the length of the longer string
  const maxLen = Math.max(lowerQuery.length, lowerTarget.length);
  const normalizedDistance = distance / maxLen;

  // If the distance is more than 60% of the string length, it's probably not a match
  if (normalizedDistance > 0.6) return Infinity;

  // Return a score that factors in both distance and whether it's a substring match
  return 2 + normalizedDistance * 10;
}

/**
 * Fuzzy search and rank items using Damerau-Levenshtein distance
 */
export function fuzzySearchItems<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string[],
): T[] {
  if (!query.trim()) return items;

  const scored = items
    .map((item) => {
      const searchTexts = getSearchText(item);
      // Get the best score across all search texts for this item
      const bestScore = Math.min(
        ...searchTexts.map((text) => fuzzyScore(query, text)),
      );
      return { item, score: bestScore };
    })
    .filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score);

  return scored.map(({ item }) => item);
}
