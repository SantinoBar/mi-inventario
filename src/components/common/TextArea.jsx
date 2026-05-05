import React from 'react';

const TextArea = ({ 
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  maxLength,
  showCount = false,
  className = '',
  ...props 
}) => {
  const textareaClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      {showCount && maxLength && (
        <p className="mt-1 text-sm text-gray-500 text-right">
          {value?.length || 0} / {maxLength}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default TextArea;