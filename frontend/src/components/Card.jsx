/**
 * Card Component
 * Reusable card container for content
 */

export default function Card({ children, className = "", onClick = null }) {
  const handleKeyDown = (event) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onClick(event);
  };

  return (
    <div
      className={`rounded-lg border border-[#E8DFD1] bg-white shadow-sm hover:shadow-md transition-shadow ${onClick ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03]" : ""} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`border-b border-[#E8DFD1] px-6 py-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`border-t border-[#E8DFD1] px-6 py-4 ${className}`}>{children}</div>;
}
