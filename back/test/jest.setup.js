jest.mock('@nestjs/common', () => {
    const original = jest.requireActual('@nestjs/common');
  
    class MockLogger {
      log = jest.fn();
      error = jest.fn();
      warn = jest.fn();
      debug = jest.fn();
      verbose = jest.fn();
      static overrideLogger = jest.fn();
    }
  
    return {
      ...original,
      Logger: MockLogger,
    };
  });
  