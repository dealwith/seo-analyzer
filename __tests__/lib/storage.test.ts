import {
  saveText,
  loadText,
  saveAnalysis,
  loadAnalysis,
  savePanelWidth,
  loadPanelWidth,
  clearStorage
} from '@/lib/storage';
import { AnalysisResult } from '@/lib/analyzer';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('storage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('text storage', () => {
    it('should save and load text', () => {
      const testText = 'This is a test text';
      saveText(testText);
      expect(loadText()).toBe(testText);
    });

    it('should return empty string when no text is stored', () => {
      expect(loadText()).toBe('');
    });

    it('should overwrite existing text', () => {
      saveText('First text');
      saveText('Second text');
      expect(loadText()).toBe('Second text');
    });
  });

  describe('analysis storage', () => {
    const mockAnalysis: AnalysisResult = {
      wordAnalysis: [
        { word: 'test', count: 5, percentage: 50 },
        { word: 'analysis', count: 3, percentage: 30 },
      ],
      twoWordCombinations: [
        { phrase: 'test analysis', count: 2 },
      ],
      threeWordCombinations: [
        { phrase: 'test analysis tool', count: 1 },
      ],
      stats: {
        charsWithSpaces: 100,
        totalWords: 20,
        totalFilteredWords: 10,
      },
    };

    it('should save and load analysis', () => {
      saveAnalysis(mockAnalysis);
      const loaded = loadAnalysis();
      expect(loaded).toEqual(mockAnalysis);
    });

    it('should return null when no analysis is stored', () => {
      expect(loadAnalysis()).toBeNull();
    });

    it('should remove analysis when saving null', () => {
      saveAnalysis(mockAnalysis);
      saveAnalysis(null);
      expect(loadAnalysis()).toBeNull();
    });

    it('should handle corrupted JSON gracefully', () => {
      mockLocalStorage.setItem('seo-analyzer-analysis', 'invalid json');
      expect(loadAnalysis()).toBeNull();
    });
  });

  describe('panelWidth storage', () => {
    it('should save and load panel width', () => {
      savePanelWidth(500);
      expect(loadPanelWidth()).toBe(500);
    });

    it('should return null when no width is stored', () => {
      expect(loadPanelWidth()).toBeNull();
    });

    it('should handle decimal values', () => {
      savePanelWidth(500.5);
      expect(loadPanelWidth()).toBe(500.5);
    });

    it('should return null for invalid values', () => {
      mockLocalStorage.setItem('seo-analyzer-panel-width', 'invalid');
      expect(loadPanelWidth()).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('should clear all storage keys', () => {
      saveText('test');
      saveAnalysis({
        wordAnalysis: [],
        twoWordCombinations: [],
        threeWordCombinations: [],
        stats: { charsWithSpaces: 0, totalWords: 0, totalFilteredWords: 0 },
      });
      savePanelWidth(500);

      clearStorage();

      expect(loadText()).toBe('');
      expect(loadAnalysis()).toBeNull();
      expect(loadPanelWidth()).toBeNull();
    });
  });
});
