import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useStore } from '../store';

const PRIMARY = '#0D9488';

interface Props {
  navigation: any;
  route: any;
}

export default function DetalleSesionScreen({ navigation, route }: Props) {
  const { sesionId } = route.params;
  const sesion = useStore((s) => s.getSesionById(sesionId));
  const cliente = useStore((s) => (sesion ? s.getClienteById(sesion.clienteId) : undefined));
  const updateSesionStatus = useStore((s) => s.updateSesionStatus);

  if (!sesion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Sesión no encontrada</Text>
      </SafeAreaView>
    );
  }

  const handleCancelar = () => {
    Alert.alert('¿Cancelar sesión?', 'Esta acción no se puede deshacer', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => {
          updateSesionStatus(sesionId, 'Pendiente');
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.clienteNombre}>{cliente?.nombre ?? '—'}</Text>
            <View
              style={[
                styles.badge,
                sesion.status === 'Firmada' ? styles.badgeFirmada : styles.badgePendiente,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  sesion.status === 'Firmada'
                    ? styles.badgeFirmadaText
                    : styles.badgePendienteText,
                ]}
              >
                {sesion.status}
              </Text>
            </View>
          </View>
          <Text style={styles.caballo}>🐴 {cliente?.caballo ?? '—'}</Text>
        </View>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <InfoRow label="Tipo" value={sesion.tipoSesion} />
          <InfoRow label="Modalidad" value={sesion.modalidad} />
          <InfoRow label="Fecha" value={sesion.fecha} />
          <InfoRow label="Hora" value={sesion.hora} />
          {sesion.estado && <InfoRow label="Estado" value={sesion.estado} />}
          {sesion.observaciones ? (
            <InfoRow label="Observaciones" value={sesion.observaciones} />
          ) : null}
          {sesion.notas ? <InfoRow label="Notas" value={sesion.notas} /> : null}
          <InfoRow
            label="Autorización fotos"
            value={sesion.autorizacionFotos ? 'Sí ✅' : 'No ❌'}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {sesion.status === 'Pendiente' && (
            <TouchableOpacity
              style={styles.btnFirmar}
              onPress={() => navigation.navigate('Firma', { sesionId })}
            >
              <Text style={styles.btnFirmarText}>✍️ Firmar carta responsiva</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnSeguimiento}
            onPress={() => navigation.navigate('Seguimiento', { sesionId })}
          >
            <Text style={styles.btnSeguimientoText}>📋 Seguimiento</Text>
          </TouchableOpacity>

          {sesion.status === 'Pendiente' && (
            <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
              <Text style={styles.btnCancelarText}>Cancelar sesión</Text>
            </TouchableOpacity>
          )}

          {sesion.status === 'Firmada' && sesion.pdfUri && (
            <View style={styles.pdfBadge}>
              <Text style={styles.pdfText}>📄 PDF generado y guardado</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  errorText: { textAlign: 'center', marginTop: 60, color: '#94A3B8', fontSize: 16 },
  headerCard: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clienteNombre: { fontSize: 20, fontWeight: '800', color: '#fff', flex: 1, marginRight: 8 },
  caballo: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePendiente: { backgroundColor: 'rgba(245,158,11,0.2)' },
  badgeFirmada: { backgroundColor: 'rgba(34,197,94,0.2)' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgePendienteText: { color: '#FCD34D' },
  badgeFirmadaText: { color: '#6EE7B7' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  actionsContainer: { gap: 10 },
  btnFirmar: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnFirmarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSeguimiento: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  btnSeguimientoText: { color: '#1D4ED8', fontWeight: '700', fontSize: 15 },
  btnCancelar: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  btnCancelarText: { color: '#DC2626', fontWeight: '600' },
  pdfBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pdfText: { color: '#166534', fontWeight: '600' },
});
