import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import NuevoClienteScreen from './src/screens/NuevoClienteScreen';
import NuevaSesionScreen from './src/screens/NuevaSesionScreen';
import DetalleSesionScreen from './src/screens/DetalleSesionScreen';
import FirmaScreen from './src/screens/FirmaScreen';
import SeguimientoScreen from './src/screens/SeguimientoScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Clientes: undefined;
  NuevoCliente: { clienteId?: string } | undefined;
  NuevaSesion: undefined;
  DetalleSesion: { sesionId: string };
  Firma: { sesionId: string };
  Seguimiento: { sesionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F2F2F7',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: '#000',
        },
        cardStyle: { backgroundColor: '#F2F2F7' },
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
            name="Clientes"
            component={ClientesScreen}
            options={{ title: 'Clientes' }}
          />
          <Stack.Screen
            name="NuevoCliente"
            component={NuevoClienteScreen}
            options={{ title: 'Cliente' }}
          />
          <Stack.Screen
            name="NuevaSesion"
            component={NuevaSesionScreen}
            options={{ title: 'Nueva Sesion' }}
          />
          <Stack.Screen
            name="DetalleSesion"
            component={DetalleSesionScreen}
            options={{ title: 'Detalle' }}
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
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
