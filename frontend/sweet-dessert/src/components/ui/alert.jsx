import React from "react";

const Alert = ({ className = "", variant = "default", children, ...props }) => {
  const baseClasses = "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start space-x-3";
  const variantClasses = {
    default: "bg-gray-50 border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-900"
  };

  return (
    <div
      role="alert"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ className = "", children, ...props }) => (
  <h5
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
);

const AlertDescription = ({ className = "", children, ...props }) => (
  <div
    className={`text-sm leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
);

export { Alert, AlertTitle, AlertDescription };