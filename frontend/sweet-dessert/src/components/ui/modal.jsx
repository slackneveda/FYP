import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all ${className}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = "" }) => (
  <div className={`px-6 pt-6 pb-2 ${className}`}>
    {children}
  </div>
);

const ModalBody = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = "" }) => (
  <div className={`px-6 pb-6 pt-2 flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };