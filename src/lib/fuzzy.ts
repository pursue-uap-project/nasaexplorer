// Token-based Levenshtein distance matching for unified search

export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  for (let i = 0; i <= aLower.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= bLower.length; j++) {
    tmp[0][j] = j;
  }

  for (let i = 1; i <= aLower.length; i++) {
    for (let j = 1; j <= bLower.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // Deletion
        tmp[i][j - 1] + 1, // Insertion
        tmp[i - 1][j - 1] + (aLower[i - 1] === bLower[j - 1] ? 0 : 1) // Substitution
      );
    }
  }
  return tmp[aLower.length][bLower.length];
}

export function scoreMatch(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const textTokens = text.toLowerCase().split(/[\s,.:;!?()\-\[\]]+/).filter(Boolean);
  
  if (queryTokens.length === 0) return 0;

  let totalScore = 0;

  for (const qToken of queryTokens) {
    let bestTokenScore = 0;

    for (const tToken of textTokens) {
      if (tToken === qToken) {
        bestTokenScore = Math.max(bestTokenScore, 1.0);
      } else if (tToken.startsWith(qToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.8 * (qToken.length / tToken.length));
      } else if (tToken.includes(qToken)) {
        bestTokenScore = Math.max(bestTokenScore, 0.5 * (qToken.length / tToken.length));
      } else {
        const maxLen = Math.max(qToken.length, tToken.length);
        if (maxLen > 2) {
          const dist = getLevenshteinDistance(qToken, tToken);
          const maxAllowedTypos = qToken.length > 5 ? 2 : 1;
          if (dist <= maxAllowedTypos) {
            const similarity = 1 - dist / maxLen;
            bestTokenScore = Math.max(bestTokenScore, similarity * 0.4);
          }
        }
      }
    }

    totalScore += bestTokenScore;
  }

  return totalScore / queryTokens.length;
}

import type { SearchDoc, SearchKind } from "@/lib/search-index";

export type SearchResult = SearchDoc & { score: number };

/**
 * Puntúa un documento contra la consulta.
 *
 * Los pesos dicen qué significa «acertar»: el nombre pesa más que la
 * descripción porque quien escribe «Glenn» busca a Glenn, no un párrafo que lo
 * mencione. Las etiquetas van en medio: son términos exactos (un programa, un
 * año, un instrumento) y un acierto ahí es intencionado.
 */
function scoreDoc(query: string, doc: SearchDoc): number {
  const titulo = scoreMatch(query, doc.title) * 2.5;
  const subtitulo = scoreMatch(query, doc.subtitle) * 1.2;
  const descripcion = scoreMatch(query, doc.description) * 1.0;
  const etiquetas = doc.tags.length
    ? Math.max(...doc.tags.map((t) => scoreMatch(query, t))) * 1.5
    : 0;

  return Math.max(titulo, subtitulo, descripcion, etiquetas);
}

/**
 * Cuando dos cosas puntúan igual, decide qué se enseña antes. Una sección es
 * más útil que un lanzamiento suelto con el mismo nombre, porque lleva a un
 * sitio donde seguir buscando.
 */
const PRIORIDAD: Record<SearchKind, number> = {
  section: 6,
  mission: 5,
  active: 4,
  astronaut: 3,
  exoplanet: 2,
  launch: 1,
};

const UMBRAL = 0.15;

export function performUnifiedSearch(
  query: string,
  docs: SearchDoc[],
  /** Filtra por tipo; `null` los devuelve todos. */
  kind: SearchKind | null = null,
): SearchResult[] {
  if (!query.trim()) return [];

  const resultados: SearchResult[] = [];
  for (const doc of docs) {
    if (kind && doc.kind !== kind) continue;
    const score = scoreDoc(query, doc);
    if (score > UMBRAL) resultados.push({ ...doc, score });
  }

  return resultados.sort(
    (a, b) =>
      b.score - a.score ||
      PRIORIDAD[b.kind] - PRIORIDAD[a.kind] ||
      a.title.localeCompare(b.title),
  );
}
