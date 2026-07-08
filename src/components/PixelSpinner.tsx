interface PixelSpinnerProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function PixelSpinner({ size = 24, color = 'currentColor', style, className = '' }: PixelSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', ...style }}
      className={`pixel-spinner ${className}`}
    >
      {/* Symmetric 8-dot pixelated ring */}
      <rect x="7" y="1" width="2" height="2" opacity="1.00" />
      <rect x="11" y="3" width="2" height="2" opacity="0.85" />
      <rect x="13" y="7" width="2" height="2" opacity="0.70" />
      <rect x="11" y="11" width="2" height="2" opacity="0.55" />
      <rect x="7" y="13" width="2" height="2" opacity="0.40" />
      <rect x="3" y="11" width="2" height="2" opacity="0.25" />
      <rect x="1" y="7" width="2" height="2" opacity="0.15" />
      <rect x="3" y="3" width="2" height="2" opacity="0.05" />
    </svg>
  );
}
