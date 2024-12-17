import React from "react";
import clsx from "clsx"; // Ensure clsx is installed (npm install clsx)

// Button props definition
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  className,
  ...props
}) => {
  const baseStyles =
    "rounded font-medium focus:outline-none transition-all disabled:opacity-50";
  const variantStyles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-black hover:bg-gray-300";
  const sizeStyles =
    size === "small"
      ? "px-2 py-1 text-sm"
      : size === "large"
      ? "px-6 py-3 text-lg"
      : "px-4 py-2 text-md";

  return (
    <button
      className={clsx(baseStyles, variantStyles, sizeStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
};
