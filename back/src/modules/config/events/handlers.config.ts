const modules = [
  'CoreModule',
  'ExchangeModule',
  'MarketModule',
  'OrderModule',
  'PositionModule',
  'StrategyModule',
  'TickerModule',
  'WalletModule'
];

export const EventHandlersContext = modules.reduce(
  (acc, module) => {
    acc[module] = `${module}EventHandler`;
    return acc;
  },
  {} as Record<string, string>
);

export type EventHandlersContextType = keyof typeof EventHandlersContext;
