/**
 * Button Component
 * Reusable button with multiple variants
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyle = "font-inter font-medium rounded-lg transition-opacity focus:outline-none";

  const variantStyle = {
    primary: "bg-[#A8895C] text-white hover:opacity-90",
    secondary: "border border-[#A8895C] text-[#A8895C] hover:bg-[#A8895C]/5",
    danger: "bg-red-600 text-white hover:opacity-90",
  };

  const sizeStyle = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
