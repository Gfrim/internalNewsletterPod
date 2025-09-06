
'use client';

import * as React from 'react';
import type { Source } from '@/lib/types';
import { mockSources } from '@/lib/data';

interface SourceContextType {
  sources: Source[];
  addSource: (source: Source) => void;
}

const SourceContext = React.createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = React.useState<Source[]>(mockSources);

  const addSource = (newSource: Source) => {
    setSources((prevSources) => [newSource, ...prevSources]);
  };

  return (
    <SourceContext.Provider value={{ sources, addSource }}>
      {children}
    </SourceContext.Provider>
  );
}

export function useSource() {
  const context = React.useContext(SourceContext);
  if (context === undefined) {
    throw new Error('useSource must be used within a SourceProvider');
  }
  return context;
}
