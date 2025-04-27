import React from 'react';
import { UIProvider } from './UIContext';

export const AllProviders = ({ children }) => {
  return (
    <UIProvider>
      {children}
    </UIProvider>
  );
};

export { useUI } from './UIContext';
