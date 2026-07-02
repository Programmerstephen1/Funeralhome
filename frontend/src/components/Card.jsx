/**
 * Card Component
 * Reusable card container for content
 */

export default function Card({ children, className = "", onClick = null }) {
  return (
    <div
      className={`rounded-lg border border-[#E8DFD1] bg-white shadow-sm hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
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
