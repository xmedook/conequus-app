import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore((s) => s.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Ingresa tu correo y contrasena');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.logo}>C</Text>
          </View>
          <Text style={styles.brandName}>Conequus</Text>
          <Text style={styles.brandSubtitle}>Coaching Cuántico Asistido con Caballos</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="coach@conequus.mx"
              placeholderTextColor="#C7C7CC"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Contrasena</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Requerida"
              placeholderTextColor="#C7C7CC"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Iniciar Sesion</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>Cualquier credencial funciona en este POC</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.4,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    width: 90,
    fontSize: 17,
    color: '#000',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
  btn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  hint: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 13,
  },
});
