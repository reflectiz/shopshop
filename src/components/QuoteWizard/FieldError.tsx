import React from 'react';

/** Stable error element ids keep the flow assertable from automation. */
const FieldError: React.FC<{ name: string; message?: string }> = ({ name, message }) => {
  if (!message) {
    return null;
  }
  return (
    <p id={`quote-error-${name}`} className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
};

export default FieldError;
