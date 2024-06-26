import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Action } from '../types/action.types';
import { API_ACTIONS_PATH, API_URL } from '../config';

interface ActionsContextProps {
  actions: Action[];
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
  createAction: (setupId: string, action: Action) => Promise<Action | void>;
  updateAction: (id: string, updatedAction: Partial<Action>) => Promise<Action | void>;
  deleteAction: (id: string) => Promise<void>;
}

export const ActionsContext = createContext<ActionsContextProps | undefined>(
  undefined,
);

export const useActionsContext = (): ActionsContextProps => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useActionsContext must be used within an ActionsProvider');
  }
  return context;
};

interface ActionsProviderProps {
  children: React.ReactNode;
}

export const ActionsProvider: React.FC<ActionsProviderProps> = ({
  children,
}) => {
  const [actions, setActions] = useState<Action[]>([]);

  const fetchActions = async () => {
    try {
      const response = await axios.get<Action[]>(
        `${API_URL}${API_ACTIONS_PATH}`,
      );
      setActions(response.data);
    } catch (error) {
      console.error('Error fetching actions', error);
    }
  };

  const createAction = async (setupId: string, action: Action): Promise<Action | void> => {
    try {
      const response = await axios.post(
        `${API_URL}${API_ACTIONS_PATH}/${setupId}`,
        action,
      );

      console.log("createAction", response.data)

      if (response.status === 201) {
        setActions((prevActions) => [...prevActions, response.data]);
      }
      return response.data
    } catch (error) {
      console.error('Error creating action', error);
      // must throw
    }
  };

  const updateAction = async (id: string, updatedAction: Partial<Action>): Promise<Action | void> => {
    try {
      const response = await axios.put(
        `${API_URL}${API_ACTIONS_PATH}/${id}`,
        updatedAction,
      );

      if (response.status === 200) {
        setActions((prevActions) =>
          prevActions.map((action) =>
            action.id === id ? response.data : action,
          ),
        );
        return response.data
      }
    } catch (error) {
      console.error('Error updating action', error);
    }
  };

  const deleteAction = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}${API_ACTIONS_PATH}/${id}`,
      );
      if (response.status === 200) {
        setActions((prevActions) =>
          prevActions.filter((action) => action.id !== id),
        );
      }
    } catch (error) {
      console.error('Error deleting action', error);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return (
    <ActionsContext.Provider
      value={{ actions, setActions, createAction, updateAction, deleteAction }}
    >
      {children}
    </ActionsContext.Provider>
  );
};
