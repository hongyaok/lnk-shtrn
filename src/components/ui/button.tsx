import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  withArrow?: boolean;
  disableHoverPop?: boolean;
  arrowClassName?: string;
  asChild?: boolean;
}

export const ButtonArrow = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      data-slot="button-arrow"
      fill="none"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={`ui-button-arrow ${className || ''}`}
    >
      <path
        className="ui-button-arrow-line"
        d="M0 5h7"
      />
      <path
        className="ui-button-arrow-head"
        d="M1 1l4 4-4 4"
      />
    </svg>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      withArrow = false,
      disableHoverPop = false,
      arrowClassName,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClass = [
      'ui-button',
      `ui-button-${variant}`,
      `ui-button-size-${size}`,
      !disableHoverPop ? 'hover-pop' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        className: `${(children.props as any).className || ''} ${buttonClass}`.trim(),
        ...props,
      });
    }

    return (
      <button ref={ref} className={buttonClass} {...props}>
        {children}
        {withArrow && <ButtonArrow className={arrowClassName} />}
      </button>
    );
  }
);

Button.displayName = 'Button';
