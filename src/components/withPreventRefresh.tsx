import React, { useEffect } from 'react';

export const withPreventRefresh = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithPreventRefreshComponent(props: P) {
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Prevent the refresh
        e.preventDefault();
        e.returnValue = '';
      };

      // Prevent refresh on page resize
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Prevent refresh on mobile browsers
      window.addEventListener('pagehide', (e) => {
        if (e.persisted) {
          e.preventDefault();
        }
      });

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
};