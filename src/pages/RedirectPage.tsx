import React from 'react';
import { API_URL } from '../config';

const RedirectPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-2xl w-full text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logo image (API URL)</h2>
        <div className="bg-red-500 w-48 h-48 flex items-center justify-center mx-auto mt-4">
          <img
            src={`${API_URL}/redirect/pokemon/image`}
            alt="Pokemon"
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
