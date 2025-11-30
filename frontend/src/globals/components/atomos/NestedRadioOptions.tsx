import React from 'react';

export interface NestedRadioOption {
  value: string;
  label: string;
}

export interface NestedRadioOptionsProps {
  title?: string;
  name: string;
  options: NestedRadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function NestedRadioOptions({
  title,
  name,
  options,
  selectedValue,
  onChange,
  className = "",
}: NestedRadioOptionsProps) {
  return (
    <div className={`flex flex-col gap-1 ml-4 mt-2 ${className}`}>
      {title && (
        <label className="text-sm font-medium text-gray-700">
          {title}
        </label>
      )}
      <div className="flex flex-col gap-1">
        {options.map((option, index) => (
          <label key={`${name}-${index}`} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

