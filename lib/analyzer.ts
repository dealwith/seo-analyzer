/**
 * SEO Keyword Analyzer
 * Copyright (C) 2024 SEO Analyzer Team
 *
 * Licensed under AGPL-3.0-or-Commercial
 * See LICENSE file for details
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will',
  'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
  'which', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
  'now', 'or', 'any', 'if', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'one', 'two', 'three',
  'would', 'could', 'also', 'much', 'many', 'may', 'do', 'does', 'did', 'been',
  'being', 'i', 'you', 'we', 'our', 'your'
]);

export interface WordAnalysis {
  word: string;
  count: number;
  percentage: number;
}

export interface CombinationAnalysis {
  phrase: string;
  count: number;
}

export interface AnalysisResult {
  wordAnalysis: WordAnalysis[];
  twoWordCombinations: CombinationAnalysis[];
  threeWordCombinations: CombinationAnalysis[];
  stats: {
    charsWithSpaces: number;
    totalWords: number;
    totalFilteredWords: number;
  };
}

export function analyzeText(text: string): AnalysisResult {
  const charsWithSpaces = text.length;
  const textLower = text.toLowerCase();
  const words = textLower.match(/\b[a-z]+\b/g) || [];
  const totalAllWords = words.length;

  const filteredWords = words.filter(
    word => !STOP_WORDS.has(word) && word.length > 2
  );

  const totalFilteredWords = filteredWords.length;
  const wordCounts = new Map<string, number>();

  filteredWords.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  const wordAnalysis: WordAnalysis[] = Array.from(wordCounts.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / totalFilteredWords) * 100
    }))
    .sort((a, b) => b.count - a.count);

  const twoWordCombinations = analyzeKeywordCombinations(filteredWords, 2);
  const threeWordCombinations = analyzeKeywordCombinations(filteredWords, 3);

  return {
    wordAnalysis,
    twoWordCombinations,
    threeWordCombinations,
    stats: {
      charsWithSpaces,
      totalWords: totalAllWords,
      totalFilteredWords
    }
  };
}

function analyzeKeywordCombinations(
  filteredWords: string[],
  n: number
): CombinationAnalysis[] {
  const combinations = new Map<string, number>();

  for (let i = 0; i <= filteredWords.length - n; i++) {
    const combo = filteredWords.slice(i, i + n).join(' ');
    combinations.set(combo, (combinations.get(combo) || 0) + 1);
  }

  return Array.from(combinations.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
