/**
 * SEO Keyword Analyzer
 * Copyright (C) 2024 SEO Analyzer Team
 *
 * Licensed under AGPL-3.0-or-Commercial
 * See LICENSE file for details
 */

import { AnalysisResult } from './analyzer';

const STORAGE_KEYS = {
  TEXT: 'seo-analyzer-text',
  ANALYSIS: 'seo-analyzer-analysis',
  PANEL_WIDTH: 'seo-analyzer-panel-width',
  TABS: 'seo-analyzer-tabs',
  ACTIVE_TAB: 'seo-analyzer-active-tab',
  FILTER_STOP_WORDS: 'seo-analyzer-filter-stop-words',
  CUSTOM_STOP_WORDS: 'seo-analyzer-custom-stop-words',
};

export interface TabData {
  id: string;
  label: string;
  text: string;
  analysis: AnalysisResult | null;
}

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

export function savePanelWidth(width: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PANEL_WIDTH, String(width));
}

export function loadPanelWidth(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.PANEL_WIDTH);
  if (!stored) return null;
  const width = parseFloat(stored);
  return isNaN(width) ? null : width;
}

export function saveTabs(tabs: TabData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
}

export function loadTabs(): TabData[] | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.TABS);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveActiveTab(tabId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
}

export function loadActiveTab(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
}

export function saveFilterStopWords(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FILTER_STOP_WORDS, JSON.stringify(enabled));
}

export function loadFilterStopWords(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEYS.FILTER_STOP_WORDS);
  if (!stored) return true;
  try {
    return JSON.parse(stored);
  } catch {
    return true;
  }
}

export function saveCustomStopWords(words: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_STOP_WORDS, JSON.stringify(words));
}

export function loadCustomStopWords(): string[] | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_STOP_WORDS);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
