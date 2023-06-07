import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'axios';
import { Setup } from '../types/setup.types';

interface SetupsContextProps {
  setups: Setup[];
  setSetups: React.Dispatch<React.SetStateAction<Setup[]>>;
  deleteSetup: (id: string) => Promise<void>;
  updateSetup: (id: string, updatedSetup: Setup) => Promise<void>;
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
      const response = await axios.get<Setup[]>(
        'http://127.0.0.1:1234/api/setups',
      );
      setSetups(response.data);
    } catch (error) {
      console.error('Error fetching setups', error);
    }
  };

  const deleteSetup = async (id: string) => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:1234/api/setups/${id}`,
      );
      if (response.status === 200) {
        setSetups((prevSetups) =>
          prevSetups.filter((setup) => setup.id !== id),
        );
      }
    } catch (error) {
      console.error('Error deleting setup', error);
    }
  };

  const updateSetup = async (id: string, updatedSetup: Setup) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:1234/api/setups/${id}`,
        updatedSetup,
      );
      if (response.status === 200) {
        setSetups((prevSetups) =>
          prevSetups.map((setup) => (setup.id === id ? response.data : setup)),
        );
      }
    } catch (error) {
      console.error('Error updating setup', error);
    }
  };

  useEffect(() => {
    fetchSetups();
  }, []);

  return (
    <SetupsContext.Provider
      value={{ setups, setSetups, deleteSetup, updateSetup }}
    >
      {children}
    </SetupsContext.Provider>
  );
};
