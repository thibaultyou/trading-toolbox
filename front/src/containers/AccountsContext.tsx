import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'axios';
import { Account } from '../types/account.types';

interface AccountsContextProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

export const AccountsContext = createContext<AccountsContextProps | undefined>(
  undefined,
);

export const useAccountsContext = (): AccountsContextProps => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error(
      'useAccountsContext must be used within a AccountsProvider',
    );
  }
  return context;
};

interface AccountsProviderProps {
  children: ReactNode;
}

export const AccountsProvider: React.FC<AccountsProviderProps> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get<Account[]>(
        'http://127.0.0.1:1234/api/accounts',
      );
      setAccounts(response.data);
      //   if (response.data.length)
      //     setSetup({ ...setup, account: response.data[0].name });
    } catch (error) {
      console.error('Error fetching accounts', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <AccountsContext.Provider value={{ accounts, setAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
};
