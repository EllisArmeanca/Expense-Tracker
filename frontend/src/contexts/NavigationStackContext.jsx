import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationStackContext = createContext();

export const NavigationStackProvider = ({ children }) => {
  const [navigationStack, setNavigationStack] = useState([]);

  const addToStack = (pageInfo, isDemo = false) => {
    setNavigationStack(prev => {
      // For demo items, just add them without duplicate checking
      if (isDemo) {
        const newStack = [...prev, { ...pageInfo, isDemo: true }];
        if (newStack.length > 5) {
          newStack.shift(); // Remove the oldest item
        }
        return newStack;
      }

      // For real navigation, check if the current page is already at the top to avoid duplicates
      if (prev.length > 0 && prev[prev.length - 1].path === pageInfo.path && !prev[prev.length - 1].isDemo) {
        return prev;
      }

      // Limit stack to 5 items to prevent excessive growth
      const newStack = [...prev, { ...pageInfo, isDemo: false }];
      if (newStack.length > 5) {
        newStack.shift(); // Remove the oldest item
      }

      return newStack;
    });
  };

  const removeFromStack = (level) => {
    setNavigationStack(prev => prev.slice(0, -Math.abs(level)));
  };

  const clearStack = () => {
    setNavigationStack([]);
  };

  const navigateBack = (navigateFn, steps = 1) => {
    setNavigationStack(prev => {
      const newStack = [...prev];
      newStack.splice(-steps); // Remove the last 'steps' items
      return newStack;
    });
    navigateFn(-steps); // Navigate browser history back
  };

  // Method to handle back navigation by index (for clicking items in stack)
  const navigateToIndex = (navigateFn, index) => {
    setNavigationStack(prev => {
      // Keep only items up to the clicked index (simulate navigating back to that point)
      const newStack = prev.slice(0, index + 1);
      return newStack;
    });
    // Calculate how many steps back to navigate
    navigateFn(-(navigationStack.length - 1 - index));
  };

  return (
    <NavigationStackContext.Provider value={{
      navigationStack,
      addToStack,
      removeFromStack,
      clearStack,
      navigateBack,
      navigateToIndex
    }}>
      {children}
    </NavigationStackContext.Provider>
  );
};

export const useNavigationStack = () => {
  const context = useContext(NavigationStackContext);
  if (!context) {
    throw new Error('useNavigationStack must be used within a NavigationStackProvider');
  }
  return context;
};