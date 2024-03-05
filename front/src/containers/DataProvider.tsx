import React, { ReactNode } from 'react';
import { SetupFormProvider } from './SetupFormContext';
import { AccountsProvider } from './AccountsContext';
import { TickersProvider } from './TickersContext';
import { SetupsProvider } from './SetupsContext';
import { ActionsProvider } from './ActionsContext';
import { BalancesProvider } from './BalancesContext';

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  return (
    <AccountsProvider>
      <TickersProvider>
        <BalancesProvider>
          <SetupsProvider>
            <ActionsProvider>
              <SetupFormProvider>{children}</SetupFormProvider>
            </ActionsProvider>
          </SetupsProvider>
        </BalancesProvider>
      </TickersProvider>
    </AccountsProvider>
  );
};
