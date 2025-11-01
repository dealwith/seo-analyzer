import { useState, useRef, useEffect } from 'react';
import { WordAnalysis } from '@/lib/analyzer';

interface EditableHighlightedTextProps {
  text: string;
  topWords: WordAnalysis[];
  colorMap: Map<string, string>;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
  onTextChange: (text: string) => void;
}

export default function EditableHighlightedText({
  text,
  topWords,
  colorMap,
  selectedWord,
  onWordClick,
  onTextChange,
}: EditableHighlightedTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const topWordSet = new Set(topWords.map(w => w.word));

  useEffect(() => {
    if (editableRef.current && !isEditing) {
      editableRef.current.innerHTML = renderHighlightedHTML();
    }
  }, [text, topWords, colorMap, selectedWord]);

  const renderHighlightedHTML = (): string => {
    const regex = /\b[a-z]+\b/gi;
    const parts: string[] = [];
    let lastIndex = 0;
    let match;

    const textCopy = text;
    const regexCopy = new RegExp(regex.source, regex.flags);

    while ((match = regexCopy.exec(textCopy)) !== null) {
      const word = match[0].toLowerCase();
      const matchStart = match.index;
      const matchEnd = regexCopy.lastIndex;

      if (matchStart > lastIndex) {
        parts.push(escapeHtml(textCopy.substring(lastIndex, matchStart)));
      }

      if (topWordSet.has(word)) {
        const backgroundColor = colorMap.get(word) || 'transparent';
        const isSelected = selectedWord === word;
        const className = `highlight ${isSelected ? 'selected' : ''}`;

        parts.push(
          `<mark class="${className}" style="background-color: ${backgroundColor}; cursor: pointer;" data-word="${word}" title="Click to highlight all '${word}'">${escapeHtml(textCopy.substring(matchStart, matchEnd))}</mark>`
        );
      } else {
        parts.push(escapeHtml(textCopy.substring(matchStart, matchEnd)));
      }

      lastIndex = matchEnd;
    }

    if (lastIndex < textCopy.length) {
      parts.push(escapeHtml(textCopy.substring(lastIndex)));
    }

    return parts.join('');
  };

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

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
      style={{
        minHeight: '400px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        outline: 'none',
        backgroundColor: '#fff',
      }}
    />
  );
}
