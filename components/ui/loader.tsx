import { Loader2 } from "lucide-react";
import { useId } from "react";

interface LoaderProps {
  size?: number;
  className?: string;
}

export function Loader({
  size = 50,
  className,
}: LoaderProps) {
  const gradientId = useId();

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      <Loader2
        size={size}
        className={`animate-spin ${className ?? ""}`}
        style={{ stroke: `url(#${gradientId})` }}
      />
    </>
  );
}