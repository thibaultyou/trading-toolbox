import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Setup } from '../types/setup.types';
import { StatusType, TriggerType } from '../types/common.types';

interface SetupFormContextProps {
  setup: Setup;
  setSetup: React.Dispatch<React.SetStateAction<Setup>>;
  handleSubmit: (e: React.FormEvent) => void;
  areActionsValid: boolean;
  setActionsValidity: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SetupFormContext = createContext<
  SetupFormContextProps | undefined
>(undefined);

export const useSetupFormContext = (): SetupFormContextProps => {
  const context = useContext(SetupFormContext);
  if (!context) {
    throw new Error('useSetupFormContext must be used within a SetupProvider');
  }
  return context;
};

interface SetupProviderProps {
  children: ReactNode;
}

export const SetupFormProvider: React.FC<SetupProviderProps> = ({
  children,
}) => {
  const [setup, setSetup] = useState<Setup>({
    ticker: '',
    account: '',
    trigger: TriggerType.NONE,
    status: StatusType.PENDING,
    value: undefined,
    actions: [],
    retries: 3,
  });

  const [areActionsValid, setActionsValidity] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('submit', setup);
      const response = await axios.post(
        'http://127.0.0.1:1234/api/setups',
        setup,
      );
      console.log('response', response.data);
      setSetup({
        ticker: '',
        account: '',
        trigger: TriggerType.NONE,
        status: StatusType.PENDING,
        value: undefined,
        actions: [],
        retries: 3,
      });
      setActionsValidity(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SetupFormContext.Provider
      value={{
        setup,
        setSetup,
        handleSubmit,
        areActionsValid,
        setActionsValidity,
      }}
    >
      {children}
    </SetupFormContext.Provider>
  );
};
