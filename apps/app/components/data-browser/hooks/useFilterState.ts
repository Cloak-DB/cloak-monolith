'use client';

import { useState, useCallback } from 'react';
import type { Filter } from '@/lib/db-types';

export interface FilterState {
  // Popover state
  isPopoverOpen: boolean;
  // Chip focus state (for keyboard navigation)
  focusedChipIndex: number | null;
  // Edit modal state
  editingFilter: { filter: Filter; index: number } | null;
  // Help overlay state
  isHelpVisible: boolean;
}

export interface UseFilterStateReturn {
  state: FilterState;
  // Popover actions
  openPopover: () => void;
  closePopover: () => void;
  togglePopover: () => void;
  // Chip focus actions
  focusChip: (index: number) => void;
  unfocusChip: () => void;
  focusNextChip: (totalChips: number) => void;
  focusPrevChip: () => void;
  // Edit modal actions
  openEditModal: (filter: Filter, index: number) => void;
  closeEditModal: () => void;
  // Help overlay actions
  showHelp: () => void;
  hideHelp: () => void;
  toggleHelp: () => void;
}

export function useFilterState(): UseFilterStateReturn {
  const [state, setState] = useState<FilterState>({
    isPopoverOpen: false,
    focusedChipIndex: null,
    editingFilter: null,
    isHelpVisible: false,
  });

  // Popover actions
  const openPopover = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPopoverOpen: true,
      focusedChipIndex: null,
    }));
  }, []);

  const closePopover = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPopoverOpen: false,
    }));
  }, []);

  const togglePopover = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPopoverOpen: !prev.isPopoverOpen,
      focusedChipIndex: prev.isPopoverOpen ? prev.focusedChipIndex : null,
    }));
  }, []);

  // Chip focus actions
  const focusChip = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      focusedChipIndex: index,
      isPopoverOpen: false,
    }));
  }, []);

  const unfocusChip = useCallback(() => {
    setState((prev) => ({
      ...prev,
      focusedChipIndex: null,
    }));
  }, []);

  const focusNextChip = useCallback((totalChips: number) => {
    setState((prev) => {
      if (prev.focusedChipIndex === null) return prev;
      const nextIndex = prev.focusedChipIndex + 1;
      if (nextIndex >= totalChips) return prev;
      return {
        ...prev,
        focusedChipIndex: nextIndex,
      };
    });
  }, []);

  const focusPrevChip = useCallback(() => {
    setState((prev) => {
      if (prev.focusedChipIndex === null || prev.focusedChipIndex === 0) {
        return prev;
      }
      return {
        ...prev,
        focusedChipIndex: prev.focusedChipIndex - 1,
      };
    });
  }, []);

  // Edit modal actions
  const openEditModal = useCallback((filter: Filter, index: number) => {
    setState((prev) => ({
      ...prev,
      editingFilter: { filter, index },
      focusedChipIndex: null,
    }));
  }, []);

  const closeEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editingFilter: null,
    }));
  }, []);

  // Help overlay actions
  const showHelp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isHelpVisible: true,
    }));
  }, []);

  const hideHelp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isHelpVisible: false,
    }));
  }, []);

  const toggleHelp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isHelpVisible: !prev.isHelpVisible,
    }));
  }, []);

  return {
    state,
    openPopover,
    closePopover,
    togglePopover,
    focusChip,
    unfocusChip,
    focusNextChip,
    focusPrevChip,
    openEditModal,
    closeEditModal,
    showHelp,
    hideHelp,
    toggleHelp,
  };
}
