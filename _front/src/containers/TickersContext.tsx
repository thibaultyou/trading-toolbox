import axios from 'axios';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { API_URL, API_TICKERS_PATH } from '../config';
import { Candle } from '../types/ticker.types';

interface TickersContextProps {
  tickers: string[];
  setTickers: React.Dispatch<React.SetStateAction<string[]>>;
  tickerHistory: any[];
  setTickerHistory: React.Dispatch<React.SetStateAction<any[]>>;
  fetchTickerHistory: (symbol: string, fetchNewOnly?: boolean) => Promise<void>;
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
  const [tickerHistory, setTickerHistory] = useState<Candle[]>([]);

  const fetchTickers = async () => {
    try {
      const response = await axios.get(`${API_URL}${API_TICKERS_PATH}`);
      setTickers(response.data);
    } catch (error) {
      console.error('Error fetching tickers', error);
    }
  };

  const fetchTickerHistory = async (
    symbol: string,
    fetchNewOnly: boolean = false,
  ): Promise<void> => {
    try {
      const response = await axios.get(
        `${API_URL}${API_TICKERS_PATH}/${symbol}/history`,
        {
          params: { newOnly: fetchNewOnly },
        },
      );
      if (fetchNewOnly) {
        setTickerHistory((prevHistory) => [...response.data, ...prevHistory]);
      } else {
        setTickerHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching ticker history', error);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  return (
    <TickersContext.Provider
      value={{
        tickers,
        setTickers,
        tickerHistory,
        setTickerHistory,
        fetchTickerHistory,
      }}
    >
      {children}
    </TickersContext.Provider>
  );
};
