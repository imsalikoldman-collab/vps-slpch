import type { ReactNode } from "react";

interface RedactedProps {
  children: ReactNode;
}

export default function Redacted({ children }: RedactedProps) {
  return <span className="redacted">{children}</span>;
}
