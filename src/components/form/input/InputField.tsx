import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs 
          placeholder:text-gray-400 focus:outline-none focus:ring-3
          disabled:cursor-not-allowed disabled:opacity-60
          dark:bg-gray-900 dark:text-white/90 dark:border-gray-700
          ${className}`}
        />

        {error && <p className="text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
