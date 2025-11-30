import React from 'react';

export interface RadioOption {
  id: string;
  label: string;
  value: string;
  renderExtra?: () => React.ReactNode;
  showExtraWhen?: (selectedValue: string) => boolean;
  isGroup?: boolean;
}

export interface RadioFieldProps {
  legend: string;
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RadioField({
  legend,
  name,
  options,
  selectedValue,
  onChange,
  className = "",
}: RadioFieldProps) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-black">{legend}</legend>
      <div className={`border rounded-lg p-3 mt-1 ${className}`}>
        {options.map((option) => (
          <div key={option.id} className="mb-2">
            {option.isGroup ? (
              <>
                <p className="font-medium text-gray-700">{option.label}</p>
                {option.renderExtra && (
                  <div className="mt-2 ml-6">
                    {option.renderExtra()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <input
                    onChange={(e) => onChange(e.target.value)}
                    type="radio"
                    id={option.id}
                    name={name}
                    value={option.value}
                    checked={selectedValue === option.value}
                  />
                  <label className="ml-2" htmlFor={option.id}>{option.label}</label>
                </div>
                {option.renderExtra && (
                  option.showExtraWhen ? option.showExtraWhen(selectedValue) : selectedValue === option.value
                ) && (
                  <div className="mt-2 ml-6">
                    {option.renderExtra()}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

