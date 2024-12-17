import React from "react";
import clsx from "clsx"; // Install clsx if you haven't: npm install clsx

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
