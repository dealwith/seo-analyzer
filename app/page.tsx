'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnalysisResult, DEFAULT_STOP_WORDS } from '@/lib/analyzer';
import EditableHighlightedText from '@/components/EditableHighlightedText';
import ResizablePanels from '@/components/ResizablePanels';
import ServiceWordsPanel from '@/components/ServiceWordsPanel';
import Logo from '@/components/Logo';
import { generateDistinctColors } from '@/lib/colors';
import {
  savePanelWidth,
  loadPanelWidth,
  saveTabs,
  loadTabs,
  saveActiveTab,
  loadActiveTab,
  loadText,
  loadAnalysis,
  saveFilterStopWords,
  loadFilterStopWords,
  saveCustomStopWords,
  loadCustomStopWords,
  TabData,
} from '@/lib/storage';

const MAX_TABS = 3;

function createTab(index: number): TabData {
  return {
    id: `tab-${Date.now()}-${index}`,
    label: `Text ${index}`,
    text: '',
    analysis: null,
  };
}

export default function Home() {
  const [tabs, setTabs] = useState<TabData[]>(() => [createTab(1)]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number | undefined>(undefined);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const [customStopWords, setCustomStopWords] = useState<string[]>([...DEFAULT_STOP_WORDS]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state on mount
  useEffect(() => {
    setMounted(true);
    const savedPanelWidth = loadPanelWidth();
    if (savedPanelWidth !== null) setPanelWidth(savedPanelWidth);

    const savedFilter = loadFilterStopWords();
    setFilterStopWords(savedFilter);
    const savedCustomWords = loadCustomStopWords();
    if (savedCustomWords) setCustomStopWords(savedCustomWords);

    const savedTabs = loadTabs();
    const savedActiveTab = loadActiveTab();

    if (savedTabs && savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTabId(savedActiveTab && savedTabs.some(t => t.id === savedActiveTab)
        ? savedActiveTab
        : savedTabs[0].id
      );
    } else {
      // Migrate from old single-text storage
      const oldText = loadText();
      const oldAnalysis = loadAnalysis();
      const initialTab = createTab(1);
      if (oldText) initialTab.text = oldText;
      if (oldAnalysis) initialTab.analysis = oldAnalysis;
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
    }
  }, []);

  // Debounced save of tabs
  const debouncedSaveTabs = useCallback((tabsToSave: TabData[]) => {
    if (!mounted) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTabs(tabsToSave);
    }, 3000);
  }, [mounted]);

  // Save tabs when they change (debounced)
  useEffect(() => {
    if (!mounted) return;
    debouncedSaveTabs(tabs);
  }, [tabs, debouncedSaveTabs, mounted]);

  // Save active tab immediately
  useEffect(() => {
    if (mounted && activeTabId) {
      saveActiveTab(activeTabId);
    }
  }, [activeTabId, mounted]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const text = activeTab?.text || '';
  const analysis = activeTab?.analysis || null;

  const updateActiveTab = useCallback((updates: Partial<TabData>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  }, [activeTabId]);

  const setText = useCallback((newText: string) => {
    updateActiveTab({ text: newText });
  }, [updateActiveTab]);

  const setAnalysis = useCallback((newAnalysis: AnalysisResult | null) => {
    updateActiveTab({ analysis: newAnalysis });
  }, [updateActiveTab]);

  const colorMap = useMemo(() => {
    if (!analysis) return new Map<string, string>();

    const top20Words = analysis.wordAnalysis.slice(0, 20);
    const colors = generateDistinctColors(20);
    const map = new Map<string, string>();

    top20Words.forEach((item, index) => {
      map.set(item.word, colors[index]);
    });

    return map;
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setSelectedWord(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, filterStopWords, customStopWords }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
      // Force immediate save after analysis
      if (mounted) {
        const updatedTabs = tabs.map(tab =>
          tab.id === activeTabId ? { ...tab, analysis: result } : tab
        );
        saveTabs(updatedTabs);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(selectedWord === word ? null : word);
  };

  const handleRowClick = (word: string) => {
    setSelectedWord(selectedWord === word ? null : word);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all text and analysis?')) {
      updateActiveTab({ text: '', analysis: null });
      setSelectedWord(null);
    }
  };

  const handleFilterToggle = useCallback((enabled: boolean) => {
    setFilterStopWords(enabled);
    if (mounted) saveFilterStopWords(enabled);
  }, [mounted]);

  const handleCustomStopWordsChange = useCallback((words: string[]) => {
    setCustomStopWords(words);
    if (mounted) saveCustomStopWords(words);
  }, [mounted]);

  const handlePanelWidthChange = (width: number) => {
    setPanelWidth(width);
    if (mounted) {
      savePanelWidth(width);
    }
  };

  const handleAddTab = () => {
    if (tabs.length >= MAX_TABS) return;
    const newTab = createTab(tabs.length + 1);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setSelectedWord(null);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const newIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newIndex].id);
    }
    setSelectedWord(null);
  };

  const handleSwitchTab = (tabId: string) => {
    if (tabId === activeTabId) return;
    setActiveTabId(tabId);
    setSelectedWord(null);
  };

  return (
    <div className="tw-min-h-screen tw-flex tw-flex-col tw-bg-base-200">

      {/* Header — DaisyUI navbar */}
      <div className="dui-navbar tw-bg-neutral tw-text-neutral-content tw-shadow-lg tw-py-5">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-6 tw-w-full tw-max-w-6xl tw-mx-auto tw-px-4 tw-flex-col sm:tw-flex-row tw-text-center sm:tw-text-left">
          <Logo size={56} className="tw-flex-shrink-0 tw-drop-shadow-md" />
          <div className="tw-flex tw-flex-col tw-gap-1">
            <h1 className="tw-text-3xl tw-font-bold tw-leading-tight">SEO Keyword Analyzer</h1>
            <p className="tw-text-sm tw-opacity-80 tw-leading-snug">Analyze your text to identify keyword density and combinations</p>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="tw-bg-neutral/80 tw-px-4 tw-pt-2 tw-flex tw-items-end" style={{ backgroundColor: '#34495e' }}>
        <div className="tw-flex tw-gap-[2px] tw-items-end tw-overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-t tw-text-sm tw-font-medium tw-cursor-pointer tw-transition-colors tw-whitespace-nowrap tw-max-w-[180px] tw-border-0 ${
                tab.id === activeTabId
                  ? 'tw-bg-base-200 tw-text-neutral tw-font-semibold'
                  : 'tw-bg-neutral tw-text-neutral-content/60 hover:tw-bg-neutral-focus hover:tw-text-neutral-content'
              }`}
              onClick={() => handleSwitchTab(tab.id)}
              title={tab.label}
            >
              <span className="tw-overflow-hidden tw-text-ellipsis">{tab.label}</span>
              {tab.analysis && (
                <span className={`dui-badge dui-badge-xs ${tab.id === activeTabId ? 'dui-badge-success' : 'dui-badge-info'}`} />
              )}
              {tabs.length > 1 && (
                <span
                  className="tw-text-lg tw-leading-none tw-opacity-50 hover:tw-opacity-100 tw-flex-shrink-0 tw-px-[2px] tw-transition-opacity"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  title="Close tab"
                >
                  &times;
                </span>
              )}
            </button>
          ))}
          {tabs.length < MAX_TABS && (
            <button
              className="tw-flex tw-items-center tw-px-3 tw-py-2 tw-bg-transparent tw-text-neutral-content/60 tw-border tw-border-dashed tw-border-neutral-content/30 tw-rounded-t tw-text-base tw-font-semibold tw-cursor-pointer hover:tw-text-neutral-content tw-transition-colors"
              style={{ borderColor: 'rgba(149,165,166,0.5)' }}
              onClick={handleAddTab}
              title="Open new tab (max 3)"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <ResizablePanels
        savedWidth={panelWidth}
        onWidthChange={handlePanelWidthChange}
        leftPanel={
          <div className="tw-flex tw-flex-col tw-gap-4 tw-h-full">
            <label htmlFor="text-input" className="tw-text-lg tw-font-semibold tw-text-base-content">
              <strong>Enter Your Text:</strong>
            </label>
            <ServiceWordsPanel
              filterEnabled={filterStopWords}
              onFilterToggle={handleFilterToggle}
              customStopWords={customStopWords}
              onCustomStopWordsChange={handleCustomStopWordsChange}
            />
            {analysis ? (
              <EditableHighlightedText
                text={text}
                topWords={analysis.wordAnalysis.slice(0, 20)}
                colorMap={colorMap}
                selectedWord={selectedWord}
                onWordClick={handleWordClick}
                onTextChange={setText}
              />
            ) : (
              <textarea
                id="text-input"
                className="dui-textarea dui-textarea-bordered tw-flex-1 tw-resize-y tw-text-[0.95rem] tw-font-[inherit] tw-leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here for SEO analysis..."
                rows={20}
              />
            )}
            <div className="tw-flex tw-gap-2 tw-flex-wrap">
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="dui-btn dui-btn-primary tw-flex-1 tw-min-w-[120px]"
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </button>
              {text && (
                <button
                  onClick={handleClear}
                  className="dui-btn dui-btn-error tw-flex-1 tw-min-w-[120px]"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        }
        rightPanel={
          analysis ? (
            <div className="tw-flex tw-flex-col tw-gap-8">

              {/* Statistics — DaisyUI stats */}
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-text-base-content tw-mb-4 tw-pb-2 tw-border-b-2 tw-border-primary">
                  Statistics
                </h2>
                <div className="dui-stats tw-shadow tw-w-full">
                  <div className="dui-stat tw-place-items-center">
                    <div className="dui-stat-title">Characters</div>
                    <div className="dui-stat-value tw-text-primary">{analysis.stats.charsWithSpaces}</div>
                  </div>
                  <div className="dui-stat tw-place-items-center">
                    <div className="dui-stat-title">Total Words</div>
                    <div className="dui-stat-value tw-text-primary">{analysis.stats.totalWords}</div>
                  </div>
                  <div className="dui-stat tw-place-items-center">
                    <div className="dui-stat-title">Meaningful Words</div>
                    <div className="dui-stat-value tw-text-primary">{analysis.stats.totalFilteredWords}</div>
                  </div>
                </div>
              </div>

              {/* Top 20 Keywords — DaisyUI table */}
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-text-base-content tw-mb-4 tw-pb-2 tw-border-b-2 tw-border-primary">
                  Top 20 Keywords
                </h2>
                <div className="tw-overflow-x-auto">
                  <table className="dui-table dui-table-sm">
                    <thead>
                      <tr>
                        <th className="tw-w-12 tw-text-center">#</th>
                        <th>Word</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.wordAnalysis.slice(0, 20).map((item, index) => (
                        <tr
                          key={item.word}
                          className={`tw-cursor-pointer tw-transition-colors ${
                            selectedWord === item.word
                              ? 'tw-bg-primary/10'
                              : 'hover:tw-bg-base-200'
                          }`}
                          onClick={() => handleRowClick(item.word)}
                        >
                          <td className="tw-text-center tw-text-base-content/50 tw-font-medium">{index + 1}</td>
                          <td>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span
                                className="tw-inline-block tw-rounded tw-border tw-border-base-300 tw-flex-shrink-0"
                                style={{
                                  backgroundColor: colorMap.get(item.word),
                                  width: '20px',
                                  height: '20px',
                                }}
                              />
                              {item.word}
                            </div>
                          </td>
                          <td>{item.count}</td>
                          <td>{item.percentage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2-word combinations — DaisyUI table */}
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-text-base-content tw-mb-4 tw-pb-2 tw-border-b-2 tw-border-primary">
                  Top 10 Keyword Combinations (2-word phrases)
                </h2>
                <div className="tw-overflow-x-auto">
                  <table className="dui-table dui-table-sm">
                    <thead>
                      <tr>
                        <th className="tw-w-12 tw-text-center">#</th>
                        <th>Phrase</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.twoWordCombinations.map((item, index) => (
                        <tr key={item.phrase} className="hover:tw-bg-base-200">
                          <td className="tw-text-center tw-text-base-content/50 tw-font-medium">{index + 1}</td>
                          <td>{item.phrase}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3-word combinations — DaisyUI table */}
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-text-base-content tw-mb-4 tw-pb-2 tw-border-b-2 tw-border-primary">
                  Top 10 Keyword Combinations (3-word phrases)
                </h2>
                <div className="tw-overflow-x-auto">
                  <table className="dui-table dui-table-sm">
                    <thead>
                      <tr>
                        <th className="tw-w-12 tw-text-center">#</th>
                        <th>Phrase</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.threeWordCombinations.map((item, index) => (
                        <tr key={item.phrase} className="hover:tw-bg-base-200">
                          <td className="tw-text-center tw-text-base-content/50 tw-font-medium">{index + 1}</td>
                          <td>{item.phrase}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* Empty state */
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-base-content/40 tw-text-center tw-p-8">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tw-mb-4"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p className="tw-text-lg">Enter text on the left and click &ldquo;Analyze Text&rdquo; to see results</p>
            </div>
          )
        }
      />

      {/* Footer */}
      <footer className="tw-bg-neutral tw-text-neutral-content tw-py-8 tw-px-4 tw-text-center tw-mt-auto tw-border-t-4 tw-border-primary">
        <p className="tw-text-sm tw-leading-relaxed">
          SEO Keyword Analyzer © 2024 | Licensed under{' '}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.en.html"
            target="_blank"
            rel="noopener noreferrer"
            className="dui-link dui-link-primary"
          >
            AGPL-3.0
          </a>
          {' '}or Commercial License
        </p>
        <p className="tw-text-xs tw-opacity-80 tw-max-w-2xl tw-mx-auto tw-mt-2">
          Open source for individuals and small businesses. Commercial license required for corporations ($1M+ revenue).{' '}
          <a href="https://github.com/dealwith/seo-analyzer" target="_blank" rel="noopener noreferrer" className="dui-link dui-link-primary">
            View Source
          </a>
        </p>
      </footer>

    </div>
  );
}
