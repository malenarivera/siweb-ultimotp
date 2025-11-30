"use client";

import React from "react";

interface Props {
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function MarkedErrorButton({
  children = 'Marcar como Erróneo',
  className = '',
  ariaLabel,
}: Props) {
  const classes = `inline-flex items-center gap-2 bg-gray-400 text-black px-4 py-2 rounded-md cursor-not-allowed ${className}`.trim();

  return (
    <button
      className={classes}
      disabled
      aria-disabled="true"
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
