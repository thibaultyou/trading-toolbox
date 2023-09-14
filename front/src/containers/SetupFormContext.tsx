import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Setup } from '../types/setup.types';
import { StatusType, TriggerType } from '../types/common.types';
import { useSetupsContext } from './SetupsContext';
import { API_URL, API_SETUPS_PATH } from '../config';

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
  const { fetchSetups } = useSetupsContext();
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
      const response = await axios.post(`${API_URL}${API_SETUPS_PATH}`, setup);
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
      fetchSetups();
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
