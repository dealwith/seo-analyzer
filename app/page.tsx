'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/analyzer';

export default function Home() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
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

  return (
    <div className="container">
      <header>
        <h1>SEO Keyword Analyzer</h1>
        <p>Analyze your text to identify keyword density and combinations</p>
      </header>

      <div className="content">
        <div className="left-panel">
          <div className="input-section">
            <label htmlFor="text-input">
              <strong>Enter Your Text:</strong>
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here for SEO analysis..."
              rows={20}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="analyze-btn"
            >
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </div>
        </div>

        <div className="right-panel">
          {analysis ? (
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
                        <tr key={item.word}>
                          <td>{index + 1}</td>
                          <td>{item.word}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
