import { useCallback, useState } from 'react';
import type { SortState } from '../utils/sort';

export function useSortState(): [SortState, (col: string) => void] {
  const [state, setState] = useState<SortState>({ col: null, dir: 1 });

  const onSort = useCallback((col: string) => {
    setState((prev) => ({
      col,
      dir: prev.col === col ? ((prev.dir * -1) as 1 | -1) : 1,
    }));
  }, []);

  return [state, onSort];
}
