import React from "react";

interface FormFieldsetProps {
  legend: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormFieldset({
  legend,
  children,
  className = "",
}: FormFieldsetProps) {
  return (
    <fieldset className={`border border-gray-500 p-4 rounded-md ${className}`}>
      <legend className="text-lg font-semibold text-gray-700 px-2">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}
