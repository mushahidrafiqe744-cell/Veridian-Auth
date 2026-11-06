import * as React from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, isPassword, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[#111827] ml-0.5">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type={inputType}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-all duration-200 outline-hidden focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 group-hover:border-gray-300",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 group-hover:border-red-500",
              isPassword && "pr-11",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[12px] font-medium text-red-500 ml-0.5 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
