import type { ReactNode } from 'react';

export interface InputGroupProps {
  children: ReactNode;
  label?: string;
  hint?: string;
  isRequired?: boolean;
  leadingAddon?: ReactNode;
  trailingAddon?: ReactNode;
}

export const InputGroup = ({
  children,
  label,
  hint,
  isRequired,
  leadingAddon,
  trailingAddon,
}: InputGroupProps) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {isRequired && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {leadingAddon}
        {children}
        {trailingAddon}
      </div>
      {hint && <p className="input-hint">{hint}</p>}
    </div>
  );
};

const Prefix = ({ children }: { children: ReactNode }) => {
  return <div className="input-prefix">{children}</div>;
};

const Suffix = ({ children }: { children: ReactNode }) => {
  return <div className="input-suffix">{children}</div>;
};

InputGroup.Prefix = Prefix;
InputGroup.Suffix = Suffix;
