import { analyzeText } from '@/lib/analyzer';

describe('analyzeText', () => {
  it('should analyze simple text correctly', () => {
    const text = 'The quick brown fox jumps over the lazy dog. The fox is quick.';
    const result = analyzeText(text);

    expect(result.stats.charsWithSpaces).toBe(text.length);
    expect(result.stats.totalWords).toBeGreaterThan(0);
    expect(result.stats.totalFilteredWords).toBeGreaterThan(0);
  });

  it('should filter stop words correctly', () => {
    const text = 'the and but testing analysis';
    const result = analyzeText(text);

    const words = result.wordAnalysis.map(w => w.word);
    expect(words).toContain('testing');
    expect(words).toContain('analysis');
    expect(words).not.toContain('the');
    expect(words).not.toContain('and');
    expect(words).not.toContain('but');
  });

  it('should filter words with length <= 2', () => {
    const text = 'is it ab testing analysis';
    const result = analyzeText(text);

    const words = result.wordAnalysis.map(w => w.word);
    expect(words).toContain('testing');
    expect(words).toContain('analysis');
    expect(words).not.toContain('is');
    expect(words).not.toContain('it');
    expect(words).not.toContain('ab');
  });

  it('should count word frequencies correctly', () => {
    const text = 'testing testing analysis testing';
    const result = analyzeText(text);

    const testingWord = result.wordAnalysis.find(w => w.word === 'testing');
    const analysisWord = result.wordAnalysis.find(w => w.word === 'analysis');

    expect(testingWord).toBeDefined();
    expect(testingWord?.count).toBe(3);
    expect(analysisWord).toBeDefined();
    expect(analysisWord?.count).toBe(1);
  });

  it('should calculate percentages correctly', () => {
    const text = 'testing testing analysis testing';
    const result = analyzeText(text);

    const testingWord = result.wordAnalysis.find(w => w.word === 'testing');
    const analysisWord = result.wordAnalysis.find(w => w.word === 'analysis');

    expect(testingWord?.percentage).toBe(75);
    expect(analysisWord?.percentage).toBe(25);
  });

  it('should sort words by count descending', () => {
    const text = 'apple banana apple cherry apple banana';
    const result = analyzeText(text);

    expect(result.wordAnalysis[0].word).toBe('apple');
    expect(result.wordAnalysis[0].count).toBe(3);
    expect(result.wordAnalysis[1].word).toBe('banana');
    expect(result.wordAnalysis[1].count).toBe(2);
    expect(result.wordAnalysis[2].word).toBe('cherry');
    expect(result.wordAnalysis[2].count).toBe(1);
  });

  it('should handle empty text', () => {
    const text = '';
    const result = analyzeText(text);

    expect(result.stats.charsWithSpaces).toBe(0);
    expect(result.stats.totalWords).toBe(0);
    expect(result.stats.totalFilteredWords).toBe(0);
    expect(result.wordAnalysis).toEqual([]);
  });

  it('should handle text with only stop words', () => {
    const text = 'the and but or if';
    const result = analyzeText(text);

    expect(result.wordAnalysis).toEqual([]);
    expect(result.stats.totalFilteredWords).toBe(0);
  });

  it('should generate 2-word combinations correctly', () => {
    const text = 'seo keyword analysis seo keyword';
    const result = analyzeText(text);

    expect(result.twoWordCombinations.length).toBeGreaterThan(0);
    const seoKeyword = result.twoWordCombinations.find(c => c.phrase === 'seo keyword');
    expect(seoKeyword).toBeDefined();
    expect(seoKeyword?.count).toBe(2);
  });

  it('should generate 3-word combinations correctly', () => {
    const text = 'seo keyword analysis tool seo keyword analysis';
    const result = analyzeText(text);

    expect(result.threeWordCombinations.length).toBeGreaterThan(0);
    const phrase = result.threeWordCombinations.find(c => c.phrase === 'seo keyword analysis');
    expect(phrase).toBeDefined();
    expect(phrase?.count).toBe(2);
  });

  it('should limit combinations to top 10', () => {
    const words = Array(15).fill(null).map((_, i) => `word${i}`).join(' ');
    const text = words + ' ' + words;
    const result = analyzeText(text);

    expect(result.twoWordCombinations.length).toBeLessThanOrEqual(10);
    expect(result.threeWordCombinations.length).toBeLessThanOrEqual(10);
  });

  it('should handle case insensitivity', () => {
    const text = 'Testing TESTING testing';
    const result = analyzeText(text);

    expect(result.wordAnalysis.length).toBe(1);
    expect(result.wordAnalysis[0].word).toBe('testing');
    expect(result.wordAnalysis[0].count).toBe(3);
  });

  it('should handle special characters and punctuation', () => {
    const text = 'testing, analysis! testing? analysis.';
    const result = analyzeText(text);

    const testingWord = result.wordAnalysis.find(w => w.word === 'testing');
    const analysisWord = result.wordAnalysis.find(w => w.word === 'analysis');

    expect(testingWord?.count).toBe(2);
    expect(analysisWord?.count).toBe(2);
  });

  it('should ignore numbers', () => {
    const text = 'testing 123 456 analysis 789';
    const result = analyzeText(text);

    const words = result.wordAnalysis.map(w => w.word);
    expect(words).toContain('testing');
    expect(words).toContain('analysis');
    expect(words).not.toContain('123');
    expect(words).not.toContain('456');
  });
});
