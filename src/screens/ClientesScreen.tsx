import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useStore } from '../store';
import { Cliente } from '../types';
import { isWeb, getMaxContentWidth, getColumnCount } from '../utils/responsive';

interface Props {
  navigation: any;
}

export default function ClientesScreen({ navigation }: Props) {
  const clientes = useStore((s) => s.clientes);
  const fetchClientes = useStore((s) => s.fetchClientes);
  const eliminarCliente = useStore((s) => s.eliminarCliente);

  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isDesktopView = isWeb && width >= 768;
  const maxWidth = getMaxContentWidth();
  const numColumns = getColumnCount();

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;
    const query = searchQuery.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.telefono && c.telefono.toLowerCase().includes(query))
    );
  }, [clientes, searchQuery]);

  const handleDelete = (cliente: Cliente) => {
    Alert.alert(
      'Eliminar Cliente',
      `Estas seguro de eliminar a ${cliente.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCliente(cliente.id);
              Alert.alert(
                'Cliente eliminado',
                `${cliente.nombre} ha sido eliminado exitosamente.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error al eliminar',
                `No se pudo eliminar a ${cliente.nombre}.\n\nDetalle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                [{ text: 'Cerrar' }]
              );
            }
          },
        },
      ]
    );
  };

  const renderCliente = ({ item, index }: { item: Cliente; index: number }) => {
    const isFirst = index === 0;
    const shouldShowSeparator = !isFirst && (isDesktopView ? index % numColumns !== 0 : true);

    return (
      <View style={[styles.clienteWrapper, isDesktopView && { width: `${100 / numColumns}%` }]}>
        {shouldShowSeparator && !isDesktopView && <View style={styles.separator} />}
        <TouchableOpacity
          style={[styles.clienteRow, isDesktopView && styles.clienteCardDesktop]}
          onPress={() => navigation.navigate('NuevoCliente', { clienteId: item.id })}
          activeOpacity={0.6}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.clienteNombre}>{item.nombre}</Text>
            <Text style={styles.clienteEmail}>{item.email}</Text>
            {item.telefono ? (
              <Text style={styles.clienteTelefono}>{item.telefono}</Text>
            ) : null}
          </View>
          {!isDesktopView && (
            <>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.chevron}>›</Text>
            </>
          )}
        </TouchableOpacity>
        {isDesktopView && (
          <View style={styles.desktopActions}>
            <TouchableOpacity
              style={styles.desktopDeleteBtn}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.desktopDeleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isDesktopView && { maxWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Search bar */}
        {isDesktopView && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar clientes..."
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.6}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Header */}
        <Text style={styles.sectionHeader}>
          {searchQuery.length > 0
            ? `${filteredClientes.length} ${filteredClientes.length === 1 ? 'resultado' : 'resultados'}`
            : 'TODOS LOS CLIENTES'}
        </Text>

        {/* Client list */}
        <FlatList
          data={filteredClientes}
          keyExtractor={(item) => item.id}
          renderItem={renderCliente}
          contentContainerStyle={[
            styles.listContainer,
            isDesktopView && styles.listContainerDesktop,
          ]}
          key={numColumns} // Force re-render when columns change
          numColumns={isDesktopView ? numColumns : 1}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No se encontraron clientes'
                : 'No hay clientes registrados'}
            </Text>
          }
        />

        {/* Bottom action */}
        <View style={[styles.bottomAction, isDesktopView && styles.bottomActionDesktop]}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('NuevoCliente')}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>Agregar Cliente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { flex: 1 },
  listContainer: { paddingBottom: 100 },
  listContainerDesktop: {
    paddingHorizontal: 10,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D6D72',
    paddingHorizontal: 36,
    paddingTop: 16,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  clienteWrapper: {
    marginBottom: 0,
  },

  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
  },

  clienteCardDesktop: {
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  clienteNombre: { fontSize: 17, fontWeight: '500', color: '#000' },
  clienteEmail: { fontSize: 14, color: '#8E8E93', marginTop: 1 },
  clienteTelefono: { fontSize: 13, color: '#AEAEB2', marginTop: 1 },
  actions: { marginRight: 8 },
  deleteText: { color: '#FF3B30', fontSize: 15 },
  chevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '300' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 88,
    marginHorizontal: 20,
  },

  // Desktop actions
  desktopActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  desktopDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  desktopDeleteText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 15 },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#F2F2F7',
  },
  bottomActionDesktop: {
    position: 'relative',
    paddingBottom: 20,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
