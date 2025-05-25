import React, { forwardRef } from 'react';
import { Button as AntButton, ButtonProps } from 'antd';

export interface CustomButtonProps extends ButtonProps {
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(({ className, ...props }, ref) => {
  const defaultClass = 'flex items-center justify-center';
  return <AntButton ref={ref} className={`${className || ''} ${defaultClass}`} {...props} />;
});

Button.displayName = 'Button';

export default Button;
