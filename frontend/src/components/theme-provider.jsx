import React from 'react';

const ThemeProvider = ({ children }) => {
  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen bg-white text-gray-900">
      {children}
    </div>
  );
};

export { ThemeProvider }