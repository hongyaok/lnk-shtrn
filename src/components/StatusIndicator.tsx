type StatusState = 'active' | 'down' | 'fixing' | 'idle';

interface StatusIndicatorProps {
  state: StatusState;
  label: string;
}

export default function StatusIndicator({ state, label }: StatusIndicatorProps) {
  return (
    <div className="status-indicator" data-state={state}>
      <span className="status-dot" />
      <span className="status-label">{label}</span>
    </div>
  );
}
