import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store';
import { Modalidad, TipoSesion } from '../types';

const PRIMARY = '#0D9488';

const MODALIDADES: Modalidad[] = ['Presencial', 'Virtual', 'Híbrida'];
const TIPOS: TipoSesion[] = ['Evaluación inicial', 'Seguimiento', 'Cierre', 'Emergencia'];

interface Props {
  navigation: any;
}

export default function NuevaSesionScreen({ navigation }: Props) {
  const clientes = useStore((s) => s.clientes);
  const addSesion = useStore((s) => s.addSesion);

  const [clienteId, setClienteId] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad>('Presencial');
  const [tipoSesion, setTipoSesion] = useState<TipoSesion>('Evaluación inicial');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const handleGuardar = () => {
    if (!clienteId) {
      Alert.alert('Error', 'Selecciona un cliente');
      return;
    }
    if (!fecha.trim()) {
      Alert.alert('Error', 'Ingresa la fecha (YYYY-MM-DD)');
      return;
    }
    if (!hora.trim()) {
      Alert.alert('Error', 'Ingresa la hora (HH:MM)');
      return;
    }

    const id = addSesion({ clienteId, modalidad, tipoSesion, fecha, hora });
    Alert.alert('✅ Sesión creada', 'La sesión fue guardada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Nueva Sesión</Text>

        {/* Cliente picker */}
        <Text style={styles.label}>Cliente</Text>
        <View style={styles.optionsRow}>
          {clientes.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.optionBtn, clienteId === c.id && styles.optionBtnActive]}
              onPress={() => setClienteId(c.id)}
            >
              <Text
                style={[styles.optionText, clienteId === c.id && styles.optionTextActive]}
                numberOfLines={1}
              >
                {c.nombre}
              </Text>
              <Text
                style={[styles.optionSubtext, clienteId === c.id && styles.optionSubtextActive]}
                numberOfLines={1}
              >
                🐴 {c.caballo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modalidad */}
        <Text style={styles.label}>Modalidad</Text>
        <View style={styles.optionsRow}>
          {MODALIDADES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, modalidad === m && styles.chipActive]}
              onPress={() => setModalidad(m)}
            >
              <Text style={[styles.chipText, modalidad === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tipo sesión */}
        <Text style={styles.label}>Tipo de sesión</Text>
        <View style={styles.tiposGrid}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, styles.chipWide, tipoSesion === t && styles.chipActive]}
              onPress={() => setTipoSesion(t)}
            >
              <Text style={[styles.chipText, tipoSesion === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fecha */}
        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          value={fecha}
          onChangeText={setFecha}
          placeholder="2025-07-15"
          placeholderTextColor="#94A3B8"
        />

        {/* Hora */}
        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          value={hora}
          onChangeText={setHora}
          placeholder="10:00"
          placeholderTextColor="#94A3B8"
        />

        {/* Botones */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSave} onPress={handleGuardar}>
            <Text style={styles.btnSaveText}>Guardar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionBtnActive: { borderColor: PRIMARY, backgroundColor: '#F0FDFA' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  optionTextActive: { color: PRIMARY },
  optionSubtext: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  optionSubtextActive: { color: '#0F766E' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  chipWide: { flex: 1, alignItems: 'center', borderRadius: 12 },
  chipActive: { borderColor: PRIMARY, backgroundColor: '#F0FDFA' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: PRIMARY, fontWeight: '700' },
  tiposGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#fff',
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  btnCancelText: { color: '#64748B', fontWeight: '600' },
  btnSave: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
