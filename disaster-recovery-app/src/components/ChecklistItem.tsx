import React from 'react';

export interface ChecklistItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  id, 
  label, 
  checked, 
  onChange 
}) => {
  return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
      role="checkbox"
      aria-checked={checked}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => onChange(id)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={label}
      />
      <label
        htmlFor={id}
        className="text-gray-700 font-medium cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
};
