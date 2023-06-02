import React, { ReactNode } from 'react';
import { SetupFormProvider } from './SetupFormContext';
import { AccountsProvider } from './AccountsContext';
import { TickersProvider } from './TickersContext';
import { SetupsProvider } from './SetupsContext';

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  return (
    <AccountsProvider>
      <TickersProvider>
        <SetupsProvider>
          <SetupFormProvider>{children}</SetupFormProvider>
        </SetupsProvider>
      </TickersProvider>
    </AccountsProvider>
  );
};
