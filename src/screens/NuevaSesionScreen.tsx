import React, { useState, useEffect } from 'react';
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
import ClientSelector from '../components/ClientSelector';

const MODALIDADES: Modalidad[] = ['Presencial', 'Virtual', 'Híbrida'];
const TIPOS: TipoSesion[] = ['Evaluación inicial', 'Seguimiento', 'Cierre', 'Emergencia'];

interface Props {
  navigation: any;
}

export default function NuevaSesionScreen({ navigation }: Props) {
  const fetchClientes = useStore((s) => s.fetchClientes);
  const crearSesion = useStore((s) => s.crearSesion);

  const [clienteId, setClienteId] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad>('Presencial');
  const [tipoSesion, setTipoSesion] = useState<TipoSesion>('Evaluación inicial');

  const now = new Date();
  const padded = (n: number) => String(n).padStart(2, '0');
  const defaultDatetime = `${now.getFullYear()}-${padded(now.getMonth() + 1)}-${padded(now.getDate())}T${padded(now.getHours())}:${padded(now.getMinutes())}`;
  const [datetimeWeb, setDatetimeWeb] = useState(defaultDatetime);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClientes();
  }, []);

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!clienteId) nuevosErrores.cliente = 'Selecciona un cliente.';
    if (Platform.OS === 'web') {
      if (!datetimeWeb) nuevosErrores.fecha = 'Selecciona fecha y hora.';
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
      const fechaHora = `${fechaFinal}T${horaFinal}:00`;
      await crearSesion({
        cliente_id: clienteId,
        modalidad,
        tipo_sesion: tipoSesion,
        fecha_hora: fechaHora,
      });

      const clientes = useStore.getState().clientes;
      const clienteNombre = clientes.find(c => c.id === clienteId)?.nombre || 'Cliente';

      Alert.alert(
        'Sesión creada exitosamente',
        `Cliente: ${clienteNombre}\nTipo: ${tipoSesion}\nModalidad: ${modalidad}\nFecha: ${fechaFinal}\nHora: ${horaFinal}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error al guardar',
        `No se pudo crear la sesión.\n\nDetalle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        [{ text: 'Cerrar' }]
      );
    } finally {
      setGuardando(false);
    }
  };

  const renderContent = () => (
    <>
      {/* Cliente */}
        <Text style={styles.sectionHeader}>CLIENTE</Text>
        <ClientSelector
          selectedClientId={clienteId}
          onSelect={(id) => {
            setClienteId(id);
            setErrores((prev) => ({ ...prev, cliente: '' }));
          }}
          error={errores.cliente}
        />

        {/* Modalidad */}
        <Text style={styles.sectionHeader}>MODALIDAD</Text>
        <View style={styles.segmentedControl}>
          {MODALIDADES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.segment,
                modalidad === m && styles.segmentActive,
              ]}
              onPress={() => setModalidad(m)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  modalidad === m && styles.segmentTextActive,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tipo */}
        <Text style={styles.sectionHeader}>TIPO DE SESION</Text>
        <View style={styles.card}>
          {TIPOS.map((t, i) => (
            <View key={t}>
              {i > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.selectRow}
                onPress={() => setTipoSesion(t)}
                activeOpacity={0.6}
              >
                <Text style={styles.selectText}>{t}</Text>
                {tipoSesion === t && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Fecha y hora */}
        <Text style={styles.sectionHeader}>FECHA Y HORA</Text>
        {Platform.OS === 'web' ? (
          <View style={styles.card}>
            <View style={styles.inputRow}>
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
                  border: 'none',
                  fontSize: 17,
                  width: '100%',
                  color: '#000',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontFamily: '-apple-system, system-ui, sans-serif',
                }}
              />
            </View>
            {!!errores.fecha && <Text style={styles.errorText}>{errores.fecha}</Text>}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Fecha</Text>
              <TextInput
                style={styles.input}
                value={fecha}
                onChangeText={(v) => {
                  setFecha(v);
                  setErrores((prev) => ({ ...prev, fecha: '' }));
                }}
                placeholder="2025-07-15"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            {!!errores.fecha && (
              <Text style={[styles.errorText, { marginLeft: 16 }]}>{errores.fecha}</Text>
            )}
            <View style={styles.separator} />
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Hora</Text>
              <TextInput
                style={styles.input}
                value={hora}
                onChangeText={(v) => {
                  setHora(v);
                  setErrores((prev) => ({ ...prev, hora: '' }));
                }}
                placeholder="10:00"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            {!!errores.hora && (
              <Text style={[styles.errorText, { marginLeft: 16 }]}>{errores.hora}</Text>
            )}
          </View>
        )}

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => navigation.goBack()}
          disabled={guardando}
          activeOpacity={0.7}
        >
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSave, guardando && { opacity: 0.6 }]}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.7}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnSaveText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  if (Platform.OS === 'web') {
    // @ts-ignore - Using native div for better web scroll
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#F2F2F7',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 100
        }}>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 40 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D6D72',
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectText: { fontSize: 17, color: '#000' },
  checkmark: { fontSize: 17, color: '#007AFF', fontWeight: '600' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
  errorText: { color: '#FF3B30', fontSize: 13, paddingHorizontal: 36, marginTop: 4 },

  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(118,118,128,0.12)',
    borderRadius: 9,
    marginHorizontal: 20,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
  segmentTextActive: { color: '#000', fontWeight: '600' },

  // Input rows
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    width: 65,
    fontSize: 17,
    color: '#000',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 30, marginHorizontal: 20 },
  btnCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  btnCancelText: { color: '#007AFF', fontWeight: '600', fontSize: 17 },
  btnSave: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  btnSaveText: { color: '#fff', fontWeight: '600', fontSize: 17 },
});
