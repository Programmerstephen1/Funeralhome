/**
 * Button Component
 * Reusable button with multiple variants
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const baseStyle = "font-inter font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03] active:scale-[0.98] disabled:cursor-not-allowed";

  const variantStyle = {
    primary: "bg-[#7C4A03] text-white hover:bg-[#633B02] shadow-sm hover:shadow-md",
    secondary: "border border-[#7C4A03] text-[#7C4A03] hover:bg-[#7C4A03]/5 hover:shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
  };

  const sizeStyle = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledStyle = disabled || loading ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyle} ${variantStyle[variant] || variantStyle.primary} ${sizeStyle[size] || sizeStyle.md} ${disabledStyle} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span aria-hidden="true" className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.2em]" />}
      {children}
    </button>
  );
}
