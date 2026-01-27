'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ColumnInfo } from '@/lib/db-types';
import type { ValidationError } from '@/lib/validation';
import { CellEditor } from './CellEditor';

interface SelectionModifiers {
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

// Content length threshold for opening modal instead of inline editing
const EXPAND_THRESHOLD = 70;

function shouldExpandToModal(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  // For objects (JSON), stringify to check length
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).length > EXPAND_THRESHOLD;
    } catch {
      return false;
    }
  }

  // For strings and other primitives
  return String(value).length > EXPAND_THRESHOLD;
}

interface EditableCellProps {
  column: ColumnInfo;
  value: unknown;
  displayValue: React.ReactNode;
  isModified: boolean;
  isEditable: boolean;
  // Validation error (if any)
  validationError?: ValidationError;
  // Cell selection
  isSelected?: boolean;
  previewValue?: unknown;
  previewDisplayValue?: React.ReactNode;
  onCellSelect?: (modifiers: SelectionModifiers) => void;
  // Editing callbacks
  onValueChange: (newValue: unknown) => void;
  onLiveValueChange?: (newValue: unknown) => void;
  onExpand?: () => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export function EditableCell({
  column,
  value,
  displayValue,
  isModified,
  isEditable,
  validationError,
  isSelected,
  previewValue,
  previewDisplayValue,
  onCellSelect,
  onValueChange,
  onLiveValueChange,
  onExpand,
  onEditStart,
  onEditEnd,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<unknown>(value);

  // Sync editValue when value prop changes (e.g., when discarding changes)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Check for selection/copy modifiers first
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        onCellSelect?.({
          metaKey: e.metaKey || e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
        });
        return;
      }

      // Regular click - check if long content should open modal
      if (isEditable && !isEditing) {
        // Prevent default to avoid focus issues with the new input
        e.preventDefault();

        if (shouldExpandToModal(value) && onExpand) {
          // Open modal for long content (> 70 chars)
          onExpand();
        } else {
          // Inline edit for short content
          setEditValue(value);
          setIsEditing(true);
          // Defer parent notification to not block UI
          if (onEditStart) requestAnimationFrame(onEditStart);
        }
      }
    },
    [isEditable, isEditing, value, onEditStart, onCellSelect, onExpand],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isEditing && isEditable) {
        e.preventDefault();
        if (shouldExpandToModal(value) && onExpand) {
          // Open modal for long content (> 70 chars)
          onExpand();
        } else {
          // Inline edit for short content
          setEditValue(value);
          setIsEditing(true);
          // Defer parent notification to not block UI
          if (onEditStart) requestAnimationFrame(onEditStart);
        }
      }
    },
    [isEditable, isEditing, value, onEditStart, onExpand],
  );

  const handleCommit = useCallback(() => {
    setIsEditing(false);
    onEditEnd?.();
    if (editValue !== value) {
      onValueChange(editValue);
    }
  }, [editValue, value, onValueChange, onEditEnd]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
    onEditEnd?.();
  }, [value, onEditEnd]);

  const handleChange = useCallback(
    (newValue: unknown) => {
      setEditValue(newValue);
      // Notify parent for live preview in other selected cells
      onLiveValueChange?.(newValue);
    },
    [onLiveValueChange],
  );

  if (isEditing) {
    return (
      <div className="h-full max-w-[300px]">
        <CellEditor
          column={column}
          value={editValue}
          onChange={handleChange}
          onCommit={handleCommit}
          onCancel={handleCancel}
          onExpand={onExpand}
        />
      </div>
    );
  }

  // Determine what to display
  const hasPreview = previewValue !== undefined;
  const showValue = hasPreview ? previewDisplayValue : displayValue;
  const hasError = !!validationError;

  // Build class names
  const baseClasses =
    'px-3 py-2 h-full flex items-center text-gray-800 dark:text-slate-300 max-w-[300px] truncate relative';
  // All cells are interactive (for selection/copy), editable ones also show edit cursor
  const interactiveClasses = isEditable
    ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50'
    : 'cursor-default hover:bg-gray-50 dark:hover:bg-slate-800/50';
  // Error state takes precedence over modified state
  const stateClasses = hasError
    ? 'bg-red-100 dark:bg-red-900/20'
    : isModified
      ? 'bg-yellow-100 dark:bg-yellow-900/20'
      : '';
  const selectedClasses = isSelected
    ? hasError
      ? 'ring-2 ring-inset ring-red-500'
      : 'ring-2 ring-inset ring-yellow-500'
    : '';
  const previewClasses =
    hasPreview && !hasError ? 'bg-yellow-50 dark:bg-yellow-900/10' : '';

  // Tooltip for error or modified state
  const tooltipText = hasError
    ? validationError.message
    : isModified
      ? 'Modified'
      : undefined;

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${stateClasses} ${selectedClasses} ${previewClasses}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="gridcell"
      title={tooltipText}
    >
      <span className="truncate">{showValue}</span>
      {/* Show indicator dot: red for error, yellow for modified */}
      {(hasError || isModified) && !hasPreview && (
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            hasError ? 'bg-red-500' : 'bg-yellow-500'
          }`}
          title={tooltipText}
        />
      )}
    </div>
  );
}
