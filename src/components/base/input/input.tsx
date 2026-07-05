import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputBaseProps extends InputHTMLAttributes<HTMLInputElement> {
  tooltip?: string;
}

export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  ({ className, tooltip, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`input-base ${className || ''}`}
        title={tooltip}
        {...props}
      />
    );
  }
);

InputBase.displayName = 'InputBase';
