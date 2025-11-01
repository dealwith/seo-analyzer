'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnalysisResult } from '@/lib/analyzer';
import EditableHighlightedText from '@/components/EditableHighlightedText';
import ResizablePanels from '@/components/ResizablePanels';
import Logo from '@/components/Logo';
import { generateDistinctColors } from '@/lib/colors';
import { saveText, loadText, saveAnalysis, loadAnalysis, savePanelWidth, loadPanelWidth } from '@/lib/storage';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function Home() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const savedText = loadText();
    const savedAnalysis = loadAnalysis();
    const savedPanelWidth = loadPanelWidth();

    if (savedText) setText(savedText);
    if (savedAnalysis) setAnalysis(savedAnalysis);
    if (savedPanelWidth !== null) setPanelWidth(savedPanelWidth);
  }, []);

  useAutoSave(text, saveText, 3000, mounted);

  useEffect(() => {
    if (!mounted) return;
    saveAnalysis(analysis);
  }, [analysis, mounted]);

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
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
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
      setText('');
      setAnalysis(null);
      setSelectedWord(null);
    }
  };

  const handlePanelWidthChange = (width: number) => {
    setPanelWidth(width);
    if (mounted) {
      savePanelWidth(width);
    }
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
      </header>

      <ResizablePanels
        savedWidth={panelWidth}
        onWidthChange={handlePanelWidthChange}
        leftPanel={
          <div className="input-section">
            <label htmlFor="text-input">
              <strong>Enter Your Text:</strong>
            </label>
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
                          className={`keyword-row ${selectedWord === item.word ? 'selected' : ''}`}
                          onClick={() => handleRowClick(item.word)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span
                                className="color-indicator"
                                style={{
                                  backgroundColor: colorMap.get(item.word),
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  border: '1px solid #ddd',
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
                        <tr key={item.phrase}>
                          <td>{index + 1}</td>
                          <td>{item.phrase}</td>
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
                        <tr key={item.phrase}>
                          <td>{index + 1}</td>
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
              <p>Enter text on the left and click "Analyze Text" to see results</p>
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
          <a href="https://github.com/yourusername/seo-analyzer" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </p>
      </footer>
    </div>
  );
}
