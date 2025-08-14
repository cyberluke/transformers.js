import { useEffect, useCallback } from 'react';

export interface KeyBinding {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  disabled?: boolean;
}

interface UseKeyBindingsOptions {
  bindings: KeyBinding[];
  target?: HTMLElement | Document | null;
  deps?: React.DependencyList;
}

export function useKeyBindings({ 
  bindings, 
  target, 
  deps = [] 
}: UseKeyBindingsOptions) {
  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    const activeBinding = bindings.find(binding => {
      if (binding.disabled) return false;
      
      const keyMatches = binding.key.toLowerCase() === keyboardEvent.key.toLowerCase();
      const ctrlMatches = (binding.ctrlKey || false) === keyboardEvent.ctrlKey;
      const shiftMatches = (binding.shiftKey || false) === keyboardEvent.shiftKey;
      const altMatches = (binding.altKey || false) === keyboardEvent.altKey;
      const metaMatches = (binding.metaKey || false) === keyboardEvent.metaKey;
      
      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
    });

    if (activeBinding) {
      if (activeBinding.preventDefault !== false) {
        keyboardEvent.preventDefault();
      }
      if (activeBinding.stopPropagation) {
        keyboardEvent.stopPropagation();
      }
      activeBinding.action();
    }
  }, [bindings]);

  useEffect(() => {
    // SSR safety - pouze v browseru
    if (typeof window === 'undefined') return;
    
    // Pokud není target specifikován, použij document
    const eventTarget = target || document;
    if (!eventTarget) return;

    eventTarget.addEventListener('keydown', handleKeyDown);
    
    return () => {
      eventTarget.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleKeyDown, ...deps]);
}

// Pomocné funkce pro časté kombinace
export const createKeyBinding = (
  key: string, 
  action: () => void, 
  modifiers: Partial<Pick<KeyBinding, 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'>> = {},
  options: Partial<Pick<KeyBinding, 'preventDefault' | 'stopPropagation' | 'disabled'>> = {}
): KeyBinding => ({
  key,
  action,
  ...modifiers,
  ...options
});

// Přednastavené zkratky
export const commonKeyBindings = {
  save: (action: () => void) => createKeyBinding('s', action, { ctrlKey: true }),
  copy: (action: () => void) => createKeyBinding('c', action, { ctrlKey: true }),
  paste: (action: () => void) => createKeyBinding('v', action, { ctrlKey: true }),
  undo: (action: () => void) => createKeyBinding('z', action, { ctrlKey: true }),
  redo: (action: () => void) => createKeyBinding('z', action, { ctrlKey: true, shiftKey: true }),
  enter: (action: () => void) => createKeyBinding('Enter', action),
  escape: (action: () => void) => createKeyBinding('Escape', action),
  submitWithEnter: (action: () => void) => createKeyBinding('Enter', action, {}, { preventDefault: true }),
  newLineWithShiftEnter: (action: () => void) => createKeyBinding('Enter', action, { shiftKey: true }, { preventDefault: false }),
}; 