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
  Platform,
} from 'react-native';
import { useStore } from '../store';
import { EstadoSeguimiento } from '../types';

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

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      updateSesionSeguimiento(sesionId, {
        estado,
        autorizacionFotos,
        observaciones,
        notas,
      });
      Alert.alert('Seguimiento guardado', 'El seguimiento fue actualizado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el seguimiento.');
    } finally {
      setGuardando(false);
    }
  };

  if (!sesion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Sesion no encontrada</Text>
      </SafeAreaView>
    );
  }

  const renderContent = () => (
    <>
      {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{cliente?.nombre}</Text>
          <Text style={styles.headerSub}>{sesion.tipoSesion} · {sesion.fecha}</Text>
        </View>

        {/* Estado */}
        <Text style={styles.sectionHeader}>ESTADO</Text>
        <View style={styles.card}>
          {ESTADOS.map((e, i) => (
            <View key={e}>
              {i > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.selectRow}
                onPress={() => setEstado(e)}
                activeOpacity={0.6}
              >
                <Text style={styles.selectText}>{e}</Text>
                {estado === e && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Photo authorization */}
        <Text style={styles.sectionHeader}>AUTORIZACION</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Fotos / Video</Text>
              <Text style={styles.switchSub}>
                Autoriza material fotografico de la sesion
              </Text>
            </View>
            <Switch
              value={autorizacionFotos}
              onValueChange={setAutorizacionFotos}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Observaciones */}
        <Text style={styles.sectionHeader}>OBSERVACIONES</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            value={observaciones}
            onChangeText={setObservaciones}
            placeholder="Observaciones generales de la sesion..."
            placeholderTextColor="#C7C7CC"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Notas */}
        <Text style={styles.sectionHeader}>NOTAS DEL COACH</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.textArea, { height: 120 }]}
            value={notas}
            onChangeText={setNotas}
            placeholder="Notas privadas del coach..."
            placeholderTextColor="#C7C7CC"
            multiline
            textAlignVertical="top"
          />
        </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => navigation.goBack()}
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
          paddingBottom: 40
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
  notFound: { textAlign: 'center', marginTop: 60, color: '#8E8E93', fontSize: 17 },

  // Header
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  headerSub: { fontSize: 15, color: '#8E8E93', marginTop: 2 },

  // Section
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D6D72',
    paddingHorizontal: 36,
    paddingTop: 24,
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
    justifyContent: 'space-between',
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

  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  switchLabel: { fontSize: 17, color: '#000' },
  switchSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },

  // Text area
  textArea: {
    padding: 16,
    fontSize: 17,
    color: '#000',
    height: 100,
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
