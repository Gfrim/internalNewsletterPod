
'use client';

import * as React from 'react';
import type { Source } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

interface SourceContextType {
  sources: Source[];
  addSource: (source: Omit<Source, 'id' | 'createdAt'>) => Promise<void>;
  loading: boolean;
}

const SourceContext = React.createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = React.useState<Source[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, "newsletterCollection"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sourcesData: Source[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sourcesData.push({ 
            id: doc.id, 
            ...data,
            // Ensure createdAt is a string
            createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt
        } as Source);
      });
      setSources(sourcesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching sources:", error);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addSource = async (sourceData: Omit<Source, 'id' | 'createdAt'>) => {
    try {
      // Create a clean object, removing undefined fields
      const dataToSave = { ...sourceData };
      Object.keys(dataToSave).forEach(key => (dataToSave as any)[key] === undefined && delete (dataToSave as any)[key]);

      await addDoc(collection(db, "newsletterCollection"), {
        ...dataToSave,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <SourceContext.Provider value={{ sources, addSource, loading }}>
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
