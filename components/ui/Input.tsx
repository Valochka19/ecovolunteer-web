import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 backdrop-blur transition-colors focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${error ? "border-red-500/60" : ""} ${className}`}
          {...props}
        />
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
