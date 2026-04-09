import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useStore } from '../store';
import { Cliente } from '../types';

interface ClientSelectorProps {
  selectedClientId?: string;
  onSelect: (clienteId: string) => void;
  error?: string;
}

export default function ClientSelector({
  selectedClientId,
  onSelect,
  error,
}: ClientSelectorProps) {
  const clientes = useStore((s) => s.clientes);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCliente = clientes.find((c) => c.id === selectedClientId);

  // Filter clients based on search query
  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;

    const query = searchQuery.toLowerCase();
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.telefono && c.telefono.toLowerCase().includes(query))
    );
  }, [clientes, searchQuery]);

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente.id);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderCliente = ({ item, index }: { item: Cliente; index: number }) => (
    <View>
      {index > 0 && <View style={styles.separator} />}
      <TouchableOpacity
        style={styles.clienteRow}
        onPress={() => handleSelect(item)}
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
        </View>
        {selectedClientId === item.id && (
          <Text style={styles.checkmark}>✓</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, error && styles.selectorError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.6}
      >
        <View style={{ flex: 1 }}>
          {selectedCliente ? (
            <>
              <Text style={styles.selectedName}>{selectedCliente.nombre}</Text>
              <Text style={styles.selectedEmail}>{selectedCliente.email}</Text>
            </>
          ) : (
            <Text style={styles.placeholder}>Seleccionar cliente</Text>
          )}
        </View>
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.closeButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIconInside}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre, email o teléfono"
              placeholderTextColor="#8E8E93"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
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

          {/* Results count */}
          {searchQuery.length > 0 && (
            <Text style={styles.resultsCount}>
              {filteredClientes.length} {filteredClientes.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          )}

          {/* Client list */}
          {filteredClientes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? 'No se encontraron clientes'
                  : 'No hay clientes registrados'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClientes}
              keyExtractor={(item) => item.id}
              renderItem={renderCliente}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectorError: {
    borderColor: '#FF3B30',
  },
  selectedName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  selectedEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 17,
    color: '#8E8E93',
  },
  searchIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    paddingHorizontal: 36,
    marginTop: 4,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 17,
    color: '#007AFF',
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIconInside: {
    fontSize: 16,
    marginRight: 8,
  },
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
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  resultsCount: {
    fontSize: 13,
    color: '#6D6D72',
    paddingHorizontal: 36,
    marginBottom: 8,
  },

  // Client list
  listContent: {
    paddingBottom: 20,
  },
  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
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
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  clienteNombre: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  clienteEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 1,
  },
  checkmark: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    fontSize: 22,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 88,
    marginHorizontal: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
