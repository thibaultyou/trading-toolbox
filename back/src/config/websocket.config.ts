export const websocketConfig = {
  cors: {
    origin: process.env.WS_CORS_ORIGIN
      ? process.env.WS_CORS_ORIGIN.split(',')
      : '*',
  },
  namespace: process.env.WS_NAMESPACE || '/ws',
};
