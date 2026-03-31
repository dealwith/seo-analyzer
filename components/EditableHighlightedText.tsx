import { useState, useRef, useEffect, useCallback } from 'react';
import { WordAnalysis } from '@/lib/analyzer';

interface EditableHighlightedTextProps {
  text: string;
  topWords: WordAnalysis[];
  colorMap: Map<string, string>;
  colorful: boolean;
  selectedWord: string | null;
  highlightMode: 'words' | 'phrases';
  onWordClick: (word: string) => void;
  onTextChange: (text: string) => void;
}

export default function EditableHighlightedText({
  text,
  topWords,
  colorMap,
  colorful,
  selectedWord,
  highlightMode,
  onWordClick,
  onTextChange,
}: EditableHighlightedTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);

  const escapeHtml = useCallback((unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  const wrapMark = useCallback((original: string, key: string, bg: string, selected: boolean): string => {
    const cls = `highlight${selected ? ' selected' : ''}${!colorful ? ' highlight-outline' : ''}`;
    const style = colorful
      ? `background-color: ${bg}; cursor: pointer;`
      : `background-color: transparent; border: 1.5px solid ${bg}; cursor: pointer;`;
    return `<mark class="${cls}" style="${style}" data-word="${escapeHtml(key)}" title="Click to highlight all '${escapeHtml(key)}'">${escapeHtml(original)}</mark>`;
  }, [escapeHtml, colorful]);

  const renderWordHighlightedHTML = useCallback((): string => {
    const regexCopy = /\b[a-z]+\b/gi;
    const parts: string[] = [];
    let lastIndex = 0;
    let match;

    const wordSet = new Set(topWords.map(w => w.word));

    while ((match = regexCopy.exec(text)) !== null) {
      const word = match[0].toLowerCase();
      const matchStart = match.index;
      const matchEnd = regexCopy.lastIndex;

      if (matchStart > lastIndex) {
        parts.push(escapeHtml(text.substring(lastIndex, matchStart)));
      }

      if (wordSet.has(word)) {
        const bg = colorMap.get(word) || 'transparent';
        parts.push(wrapMark(text.substring(matchStart, matchEnd), word, bg, selectedWord === word));
      } else {
        parts.push(escapeHtml(text.substring(matchStart, matchEnd)));
      }

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      parts.push(escapeHtml(text.substring(lastIndex)));
    }

    return parts.join('');
  }, [text, topWords, colorMap, selectedWord, escapeHtml, wrapMark]);

  const renderPhraseHighlightedHTML = useCallback((): string => {
    if (topWords.length === 0) return escapeHtml(text);

    const lowerText = text.toLowerCase();
    const occurrences: Array<{ start: number; end: number; phrase: string }> = [];

    for (const item of topWords) {
      const lowerPhrase = item.word.toLowerCase();
      let searchStart = 0;
      while (searchStart <= lowerText.length - lowerPhrase.length) {
        const pos = lowerText.indexOf(lowerPhrase, searchStart);
        if (pos === -1) break;

        const beforeOk = pos === 0 || !/[a-z]/i.test(text[pos - 1]);
        const afterEnd = pos + lowerPhrase.length;
        const afterOk = afterEnd >= text.length || !/[a-z]/i.test(text[afterEnd]);

        if (beforeOk && afterOk) {
          occurrences.push({ start: pos, end: afterEnd, phrase: lowerPhrase });
        }
        searchStart = pos + 1;
      }
    }

    occurrences.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    const filtered: typeof occurrences = [];
    let lastEnd = 0;
    for (const occ of occurrences) {
      if (occ.start >= lastEnd) {
        filtered.push(occ);
        lastEnd = occ.end;
      }
    }

    const parts: string[] = [];
    let cursor = 0;
    for (const occ of filtered) {
      if (occ.start > cursor) {
        parts.push(escapeHtml(text.substring(cursor, occ.start)));
      }
      const bg = colorMap.get(occ.phrase) || 'transparent';
      parts.push(wrapMark(text.substring(occ.start, occ.end), occ.phrase, bg, selectedWord === occ.phrase));
      cursor = occ.end;
    }
    if (cursor < text.length) {
      parts.push(escapeHtml(text.substring(cursor)));
    }

    return parts.join('');
  }, [text, topWords, colorMap, selectedWord, escapeHtml, wrapMark]);

  const renderHighlightedHTML = useCallback((): string => {
    if (topWords.length === 0) return escapeHtml(text);
    return highlightMode === 'phrases' ? renderPhraseHighlightedHTML() : renderWordHighlightedHTML();
  }, [highlightMode, topWords, text, escapeHtml, renderWordHighlightedHTML, renderPhraseHighlightedHTML]);

  useEffect(() => {
    if (editableRef.current && !isEditing) {
      editableRef.current.innerHTML = renderHighlightedHTML();
    }
  }, [text, topWords, colorMap, selectedWord, isEditing, renderHighlightedHTML]);

  const handleInput = () => {
    if (editableRef.current) {
      const newText = editableRef.current.innerText;
      onTextChange(newText);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK') {
      const word = target.getAttribute('data-word');
      if (word) {
        onWordClick(word);
        e.preventDefault();
      }
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      e.clipboardData.setData('text/plain', selection.toString());
    }
  };

  return (
    <div
      ref={editableRef}
      className="editable-highlighted-text"
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onCopy={handleCopy}
      style={{
        minHeight: '400px',
      }}
    />
  );
}
