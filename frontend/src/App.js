import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useOutlet } from 'react-router-dom';
import Comanda from './pagini/Comanda';
import Senzori from './pagini/Senzori';
import Setari from './pagini/Setari';
import Grafice from './pagini/Grafice';
import Autentificare from './pagini/Login';
import LayoutNou from './componente/LayoutNou';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { MotionConfig, AnimatePresence } from 'framer-motion';
import PageTransition from './componente/PageTransition';
import { NotificationProvider } from './context/NotificationContext';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
        primary: { main: '#00ff88' },
        background: { default: '#0b0c15', paper: '#1a1a2e' },
        text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
      }
      : {
        primary: { main: '#009955' },
        background: { default: '#E5E0D5', paper: '#F2EFED' },
        text: { primary: '#1A1A1A', secondary: '#444444' },
      }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 }
  }
});

const RutaPrivata = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AnimatedLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const { settings } = useSettings();

  const animationsActive = settings.animationsEnabled;

  return (
    <LayoutNou>
      {animationsActive ? (
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      ) : (
        <>{outlet}</>
      )}
    </LayoutNou>
  );
};

const AppContent = () => {
  const { settings } = useSettings();

  const theme = useMemo(() => createTheme(getDesignTokens(settings.darkMode ? 'dark' : 'light')), [settings.darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        {}
        <MotionConfig transition={settings.animationsEnabled ? undefined : { duration: 0 }}>
          <Router>
            <Routes>
              <Route path="/login" element={<Autentificare />} />

              {}
              <Route element={
                <RutaPrivata>
                  <AnimatedLayout />
                </RutaPrivata>
              }>
                <Route path="/" element={<Comanda />} />
                <Route path="/senzori" element={<Senzori />} />
                <Route path="/grafice" element={<Grafice />} />
                <Route path="/setari" element={<Setari />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </MotionConfig>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <TelemetryProvider>
        <AppContent />
      </TelemetryProvider>
    </SettingsProvider>
  );
}
