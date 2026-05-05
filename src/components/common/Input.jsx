import React from 'react';

const Input = ({ 
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  className = '',
  ...props 
}) => {
  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
    error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-primary-500'
  } ${
    disabled || readOnly ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'bg-white'
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;