"use client";

import { ChevronDown } from "lucide-react";

interface Props {
  isCompact: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  /** variant controls color scheme for the button; 'default' uses green, 'error' uses red */
  variant?: 'default' | 'error';
}

export default function ToggleCompactButton({ isCompact, onToggle, ariaLabel, variant = 'default' }: Props) {
  const base = "p-2 rounded-md inline-flex items-center justify-center h-10 w-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";

  const variantClasses = variant === 'error'
    ? "bg-[var(--color-error)] text-black focus:ring-[var(--color-error-dark)] hover:bg-[var(--color-error-dark)]"
    : "bg-[var(--color-manzana)] text-black focus:ring-[var(--color-accent)] hover:bg-[var(--color-primary)] hover:text-white";

  return (
    <button
      aria-expanded={isCompact}
      onClick={onToggle}
      className={`${base} ${variantClasses}`}
      aria-label={ariaLabel}
    >
      <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isCompact ? 'rotate-0' : 'rotate-180'}`} />
    </button>
  );
}
