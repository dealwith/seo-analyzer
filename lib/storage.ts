import { AnalysisResult } from './analyzer';

const STORAGE_KEYS = {
  TEXT: 'seo-analyzer-text',
  ANALYSIS: 'seo-analyzer-analysis',
  SHOW_HIGHLIGHTED: 'seo-analyzer-show-highlighted',
};

export function saveText(text: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TEXT, text);
}

export function loadText(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.TEXT) || '';
}

export function saveAnalysis(analysis: AnalysisResult | null): void {
  if (typeof window === 'undefined') return;
  if (analysis) {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
  }
}

export function loadAnalysis(): AnalysisResult | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveShowHighlighted(show: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SHOW_HIGHLIGHTED, String(show));
}

export function loadShowHighlighted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SHOW_HIGHLIGHTED) === 'true';
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
