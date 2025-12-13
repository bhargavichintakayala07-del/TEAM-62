import React from 'react';

export const LoadingDots = () => {
  return (
    <div className="flex space-x-1 items-center p-2">
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};