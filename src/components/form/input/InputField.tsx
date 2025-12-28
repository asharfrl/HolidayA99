import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${className}`}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
