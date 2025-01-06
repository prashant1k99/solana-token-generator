import { createContext, useContext, ReactNode, useCallback } from 'react';

type RefreshContextType = {
  refresh: () => void;
};

export const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

type RefreshProviderProps = {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
};

export function RefreshProvider({ children, onRefresh }: RefreshProviderProps) {
  const refresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <RefreshContext.Provider value={{ refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
