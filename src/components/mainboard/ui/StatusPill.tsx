import type { StatusLevel } from '../types';
import { statusClasses, statusColor, statusLabel } from '../utils';

export function StatusPill({ level }: { level: StatusLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClasses(
        level,
      )}`}
    >
      <span
        className="inline-block size-1.5 rounded-full"
        style={{ backgroundColor: statusColor(level) }}
      />
      {statusLabel(level)}
    </span>
  );
}

