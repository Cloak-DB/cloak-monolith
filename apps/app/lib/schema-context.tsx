'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface SchemaContextValue {
  selectedSchema: string;
  setSelectedSchema: (schema: string) => void;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);

interface SchemaProviderProps {
  children: ReactNode;
  defaultSchema?: string;
}

export function SchemaProvider({
  children,
  defaultSchema = 'public',
}: SchemaProviderProps) {
  const [selectedSchema, setSelectedSchemaState] = useState(defaultSchema);

  const setSelectedSchema = useCallback((schema: string) => {
    setSelectedSchemaState(schema);
  }, []);

  return (
    <SchemaContext.Provider value={{ selectedSchema, setSelectedSchema }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
}
