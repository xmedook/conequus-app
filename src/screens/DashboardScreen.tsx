import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store';
import { Sesion } from '../types';

const PRIMARY = '#0D9488';

interface Props {
  navigation: any;
}

export default function DashboardScreen({ navigation }: Props) {
  const sesiones = useStore((s) => s.sesiones);
  const clientes = useStore((s) => s.clientes);
  const logout = useStore((s) => s.logout);
  const userEmail = useStore((s) => s.auth.userEmail);

  const total = sesiones.length;
  const pendientes = sesiones.filter((s) => s.status === 'Pendiente').length;
  const realizadas = sesiones.filter((s) => s.status === 'Firmada').length;

  const getClienteNombre = (clienteId: string) => {
    const c = clientes.find((cl) => cl.id === clienteId);
    return c ? c.nombre : 'Desconocido';
  };

  const renderSesion = ({ item }: { item: Sesion }) => (
    <TouchableOpacity
      style={styles.sesionCard}
      onPress={() => navigation.navigate('DetalleSesion', { sesionId: item.id })}
    >
      <View style={styles.sesionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sesionCliente}>{getClienteNombre(item.clienteId)}</Text>
          <Text style={styles.sesionTipo}>{item.tipoSesion} · {item.modalidad}</Text>
          <Text style={styles.sesionFecha}>
            {item.fecha} a las {item.hora}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            item.status === 'Firmada' ? styles.badgeFirmada : styles.badgePendiente,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status === 'Firmada' ? styles.badgeFirmadaText : styles.badgePendienteText,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, coach 👋</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: PRIMARY }]}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
          <Text style={styles.statNum}>{pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#22C55E' }]}>
          <Text style={styles.statNum}>{realizadas}</Text>
          <Text style={styles.statLabel}>Firmadas</Text>
        </View>
      </View>

      {/* Sessions list */}
      <Text style={styles.sectionTitle}>Sesiones</Text>
      <FlatList
        data={sesiones}
        keyExtractor={(item) => item.id}
        renderItem={renderSesion}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay sesiones registradas</Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NuevaSesion')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  email: { fontSize: 12, color: '#64748B', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  sesionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sesionRow: { flexDirection: 'row', alignItems: 'center' },
  sesionCliente: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  sesionTipo: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sesionFecha: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePendiente: { backgroundColor: '#FEF3C7' },
  badgeFirmada: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgePendienteText: { color: '#92400E' },
  badgeFirmadaText: { color: '#065F46' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 30, color: '#fff', lineHeight: 34 },
});
