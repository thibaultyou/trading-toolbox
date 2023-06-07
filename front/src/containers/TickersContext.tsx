import axios from 'axios';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

interface TickersContextProps {
  tickers: string[];
  setTickers: React.Dispatch<React.SetStateAction<string[]>>;
}

export const TickersContext = createContext<TickersContextProps | undefined>(
  undefined,
);

export const useTickersContext = (): TickersContextProps => {
  const context = useContext(TickersContext);
  if (!context) {
    throw new Error('useTickersContext must be used within a TickersProvider');
  }
  return context;
};

interface TickersProviderProps {
  children: ReactNode;
}

export const TickersProvider: React.FC<TickersProviderProps> = ({
  children,
}) => {
  const [tickers, setTickers] = useState<string[]>([]);

  const fetchTickers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:1234/api/tickers');
      setTickers(response.data);
    } catch (error) {
      console.error('Error fetching tickers', error);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  return (
    <TickersContext.Provider value={{ tickers, setTickers }}>
      {children}
    </TickersContext.Provider>
  );
};
