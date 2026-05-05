import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  zIndex = 'z-50',
}) => {
  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${zIndex} p-4`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg w-full ${sizes[size]} p-6 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && (
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;