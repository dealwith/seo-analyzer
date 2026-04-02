'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnalysisResult, WordAnalysis, DEFAULT_STOP_WORDS } from '@/lib/analyzer';
import EditableHighlightedText from '@/components/EditableHighlightedText';
import ResizablePanels from '@/components/ResizablePanels';
import ServiceWordsPanel from '@/components/ServiceWordsPanel';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
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

type HighlightMode = 'off' | 'words' | 'two-word' | 'three-word';

const HIGHLIGHT_OPTIONS: Array<{ value: HighlightMode; label: string }> = [
  { value: 'words', label: 'Words' },
  { value: 'two-word', label: '2-word' },
  { value: 'three-word', label: '3-word' },
  { value: 'off', label: 'Off' },
];

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
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('words');
  const [colorfulHighlight, setColorfulHighlight] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const oldText = loadText();
      const oldAnalysis = loadAnalysis();
      const initialTab = createTab(1);
      if (oldText) initialTab.text = oldText;
      if (oldAnalysis) initialTab.analysis = oldAnalysis;
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
    }
  }, []);

  const debouncedSaveTabs = useCallback((tabsToSave: TabData[]) => {
    if (!mounted) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTabs(tabsToSave);
    }, 3000);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    debouncedSaveTabs(tabs);
  }, [tabs, debouncedSaveTabs, mounted]);

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

  const { highlightItems, colorMap } = useMemo(() => {
    if (!analysis || highlightMode === 'off') {
      return { highlightItems: [] as WordAnalysis[], colorMap: new Map<string, string>() };
    }

    let items: WordAnalysis[];

    switch (highlightMode) {
      case 'words':
        items = analysis.wordAnalysis.slice(0, 20);
        break;
      case 'two-word':
        items = analysis.twoWordCombinations.map(c => ({
          word: c.phrase,
          count: c.count,
          percentage: 0,
        }));
        break;
      case 'three-word':
        items = analysis.threeWordCombinations.map(c => ({
          word: c.phrase,
          count: c.count,
          percentage: 0,
        }));
        break;
    }

    const colors = generateDistinctColors(items.length);
    const map = new Map<string, string>();
    items.forEach((item, index) => {
      map.set(item.word, colors[index]);
    });

    return { highlightItems: items, colorMap: map };
  }, [analysis, highlightMode]);

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

  const handleHighlightModeChange = (mode: HighlightMode) => {
    setHighlightMode(mode);
    setSelectedWord(null);
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

  const editorHighlightMode: 'words' | 'phrases' =
    highlightMode === 'two-word' || highlightMode === 'three-word' ? 'phrases' : 'words';

  const renderColorSwatch = (key: string) => {
    const color = colorMap.get(key);
    if (colorfulHighlight) {
      return (
        <span
          style={{
            backgroundColor: color,
            width: '16px',
            height: '16px',
            borderRadius: '3px',
            display: 'inline-block',
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        />
      );
    }
    return (
      <span
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '3px',
          display: 'inline-block',
          flexShrink: 0,
          border: '2px solid #2563eb',
          background: 'transparent',
        }}
      />
    );
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <Logo size={56} className="logo" />
          <div className="header-text">
            <h1>SEO Keyword Analyzer</h1>
            <p>Analyze your text to identify keyword density and combinations</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="tabs-bar">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => handleSwitchTab(tab.id)}
              title={tab.label}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.analysis && <span className="tab-dot" />}
              {tabs.length > 1 && (
                <span
                  className="tab-close"
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
              className="tab-add"
              onClick={handleAddTab}
              title="Open new tab (max 3)"
            >
              +
            </button>
          )}
        </div>
      </div>

      <ResizablePanels
        savedWidth={panelWidth}
        onWidthChange={handlePanelWidthChange}
        leftPanel={
          <div className="input-section">
            <label htmlFor="text-input">
              <strong>Enter Your Text:</strong>
            </label>
            <ServiceWordsPanel
              filterEnabled={filterStopWords}
              onFilterToggle={handleFilterToggle}
              customStopWords={customStopWords}
              onCustomStopWordsChange={handleCustomStopWordsChange}
            />
            {analysis && (
              <div className="highlight-mode">
                <span className="highlight-mode-label">Highlight:</span>
                <div className="highlight-mode-buttons">
                  {HIGHLIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`highlight-mode-btn ${highlightMode === opt.value ? 'active' : ''}`}
                      onClick={() => handleHighlightModeChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {highlightMode !== 'off' && (
                  <button
                    className={`highlight-style-btn ${colorfulHighlight ? 'colorful' : 'outline'}`}
                    onClick={() => setColorfulHighlight(prev => !prev)}
                    title={colorfulHighlight ? 'Switch to outline style' : 'Switch to colorful style'}
                  >
                    <span className="highlight-style-preview" />
                    {colorfulHighlight ? 'Color' : 'Outline'}
                  </button>
                )}
              </div>
            )}
            {analysis ? (
              <EditableHighlightedText
                text={text}
                topWords={highlightItems}
                colorMap={colorMap}
                colorful={colorfulHighlight}
                selectedWord={selectedWord}
                highlightMode={editorHighlightMode}
                onWordClick={handleWordClick}
                onTextChange={setText}
              />
            ) : (
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here for SEO analysis..."
                rows={20}
              />
            )}
            <div className="button-group">
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="analyze-btn"
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </button>
              {text && (
                <button
                  onClick={handleClear}
                  className="clear-btn"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        }
        rightPanel={
          analysis ? (
            <div className="analysis-results">
              <div className="stats-section">
                <h2>Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{analysis.stats.charsWithSpaces}</div>
                    <div className="stat-label">Characters</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analysis.stats.totalWords}</div>
                    <div className="stat-label">Total Words</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analysis.stats.totalFilteredWords}</div>
                    <div className="stat-label">Meaningful Words</div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2>Top 20 Keywords</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Word</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.wordAnalysis.slice(0, 20).map((item, index) => (
                        <tr
                          key={item.word}
                          className={`keyword-row ${highlightMode === 'words' && selectedWord === item.word ? 'selected' : ''}`}
                          onClick={() => highlightMode === 'words' ? handleRowClick(item.word) : undefined}
                          style={{ cursor: highlightMode === 'words' ? 'pointer' : 'default' }}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {highlightMode === 'words' && renderColorSwatch(item.word)}
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

              <div className="section">
                <h2>Top 10 Keyword Combinations (2-word phrases)</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Phrase</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.twoWordCombinations.map((item, index) => (
                        <tr
                          key={item.phrase}
                          className={`keyword-row ${highlightMode === 'two-word' && selectedWord === item.phrase ? 'selected' : ''}`}
                          onClick={() => highlightMode === 'two-word' ? handleRowClick(item.phrase) : undefined}
                          style={{ cursor: highlightMode === 'two-word' ? 'pointer' : 'default' }}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {highlightMode === 'two-word' && renderColorSwatch(item.phrase)}
                              {item.phrase}
                            </div>
                          </td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="section">
                <h2>Top 10 Keyword Combinations (3-word phrases)</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Phrase</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.threeWordCombinations.map((item, index) => (
                        <tr
                          key={item.phrase}
                          className={`keyword-row ${highlightMode === 'three-word' && selectedWord === item.phrase ? 'selected' : ''}`}
                          onClick={() => highlightMode === 'three-word' ? handleRowClick(item.phrase) : undefined}
                          style={{ cursor: highlightMode === 'three-word' ? 'pointer' : 'default' }}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {highlightMode === 'three-word' && renderColorSwatch(item.phrase)}
                              {item.phrase}
                            </div>
                          </td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>Enter text on the left and click &ldquo;Analyze Text&rdquo; to see results</p>
            </div>
          )
        }
      />

      <footer className="app-footer">
        <p>
          SEO Keyword Analyzer © 2024 | Licensed under{' '}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.en.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            AGPL-3.0
          </a>
          {' '}or Commercial License
        </p>
        <p className="footer-notice">
          Open source for individuals and small businesses. Commercial license required for corporations ($1M+ revenue).{' '}
          <a href="https://github.com/dealwith/seo-analyzer" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </p>
      </footer>
    </div>
  );
}
