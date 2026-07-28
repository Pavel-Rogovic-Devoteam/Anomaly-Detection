export interface Column<T> {
  key: string | null;
  label: string;
  getValue?: (row: T) => string | number;
}

export interface SortState {
  col: string | null;
  dir: 1 | -1;
}

export function sortRows<T>(rows: T[], state: SortState, columns: Column<T>[]): T[] {
  if (!state.col) return rows;
  const col = columns.find((c) => c.key === state.col);
  if (!col?.getValue) return rows;
  const getValue = col.getValue;
  return [...rows].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (typeof va === 'string') return va.localeCompare(vb as string) * state.dir;
    return ((va as number) - (vb as number)) * state.dir;
  });
}
