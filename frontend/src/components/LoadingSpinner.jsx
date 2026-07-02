/**
 * Loading Spinner Component
 * Animated loading indicator
 */

export default function LoadingSpinner({ size = "md", message = "Loading..." }) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeMap[size]} border-4 border-[#E8DFD1] border-t-[#A8895C] rounded-full animate-spin`} />
      {message && <p className="text-[#7A7A7A] font-inter">{message}</p>}
    </div>
  );
}
