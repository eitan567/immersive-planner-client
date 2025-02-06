import React, { useEffect } from 'react';

export const usePreventPageReset = () => {
  useEffect(() => {
    const handleVisibilityChange = (event: Event) => {
      event.preventDefault();
      if (document.visibilityState === 'visible') {
        // Prevent the default behavior that might cause a page refresh
        event.stopPropagation();
      }
    };

    const handleFreeze = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // This prevents the page from reloading when it's restored
        event.preventDefault();
      }
    };

    // Handle visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange, true);
    
    // Handle page freeze events
    document.addEventListener('freeze', handleFreeze, true);
    
    // Handle page hide/show events
    window.addEventListener('pagehide', handlePageHide, true);
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        event.preventDefault();
      }
    }, true);

    // Handle beforeunload to prevent refresh on minimize/maximize
    window.addEventListener('beforeunload', (event) => {
      const target = event.target as Document;
      if (target.visibilityState === 'hidden') {
        event.preventDefault();
        event.returnValue = '';
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
      document.removeEventListener('freeze', handleFreeze, true);
      window.removeEventListener('pagehide', handlePageHide, true);
    };
  }, []);
};