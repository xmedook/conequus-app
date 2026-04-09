import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useStore } from '../store';
import { Sesion } from '../types';
import { isWeb, getMaxContentWidth } from '../utils/responsive';

interface Props {
  navigation: any;
}

export default function DashboardScreen({ navigation }: Props) {
  const sesiones = useStore((s) => s.sesiones);
  const clientes = useStore((s) => s.clientes);
  const logout = useStore((s) => s.logout);
  const userEmail = useStore((s) => s.auth.userEmail);
  const fetchClientes = useStore((s) => s.fetchClientes);
  const fetchSesiones = useStore((s) => s.fetchSesiones);

  const { width } = useWindowDimensions();
  const isDesktopView = isWeb && width >= 768;
  const maxWidth = getMaxContentWidth();

  useEffect(() => {
    fetchClientes();
    fetchSesiones();
  }, []);

  const total = sesiones.length;
  const pendientes = sesiones.filter((s) => s.status === 'Pendiente').length;
  const realizadas = sesiones.filter((s) => s.status === 'Firmada').length;

  const getClienteNombre = (clienteId: string) => {
    const c = clientes.find((cl) => cl.id === clienteId);
    return c ? c.nombre : 'Desconocido';
  };

  const renderSesion = ({ item }: { item: Sesion }) => (
    <TouchableOpacity
      style={styles.sesionRow}
      onPress={() => navigation.navigate('DetalleSesion', { sesionId: item.id })}
      activeOpacity={0.6}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.sesionCliente}>{getClienteNombre(item.clienteId)}</Text>
        <Text style={styles.sesionMeta}>
          {item.tipoSesion} · {item.modalidad}
        </Text>
        <Text style={styles.sesionFecha}>
          {item.fecha} a las {item.hora}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <View
          style={[
            styles.badge,
            item.status === 'Firmada' ? styles.badgeFirmada : styles.badgePendiente,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status === 'Firmada'
                ? styles.badgeFirmadaText
                : styles.badgePendienteText,
            ]}
          >
            {item.status}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.listSeparator} />;

  const content = (
    <>
      {/* Large title header */}
      <View style={[styles.header, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View>
          <Text style={styles.largeTitle}>Sesiones</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>
        <TouchableOpacity onPress={logout} activeOpacity={0.6}>
          <Text style={styles.logoutLink}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#FF9500' }]}>{pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#34C759' }]}>{realizadas}</Text>
          <Text style={styles.statLabel}>Firmadas</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.actionsCard, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('Clientes')}
          activeOpacity={0.6}
        >
          <Text style={styles.actionText}>Ver Clientes</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.actionSeparator} />
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('NuevaSesion')}
          activeOpacity={0.6}
        >
          <Text style={styles.actionText}>Nueva Sesion</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Section header */}
      <Text style={[styles.sectionHeader, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        RECIENTES
      </Text>

      {/* Sessions list */}
      <View style={[styles.listCard, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <FlatList
          data={sesiones}
          keyExtractor={(item) => item.id}
          renderItem={renderSesion}
          ItemSeparatorComponent={renderSeparator}
          scrollEnabled={!isDesktopView}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay sesiones registradas</Text>
          }
        />
      </View>
    </>
  );

  if (isDesktopView) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.desktopScroll}>
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  desktopScroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.4,
  },
  email: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  logoutLink: { fontSize: 17, color: '#FF3B30', fontWeight: '400' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '700', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '500' },

  // Actions card (grouped style)
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: { fontSize: 17, color: '#007AFF' },
  actionSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },

  // Section header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D6D72',
    paddingHorizontal: 36,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  // Sessions list
  listCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sesionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sesionCliente: { fontSize: 17, fontWeight: '600', color: '#000' },
  sesionMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  sesionFecha: { fontSize: 12, color: '#AEAEB2', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePendiente: { backgroundColor: '#FFF3E0' },
  badgeFirmada: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgePendienteText: { color: '#E65100' },
  badgeFirmadaText: { color: '#2E7D32' },
  chevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '300' },
  listSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
  emptyText: { textAlign: 'center', color: '#8E8E93', paddingVertical: 40, fontSize: 15 },
});
