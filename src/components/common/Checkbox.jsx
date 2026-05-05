import React from 'react';

const Checkbox = ({ 
  id,
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {label && (
          <label 
            htmlFor={id} 
            className={`text-sm font-medium text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;