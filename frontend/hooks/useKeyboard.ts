import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
}

export function useKeyboard(bindings: KeyBinding[], deps: React.DependencyList = []): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const binding of bindings) {
        const keyMatch = e.key === binding.key || e.key.toLowerCase() === binding.key.toLowerCase();
        const ctrlMatch = binding.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = binding.shift ? e.shiftKey : true;
        const altMatch = binding.alt ? e.altKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          binding.handler(e);
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
