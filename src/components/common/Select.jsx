import React from 'react';

const Select = ({ 
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helperText,
  placeholder,
  className = '',
  ...props 
}) => {
  const selectClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
    error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-primary-500'
  } ${
    disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'bg-white'
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;