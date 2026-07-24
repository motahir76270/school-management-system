import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import AppScreens from '@/components/screens/app';
import AlertManager from '@/components/AlertManager';
import { setGlobalAlertRef } from '@/components/service/AlertService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
    const alertRef = useRef<any>();
    useEffect(() => {
    // Set the global alert reference
    if (alertRef.current) {
      setGlobalAlertRef(alertRef.current);
    }
  }, []);
  return (
    <Provider store={store}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppScreens />
      <AlertManager ref={alertRef} />
    </ThemeProvider>
    </Provider>
  );
}
