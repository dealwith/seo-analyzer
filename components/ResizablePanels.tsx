import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  onWidthChange?: (width: number) => void;
  savedWidth?: number;
}

export default function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 60,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  onWidthChange,
  savedWidth,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(savedWidth || defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (savedWidth !== undefined) {
      setLeftWidth(savedWidth);
    }
  }, [savedWidth]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      let newLeftWidth = (mouseX / containerWidth) * 100;

      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));

      setLeftWidth(newLeftWidth);
      if (onWidthChange) {
        onWidthChange(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minLeftWidth, maxLeftWidth, onWidthChange]);

  return (
    <div
      ref={containerRef}
      className="resizable-container"
      style={{
        display: 'flex',
        flex: 1,
        gap: 0,
        position: 'relative',
      }}
    >
      <div
        className="left-panel"
        style={{
          flex: `0 0 ${leftWidth}%`,
          width: `${leftWidth}%`,
        }}
      >
        {leftPanel}
      </div>

      <div
        className="resizer"
        onMouseDown={handleMouseDown}
        style={{
          width: '8px',
          cursor: 'col-resize',
          background: isDragging ? '#3498db' : '#e0e0e0',
          transition: isDragging ? 'none' : 'background 0.2s',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '3px',
            height: '40px',
            background: isDragging ? 'white' : '#95a5a6',
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div
        className="right-panel"
        style={{
          flex: 1,
          width: `${100 - leftWidth}%`,
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
