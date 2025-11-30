"use client";

import React from "react";
// using an inline SVG for a circle-with-diagonal to avoid relying on a specific lucide export

interface Props {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function MarkAsErroneousButton({
  onClick,
  children = 'Marcar como Erróneo',
  className = '',
  disabled = false,
  ariaLabel,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-rose-300 text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-200 hover:bg-rose-400 transition-colors duration-150 ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    </button>
  );
}
