/**
 * SEO Keyword Analyzer
 * Copyright (C) 2024 SEO Analyzer Team
 *
 * Licensed under AGPL-3.0-or-Commercial
 * See LICENSE file for details
 */

import { useEffect, useRef } from 'react';

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 3000,
  enabled: boolean = true
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay, enabled]);
}
