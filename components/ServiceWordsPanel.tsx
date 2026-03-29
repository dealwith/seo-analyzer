'use client';

import { useState, useRef, useEffect } from 'react';
import { DEFAULT_STOP_WORDS } from '@/lib/analyzer';
import { cn } from '@/lib/cn';

interface ServiceWordsPanelProps {
  filterEnabled: boolean;
  onFilterToggle: (enabled: boolean) => void;
  customStopWords: string[];
  onCustomStopWordsChange: (words: string[]) => void;
}

export default function ServiceWordsPanel({
  filterEnabled,
  onFilterToggle,
  customStopWords,
  onCustomStopWordsChange,
}: ServiceWordsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      setEditText(customStopWords.join(', '));
      modalRef.current.showModal();
    }
  }, [isModalOpen, customStopWords]);

  const handleSave = () => {
    const words = editText
      .split(/[,\n]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
    const unique = [...new Set(words)];
    onCustomStopWordsChange(unique);
    setIsModalOpen(false);
    modalRef.current?.close();
  };

  const handleReset = () => {
    const defaults = [...DEFAULT_STOP_WORDS];
    setEditText(defaults.join(', '));
    onCustomStopWordsChange(defaults);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    modalRef.current?.close();
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-1 tw-py-1">
      <div className="tw-flex tw-items-center tw-gap-2">
        <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-select-none">
          <input
            type="checkbox"
            className={cn('dui-toggle', 'dui-toggle-sm', 'dui-toggle-primary')}
            checked={filterEnabled}
            onChange={(e) => onFilterToggle(e.target.checked)}
          />
          <span className="tw-text-sm tw-font-medium tw-text-base-content">Filter service words</span>
        </label>

        <div className="dui-tooltip dui-tooltip-left" data-tip="Service words (stop words) like 'the', 'is', 'at' are common words filtered out during analysis. Click the edit button to customize the list.">
          <button
            className="dui-btn dui-btn-ghost dui-btn-xs dui-btn-circle tw-text-base-content/50"
            aria-label="Information about service words"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>

        {filterEnabled && (
          <button
            className="dui-btn dui-btn-outline dui-btn-primary dui-btn-xs tw-gap-1"
            onClick={() => setIsModalOpen(true)}
            title="Edit service words list"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit list
          </button>
        )}
      </div>

      {filterEnabled && (
        <div className="tw-text-xs tw-text-base-content/50 tw-pl-11">
          {customStopWords.length} words in filter list
        </div>
      )}

      <dialog ref={modalRef} className={cn('dui-modal')} onClose={handleClose}>
        <div className="dui-modal-box tw-max-w-lg">
          <h3 className="tw-text-xl tw-font-semibold tw-text-base-content tw-mb-1">Edit Service Words</h3>
          <p className="tw-text-sm tw-text-base-content/60 tw-mb-4">
            Add or remove words separated by commas or new lines. These words will be excluded from the analysis.
          </p>
          <textarea
            className="dui-textarea dui-textarea-bordered tw-w-full tw-text-sm tw-leading-relaxed"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={10}
            placeholder="Enter words separated by commas or new lines..."
          />
          <div className="tw-flex tw-items-center tw-justify-between tw-mt-4 tw-gap-2">
            <button
              className="dui-btn dui-btn-outline dui-btn-error dui-btn-sm"
              onClick={handleReset}
            >
              Reset to defaults
            </button>
            <div className="tw-flex tw-gap-2">
              <button
                className="dui-btn dui-btn-ghost dui-btn-sm"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="dui-btn dui-btn-primary dui-btn-sm"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="dui-modal-backdrop">
          <button onClick={handleClose}>close</button>
        </form>
      </dialog>
    </div>
  );
}
