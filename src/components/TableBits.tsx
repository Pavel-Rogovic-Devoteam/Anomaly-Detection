import type { Provider, Severity } from '../types';
import { PROVIDER_COLORS, PROVIDER_LABELS, alertPillClass, detectedText } from '../utils/format';
import type { IQRBounds } from '../utils/iqr';

export function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      className={`save-btn${saved ? ' saved' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={saved ? 'Remove from saved' : 'Save for later review'}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

export function SeverityBadge({ sev }: { sev: Severity }) {
  return <span className={`sev-badge ${sev}`}>{sev}</span>;
}

export function AlertPill({ pct }: { pct: number }) {
  return <span className={`alert-pill ${alertPillClass(pct)}`}>{Math.round(pct)}%</span>;
}

export function ProviderLabel({ prov }: { prov: Provider }) {
  return (
    <span style={{ fontSize: '1rem', fontWeight: 600, color: PROVIDER_COLORS[prov] }}>
      {PROVIDER_LABELS[prov]}
    </span>
  );
}

export function DetectedCell({ ago }: { ago: number }) {
  return (
    <div className="detected-cell">
      <strong>{detectedText(ago)}</strong>
    </div>
  );
}

export function ServiceIcon({ variant }: { variant: 'budget' | 'pattern' }) {
  if (variant === 'budget') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function ServiceCell({ variant, svc, region }: { variant: 'budget' | 'pattern'; svc: string; region: string }) {
  return (
    <div className="svc-cell">
      <ServiceIcon variant={variant} />
      <div>
        <div className="svc-name">{svc}</div>
        <div className="svc-region">{region}</div>
      </div>
    </div>
  );
}

const SPARK_W = 110;
const SPARK_H = 32;

export function Sparkline({
  data,
  spikeIdx,
  color,
  bounds,
  isOutlier,
}: {
  data: number[];
  spikeIdx: number;
  color: string;
  bounds: IQRBounds;
  isOutlier: boolean;
}) {
  const max = Math.max(...data, bounds.upperBound);
  const minV = Math.min(...data) * 0.85;
  const range = max - minV || 1;
  const toY = (v: number) => SPARK_H - ((v - minV) / range) * (SPARK_H - 6) - 3;

  const points = data
    .map((v, i) => `${((i / 29) * SPARK_W).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(' ');

  const sx = (spikeIdx / 29) * SPARK_W;
  const sy = toY(data[spikeIdx]);
  const boundY = toY(bounds.upperBound);
  const pointColor = isOutlier ? color : 'var(--text-muted)';

  return (
    <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} style={{ overflow: 'visible', display: 'block' }}>
      <title>{`IQR upper bound: ${bounds.upperBound.toFixed(1)} (Q1 ${bounds.q1.toFixed(1)} · Q3 ${bounds.q3.toFixed(1)})`}</title>
      <line
        x1="0"
        y1={boundY.toFixed(1)}
        x2={SPARK_W}
        y2={boundY.toFixed(1)}
        stroke="var(--text-muted)"
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity="0.5"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" opacity={0.8} />
      <circle cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={3} fill={pointColor} stroke={pointColor} strokeOpacity={0.25} strokeWidth={4} />
    </svg>
  );
}

export function IqrBadge({ isOutlier, bounds }: { isOutlier: boolean; bounds: IQRBounds }) {
  const title = `Q1 ${bounds.q1.toFixed(1)} · Q3 ${bounds.q3.toFixed(1)} · IQR ${bounds.iqr.toFixed(1)} · Upper bound ${bounds.upperBound.toFixed(1)}`;
  return (
    <span className={`iqr-badge${isOutlier ? ' outlier' : ''}`} title={title}>
      {isOutlier ? 'IQR outlier' : 'within IQR'}
    </span>
  );
}
