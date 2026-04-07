import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import NuevaSesionScreen from './src/screens/NuevaSesionScreen';
import DetalleSesionScreen from './src/screens/DetalleSesionScreen';
import FirmaScreen from './src/screens/FirmaScreen';
import SeguimientoScreen from './src/screens/SeguimientoScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  NuevaSesion: undefined;
  DetalleSesion: { sesionId: string };
  Firma: { sesionId: string };
  Seguimiento: { sesionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const PRIMARY = '#0D9488';

function AppNavigator() {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: PRIMARY },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NuevaSesion"
            component={NuevaSesionScreen}
            options={{ title: 'Nueva Sesión' }}
          />
          <Stack.Screen
            name="DetalleSesion"
            component={DetalleSesionScreen}
            options={{ title: 'Detalle de Sesión' }}
          />
          <Stack.Screen
            name="Firma"
            component={FirmaScreen}
            options={{ title: 'Carta Responsiva' }}
          />
          <Stack.Screen
            name="Seguimiento"
            component={SeguimientoScreen}
            options={{ title: 'Seguimiento' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
