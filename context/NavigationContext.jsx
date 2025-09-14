"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [navigationStack, setNavigationStack] = useState([]);
  const [previousPage, setPreviousPage] = useState(null);
  const pathname = usePathname();
  const isNavigatingBack = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    // If we're navigating back, don't add to stack
    if (isNavigatingBack.current) {
      isNavigatingBack.current = false;
      return;
    }

    setNavigationStack(prev => {
      // Don't add if it's the same as the last page
      if (prev.length > 0 && prev[prev.length - 1] === pathname) {
        return prev;
      }

      const newStack = [...prev, pathname];
      
      // Keep only last 10 entries to prevent memory issues
      const limitedStack = newStack.slice(-10);
      
      // Update previous page
      if (limitedStack.length >= 2) {
        setPreviousPage(limitedStack[limitedStack.length - 2]);
      } else {
        setPreviousPage(null);
      }
      
      // Debug logging
      console.log('Navigation Stack Updated:', limitedStack);
      console.log('Current page:', pathname);
      console.log('Previous page:', limitedStack.length >= 2 ? limitedStack[limitedStack.length - 2] : 'None');
      
      return limitedStack;
    });
  }, [pathname]);

  const navigateBack = (router) => {
    setNavigationStack(prev => {
      if (prev.length <= 1) {
        // If only one page in stack, go to home
        setTimeout(() => router.push('/'), 0);
        return prev;
      }

      // Remove current page from stack and go to previous
      const newStack = prev.slice(0, -1);
      const targetPage = newStack[newStack.length - 1] || '/';
      
    //   console.log('Navigating back from:', prev[prev.length - 1]);
    //   console.log('Navigating back to:', targetPage);
    //   console.log('New stack:', newStack);
      
      // Mark that we're navigating back to prevent adding to stack
      isNavigatingBack.current = true;
      
      // Update previous page
      if (newStack.length >= 2) {
        setPreviousPage(newStack[newStack.length - 2]);
      } else {
        setPreviousPage(null);
      }
      
      // Navigate after state update
      setTimeout(() => {
        router.push(targetPage);
      }, 0);
      
      return newStack;
    });
  };

  const getPreviousPage = () => {
    if (navigationStack.length >= 2) {
      return navigationStack[navigationStack.length - 2];
    }
    return null;
  };

  const clearHistory = () => {
    setNavigationStack([]);
    setPreviousPage(null);
  };

  const value = {
    navigationStack,
    previousPage: getPreviousPage(),
    navigateBack,
    clearHistory
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
