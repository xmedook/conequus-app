import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { EstadoSeguimiento } from '../types';

const PRIMARY = '#0D9488';
const ESTADOS: EstadoSeguimiento[] = ['En proceso', 'Completado', 'Cancelado', 'Reprogramado'];

interface Props {
  navigation: any;
  route: any;
}

export default function SeguimientoScreen({ navigation, route }: Props) {
  const { sesionId } = route.params;
  const sesion = useStore((s) => s.getSesionById(sesionId));
  const cliente = useStore((s) => (sesion ? s.getClienteById(sesion.clienteId) : undefined));
  const updateSesionSeguimiento = useStore((s) => s.updateSesionSeguimiento);

  const [estado, setEstado] = useState<EstadoSeguimiento>(
    (sesion?.estado as EstadoSeguimiento) ?? 'En proceso'
  );
  const [autorizacionFotos, setAutorizacionFotos] = useState(
    sesion?.autorizacionFotos ?? false
  );
  const [observaciones, setObservaciones] = useState(sesion?.observaciones ?? '');
  const [notas, setNotas] = useState(sesion?.notas ?? '');
  const [guardando, setGuardando] = useState(false);

  const estadoColors: Record<EstadoSeguimiento, { bg: string; text: string; border: string }> = {
    'En proceso': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    'Completado': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    'Cancelado': { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    'Reprogramado': { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      updateSesionSeguimiento(sesionId, {
        estado,
        autorizacionFotos,
        observaciones,
        notas,
      });
      Alert.alert('✅ Seguimiento guardado', 'El seguimiento fue actualizado correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el seguimiento. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (!sesion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 60, color: '#94A3B8' }}>
          Sesión no encontrada
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Seguimiento de sesión</Text>
          <Text style={styles.headerSub}>
            {cliente?.nombre} · {sesion.tipoSesion}
          </Text>
        </View>

        {/* Estado selector */}
        <Text style={styles.label}>Estado</Text>
        <View style={styles.estadosGrid}>
          {ESTADOS.map((e) => {
            const colors = estadoColors[e];
            const isActive = estado === e;
            return (
              <TouchableOpacity
                key={e}
                style={[
                  styles.estadoBtn,
                  { borderColor: colors.border },
                  isActive && { backgroundColor: colors.bg, borderWidth: 2 },
                ]}
                onPress={() => setEstado(e)}
              >
                <Text
                  style={[
                    styles.estadoText,
                    isActive ? { color: colors.text, fontWeight: '700' } : { color: '#64748B' },
                  ]}
                >
                  {e}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Autorización fotos */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Autorización de fotos / video</Text>
            <Text style={styles.switchSub}>
              El jinete autoriza material fotográfico de la sesión
            </Text>
          </View>
          <Switch
            value={autorizacionFotos}
            onValueChange={setAutorizacionFotos}
            trackColor={{ false: '#CBD5E1', true: PRIMARY }}
            thumbColor="#fff"
          />
        </View>

        {/* Observaciones */}
        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={[styles.textArea, { height: 100 }]}
          value={observaciones}
          onChangeText={setObservaciones}
          placeholder="Observaciones generales de la sesión..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
        />

        {/* Notas */}
        <Text style={styles.label}>Notas del coach</Text>
        <TextInput
          style={[styles.textArea, { height: 120 }]}
          value={notas}
          onChangeText={setNotas}
          placeholder="Notas privadas del coach..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
        />

        {/* Botones */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnGuardarText}>Guardar seguimiento</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 50 },
  headerCard: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginTop: 16,
  },
  estadosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  estadoBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  estadoText: { fontSize: 13, fontWeight: '500' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, marginRight: 10 },
  switchSub: { fontSize: 11, color: '#64748B', marginTop: 2, flex: 1 },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#fff',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 28 },
  btnCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  btnCancelarText: { color: '#64748B', fontWeight: '600' },
  btnGuardar: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
