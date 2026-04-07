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
  ActivityIndicator,
  Platform,
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
  const crearSesion = useStore((s) => s.crearSesion);

  const [clienteId, setClienteId] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad>('Presencial');
  const [tipoSesion, setTipoSesion] = useState<TipoSesion>('Evaluación inicial');

  // For web: use a single datetime-local string; for native: separate text fields
  const now = new Date();
  const padded = (n: number) => String(n).padStart(2, '0');
  const defaultDatetime = `${now.getFullYear()}-${padded(now.getMonth() + 1)}-${padded(now.getDate())}T${padded(now.getHours())}:${padded(now.getMinutes())}`;
  const [datetimeWeb, setDatetimeWeb] = useState(defaultDatetime);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!clienteId) nuevosErrores.cliente = 'Selecciona un cliente para continuar.';

    if (Platform.OS === 'web') {
      if (!datetimeWeb) nuevosErrores.fecha = 'Selecciona la fecha y hora de la sesión.';
    } else {
      if (!fecha.trim()) nuevosErrores.fecha = 'Ingresa la fecha (YYYY-MM-DD).';
      if (!hora.trim()) nuevosErrores.hora = 'Ingresa la hora (HH:MM).';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;

    setGuardando(true);
    try {
      let fechaFinal = fecha;
      let horaFinal = hora;

      if (Platform.OS === 'web' && datetimeWeb) {
        const [f, h] = datetimeWeb.split('T');
        fechaFinal = f;
        horaFinal = h;
      }

      // Build ISO timestamp for DB
      const fechaHora = `${fechaFinal}T${horaFinal}:00`;
      await crearSesion({
        cliente_id: clienteId,
        modalidad,
        tipo_sesion: tipoSesion,
        fecha_hora: fechaHora,
      });

      Alert.alert(
        '✅ Sesión creada',
        'La sesión fue guardada correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar la sesión. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nueva Sesión</Text>

        {/* Cliente selector */}
        <Text style={styles.label}>Cliente</Text>
        {clientes.length === 0 ? (
          <Text style={styles.emptyMsg}>No hay clientes registrados.</Text>
        ) : (
          <View style={styles.optionsRow}>
            {clientes.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.optionBtn, clienteId === c.id && styles.optionBtnActive]}
                onPress={() => {
                  setClienteId(c.id);
                  setErrores((prev) => ({ ...prev, cliente: '' }));
                }}
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
        )}
        {!!errores.cliente && <Text style={styles.errorText}>{errores.cliente}</Text>}

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

        {/* Fecha y hora — web usa datetime-local, nativo usa TextInput */}
        {Platform.OS === 'web' ? (
          <>
            <Text style={styles.label}>Fecha y hora</Text>
            {/* @ts-ignore — HTML input only on web */}
            <input
              type="datetime-local"
              value={datetimeWeb}
              onChange={(e: any) => {
                setDatetimeWeb(e.target.value);
                setErrores((prev) => ({ ...prev, fecha: '' }));
              }}
              style={{
                padding: 12,
                borderRadius: 8,
                border: errores.fecha ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                fontSize: 16,
                width: '100%',
                color: '#1e293b',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                outline: 'none',
                accentColor: PRIMARY,
              }}
            />
            {!!errores.fecha && <Text style={styles.errorText}>{errores.fecha}</Text>}
          </>
        ) : (
          <>
            <Text style={styles.label}>Fecha</Text>
            <TextInput
              style={[styles.input, !!errores.fecha && styles.inputError]}
              value={fecha}
              onChangeText={(v) => {
                setFecha(v);
                setErrores((prev) => ({ ...prev, fecha: '' }));
              }}
              placeholder="2025-07-15"
              placeholderTextColor="#94A3B8"
            />
            {!!errores.fecha && <Text style={styles.errorText}>{errores.fecha}</Text>}

            <Text style={styles.label}>Hora</Text>
            <TextInput
              style={[styles.input, !!errores.hora && styles.inputError]}
              value={hora}
              onChangeText={(v) => {
                setHora(v);
                setErrores((prev) => ({ ...prev, hora: '' }));
              }}
              placeholder="10:00"
              placeholderTextColor="#94A3B8"
            />
            {!!errores.hora && <Text style={styles.errorText}>{errores.hora}</Text>}
          </>
        )}

        {/* Botones */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => navigation.goBack()}
            disabled={guardando}
          >
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSave, guardando && { opacity: 0.7 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnSaveText}>Guardar sesión</Text>
            )}
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
  emptyMsg: { color: '#94A3B8', fontSize: 13, marginBottom: 8 },
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
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
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
