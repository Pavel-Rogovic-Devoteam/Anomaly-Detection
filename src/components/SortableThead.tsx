import type { Column, SortState } from '../utils/sort';

function SortIcon({ active, dir }: { active: boolean; dir: 1 | -1 }) {
  return <span className="sort-icon">{active ? (dir === 1 ? '↑' : '↓') : '↕'}</span>;
}

export function SortableThead<T>({
  columns,
  sortState,
  onSort,
}: {
  columns: Column<T>[];
  sortState: SortState;
  onSort: (key: string) => void;
}) {
  return (
    <thead>
      <tr>
        {columns.map((c, i) => {
          const isLast = i === columns.length - 1;
          const active = c.key !== null && sortState.col === c.key;
          const classes = [c.key ? 'sortable' : '', active ? 'sort-active' : ''].filter(Boolean).join(' ');
          return (
            <th
              key={c.key ?? `col-${i}`}
              className={classes || undefined}
              style={isLast ? { textAlign: 'right' } : undefined}
              onClick={c.key ? () => onSort(c.key as string) : undefined}
            >
              {c.label}
              {c.key && <SortIcon active={active} dir={sortState.dir} />}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
