import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Stack } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='(auth)' screenOptions={{headerShown:false}}>
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='(tabs)' />

        <Stack.Screen name='screens/settings/changePassword' />
        <Stack.Screen name='screens/settings/about' />
        <Stack.Screen name='screens/settings/privacy' />
        <Stack.Screen name='screens/settings/helpCenter' />
        <Stack.Screen name='screens/settings/support' />
        <Stack.Screen name='screens/settings/terms' />

        <Stack.Screen name='screens/features/assignment' />
        <Stack.Screen name='screens/features/homeWork' />
        <Stack.Screen name='screens/features/attendance' />
        <Stack.Screen name='screens/features/myClasses' />
        <Stack.Screen name='screens/features/myResult' />
        <Stack.Screen name='screens/features/feeStructure' />

      </Stack>
    </ThemeProvider>
  );
}
