import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import AppBar from './components/molecules/AppBar';
import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import SetupsPage from './pages/SetupsPage';

const App = () => {
  const [variant, setTheme] = React.useState(false);

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          background: {
            default: variant ? '#dee4e7' : '#1f2629',
          },
          // mode: variant ? 'light' : 'dark',
          mode: 'light',
        },
      }),
    [variant],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className="App">
        <BrowserRouter>
          <AppBar variant={variant} setTheme={setTheme} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="create" element={<HomePage />} />
            <Route path="setups" element={<SetupsPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};

export default App;
