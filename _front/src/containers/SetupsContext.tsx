import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'axios';
import { Setup } from '../types/setup.types';
import { API_URL, API_SETUPS_PATH } from '../config';

interface SetupsContextProps {
  setups: Setup[];
  setSetups: React.Dispatch<React.SetStateAction<Setup[]>>;
  fetchSetups: () => Promise<void>;
  fetchSetup: (id: string) => Promise<void>;
  createSetup: (setup: Setup) => Promise<void>;
  updateSetup: (id: string, updatedSetup: Setup) => Promise<void>;
  deleteSetup: (id: string) => Promise<void>;
}

export const SetupsContext = createContext<SetupsContextProps | undefined>(
  undefined,
);

export const useSetupsContext = (): SetupsContextProps => {
  const context = useContext(SetupsContext);
  if (!context) {
    throw new Error('useSetupsContext must be used within a SetupsProvider');
  }
  return context;
};

interface SetupsProviderProps {
  children: ReactNode;
}

export const SetupsProvider: React.FC<SetupsProviderProps> = ({ children }) => {
  const [setups, setSetups] = useState<Setup[]>([]);

  const fetchSetups = async () => {
    try {
      const response = await axios.get<Setup[]>(`${API_URL}${API_SETUPS_PATH}`);
      setSetups(response.data);
    } catch (error) {
      console.error('Error fetching setups', error);
    }
  };

  const fetchSetup = async (id: string) => {
    try {
      const response = await axios.get<Setup>(
        `${API_URL}${API_SETUPS_PATH}/${id}`,
      );
      setSetups((prevSetups) => [...prevSetups, response.data]);
    } catch (error) {
      console.error('Error fetching setup', error);
    }
  };

  const createSetup = async (setup: Setup) => {
    try {
      const response = await axios.post<Setup>(
        `${API_URL}${API_SETUPS_PATH}`,
        setup,
      );
      setSetups((prevSetups) => [...prevSetups, response.data]);
    } catch (error) {
      console.error('Error creating setup', error);
    }
  };

  const updateSetup = async (id: string, updatedSetup: Setup) => {
    try {
      const response = await axios.put<Setup>(
        `${API_URL}${API_SETUPS_PATH}/${id}`,
        updatedSetup,
      );

      console.log("updateSetup", updatedSetup, response)


      setSetups((prevSetups) =>
        prevSetups.map((setup) => (setup.id === id ? updatedSetup : setup)),
      );
    } catch (error) {
      console.error('Error updating setup', error);
    }
  };

  const deleteSetup = async (id: string) => {
    try {
      await axios.delete(`${API_URL}${API_SETUPS_PATH}/${id}`);
      setSetups((prevSetups) => prevSetups.filter((setup) => setup.id !== id));
    } catch (error) {
      console.error('Error deleting setup', error);
    }
  };

  useEffect(() => {
    fetchSetups();
  }, []);

  return (
    <SetupsContext.Provider
      value={{
        setups,
        setSetups,
        fetchSetup,
        fetchSetups,
        createSetup,
        updateSetup,
        deleteSetup,
      }}
    >
      {children}
    </SetupsContext.Provider>
  );
};
