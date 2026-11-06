import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "google";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm",
      secondary: "bg-white text-[#111827] hover:bg-gray-50 border border-gray-200",
      outline: "bg-transparent border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A]/5",
      ghost: "hover:bg-gray-100 text-gray-600",
      google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2",
    };

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        ref={ref}
        className={cn(
          "relative h-11 px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center",
          variants[variant],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
