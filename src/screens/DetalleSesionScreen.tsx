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
        <Text style={styles.notFound}>Sesion no encontrada</Text>
      </SafeAreaView>
    );
  }

  const handleCancelar = () => {
    Alert.alert('Cancelar sesion?', 'Esta accion no se puede deshacer', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Si, cancelar',
        style: 'destructive',
        onPress: () => {
          updateSesionStatus(sesionId, 'Pendiente');
          Alert.alert(
            'Sesión cancelada',
            `La sesión de ${cliente?.nombre} ha sido cancelada exitosamente.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Client header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(cliente?.nombre ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clienteNombre}>{cliente?.nombre ?? '--'}</Text>
              {cliente?.caballo ? (
                <Text style={styles.caballo}>{cliente.caballo}</Text>
              ) : null}
            </View>
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
        </View>

        {/* Info */}
        <Text style={styles.sectionHeader}>DETALLES</Text>
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
            label="Fotos autorizadas"
            value={sesion.autorizacionFotos ? 'Si' : 'No'}
            isLast
          />
        </View>

        {/* Actions */}
        <Text style={styles.sectionHeader}>ACCIONES</Text>
        <View style={styles.actionsCard}>
          {sesion.status === 'Pendiente' && (
            <>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => navigation.navigate('Firma', { sesionId })}
                activeOpacity={0.6}
              >
                <Text style={styles.actionBlue}>Firmar Carta Responsiva</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
            </>
          )}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Seguimiento', { sesionId })}
            activeOpacity={0.6}
          >
            <Text style={styles.actionBlue}>Seguimiento</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          {sesion.status === 'Firmada' && sesion.pdfUri && (
            <>
              <View style={styles.separator} />
              <View style={styles.actionRow}>
                <Text style={styles.actionGreen}>PDF generado y guardado</Text>
              </View>
            </>
          )}
        </View>

        {/* Destructive */}
        {sesion.status === 'Pendiente' && (
          <>
            <View style={{ height: 30 }} />
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleCancelar}
                activeOpacity={0.6}
              >
                <Text style={styles.actionRed}>Cancelar Sesion</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {!isLast && <View style={styles.separator} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 40 },
  notFound: { textAlign: 'center', marginTop: 60, color: '#8E8E93', fontSize: 17 },

  // Header card
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  clienteNombre: { fontSize: 20, fontWeight: '600', color: '#000' },
  caballo: { fontSize: 15, color: '#8E8E93', marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgePendiente: { backgroundColor: '#FFF3E0' },
  badgeFirmada: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgePendienteText: { color: '#E65100' },
  badgeFirmadaText: { color: '#2E7D32' },

  // Section header
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

  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 17, color: '#000' },
  infoValue: {
    fontSize: 17,
    color: '#8E8E93',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Actions
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionBlue: { fontSize: 17, color: '#007AFF' },
  actionGreen: { fontSize: 17, color: '#34C759' },
  actionRed: { fontSize: 17, color: '#FF3B30', textAlign: 'center', flex: 1 },
  chevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '300' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
});
