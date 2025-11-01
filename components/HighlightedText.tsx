import { WordAnalysis } from '@/lib/analyzer';

interface HighlightedTextProps {
  text: string;
  topWords: WordAnalysis[];
  colorMap: Map<string, string>;
  selectedWord: string | null;
  onWordClick: (word: string) => void;
}

export default function HighlightedText({
  text,
  topWords,
  colorMap,
  selectedWord,
  onWordClick,
}: HighlightedTextProps) {
  const topWordSet = new Set(topWords.map(w => w.word));

  const renderHighlightedText = () => {
    const regex = /\b[a-z]+\b/gi;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const word = match[0].toLowerCase();
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;

      if (matchStart > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, matchStart)}
          </span>
        );
      }

      if (topWordSet.has(word)) {
        const backgroundColor = colorMap.get(word) || 'transparent';
        const isSelected = selectedWord === word;

        parts.push(
          <mark
            key={`word-${matchStart}-${word}`}
            className={`highlight ${isSelected ? 'selected' : ''}`}
            style={{
              backgroundColor,
              cursor: 'pointer',
            }}
            onClick={() => onWordClick(word)}
            title={`Click to highlight all "${word}"`}
          >
            {text.substring(matchStart, matchEnd)}
          </mark>
        );
      } else {
        parts.push(
          <span key={`word-${matchStart}`}>
            {text.substring(matchStart, matchEnd)}
          </span>
        );
      }

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="highlighted-text-container">
      {renderHighlightedText()}
    </div>
  );
}
