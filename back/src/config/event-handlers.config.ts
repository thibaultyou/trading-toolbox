export const EventHandlersContext = {
  CoreModule: 'CoreModuleEventHandler',
  ExchangeModule: 'ExchangeModuleEventHandler',
  MarketModule: 'MarketModuleEventHandler',
  OrderModule: 'OrderModuleEventHandler',
  PositionModule: 'PositionModuleEventHandler',
  StrategyModule: 'StrategyModuleEventHandler',
  TickerModule: 'TickerModuleEventHandler',
  WalletModule: 'WalletModuleEventHandler'
} as const;

export type EventHandlersContextType = (typeof EventHandlersContext)[keyof typeof EventHandlersContext];
