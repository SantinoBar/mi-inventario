import React from 'react';

const Card = ({ 
  children,
  title,
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  noPadding = false,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className={`p-6 border-b border-gray-200 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`${noPadding ? '' : 'p-6'} ${bodyClassName}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;