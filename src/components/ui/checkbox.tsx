import * as React from 'react';
import { cn } from '@/lib/utils'; // ✅ Tailwind 병합 유틸리티

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={cn(
            'w-4 h-4 rounded-md border border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 transition-all',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
