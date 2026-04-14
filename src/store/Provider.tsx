import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, RootState } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store'; // Will add later

interface ProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: ProviderProps) {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
