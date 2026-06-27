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

export type SearchResult = {
  type: "nasa";
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  tags?: string[];
  score: number;
};

export interface NasaMission {
  id: string;
  name: string;
  program: string;
  description: { es: string; en: string };
  launch_details: { date: string };
}

export function performUnifiedSearch(
  query: string,
  nasaMissions: NasaMission[],
  locale: "en" | "es"
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  // Search NASA Missions
  for (const mission of nasaMissions) {
    const title = mission.name;
    const desc = locale === "es" ? mission.description.es : mission.description.en;
    const program = mission.program;
    const launchYear = mission.launch_details.date?.slice(0, 4) || "";

    const titleScore = scoreMatch(query, title) * 2.5; // weight title matches higher
    const descScore = scoreMatch(query, desc) * 1.0;
    const progScore = scoreMatch(query, program) * 1.5;
    const yearScore = scoreMatch(query, launchYear) * 1.0;

    const maxScore = Math.max(titleScore, descScore, progScore, yearScore);

    if (maxScore > 0.15) {
      results.push({
        type: "nasa",
        id: mission.id,
        title,
        subtitle: `NASA Mission · ${program} (${launchYear})`,
        description: desc,
        url: `/missions/${mission.id}`,
        tags: [program, launchYear].filter(Boolean),
        score: maxScore,
      });
    }
  }

  // Sort by score descending, then by title
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
