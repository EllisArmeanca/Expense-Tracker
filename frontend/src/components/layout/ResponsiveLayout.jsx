import React, { useState, useEffect } from 'react';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

// Custom hook to detect mobile devices
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check window width or userAgent (more reliable in SSR)
      if (typeof window !== 'undefined') {
        return window.innerWidth <= 768;
      }
      return false;
    };

    // Initial detection
    setIsMobile(checkIsMobile());

    // Event listener for window resize
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

const ResponsiveLayout = ({ children }) => {
  const isMobile = useMobileDetection();

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
};

export default ResponsiveLayout;