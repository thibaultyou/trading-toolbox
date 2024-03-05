import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'axios';
import { API_URL, API_BALANCES_PATH } from '../config';

interface BalancesContextProps {
  balances: Record<string, number>;
  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export const BalancesContext = createContext<BalancesContextProps | undefined>(
  undefined,
);

export const useBalancesContext = (): BalancesContextProps => {
  const context = useContext(BalancesContext);
  if (!context) {
    throw new Error(
      'useBalancesContext must be used within a BalancesProvider',
    );
  }
  return context;
};

interface BalancesProviderProps {
  children: ReactNode;
}

export const BalancesProvider: React.FC<BalancesProviderProps> = ({ children }) => {
  const [balances, setBalances] = useState<Record<string, number>>({});

  const fetchBalances = async () => {
    try {
      const response = await axios.get(`${API_URL}${API_BALANCES_PATH}`);
      setBalances(response.data); // Directly use the object response
    } catch (error) {
      console.error('Error fetching balances', error);
    }
  };

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, []);
 
  // useEffect(() => {
  //   let ws: WebSocket | null = new WebSocket(WEB_SOCKET_URL);

  //   ws.onopen = () => {
  //     console.log('WebSocket connection established');
  //     // Optionally send a message to the server after establishing the connection
  //     // ws.send(JSON.stringify({ action: 'subscribeToBalanceUpdates' }));
  //   };

  //   ws.onmessage = (event) => {
  //     // Assuming the server sends the updated balance data as JSON
  //     const data = JSON.parse(event.data);
  //     console.log(data)
  //     // setBalances(new Map(Object.entries(data)));
  //   };

  //   ws.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //   };

  //   ws.onclose = () => {
  //     console.log('WebSocket connection closed');
  //     // Optionally reconnect or handle the closed connection as needed
  //   };

  //   return () => {
  //     ws?.close();
  //     ws = null;
  //   };
  // }, []);

  return (
    <BalancesContext.Provider value={{ balances, setBalances }}>
      {children}
    </BalancesContext.Provider>
  );
};
