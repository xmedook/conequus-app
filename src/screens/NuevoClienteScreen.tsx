import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';

interface Props {
  navigation: any;
  route: {
    params?: {
      clienteId?: string;
    };
  };
}

export default function NuevoClienteScreen({ navigation, route }: Props) {
  const clienteId = route.params?.clienteId;
  const isEditing = !!clienteId;

  const crearCliente = useStore((s) => s.crearCliente);
  const actualizarCliente = useStore((s) => s.actualizarCliente);
  const getClienteById = useStore((s) => s.getClienteById);
  const sesiones = useStore((s) => s.sesiones);

  // Get sessions for this client
  const clienteSesiones = isEditing
    ? sesiones.filter(s => s.clienteId === clienteId).sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`);
        const dateB = new Date(`${b.fecha}T${b.hora}`);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      })
    : [];

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [instagram, setInstagram] = useState('');
  const [pais, setPais] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState('');
  const [contactoEmergenciaTelefono, setContactoEmergenciaTelefono] = useState('');

  useEffect(() => {
    if (isEditing && clienteId) {
      const cliente = getClienteById(clienteId);
      if (cliente) {
        setNombre(cliente.nombre);
        setEmail(cliente.email);
        setTelefono(cliente.telefono || '');
        setInstagram(cliente.instagram || '');
        setPais(cliente.pais || '');
        setFechaNacimiento(cliente.fecha_nacimiento || '');
        setContactoEmergenciaNombre(cliente.contacto_emergencia_nombre || '');
        setContactoEmergenciaTelefono(cliente.contacto_emergencia_telefono || '');
      }
    }
  }, [clienteId, isEditing]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!telefono.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return;
    }

    try {
      if (isEditing && clienteId) {
        await actualizarCliente(clienteId, {
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          instagram: instagram.trim() || undefined,
          pais: pais.trim() || undefined,
          fecha_nacimiento: fechaNacimiento.trim() || undefined,
          contacto_emergencia_nombre: contactoEmergenciaNombre.trim() || undefined,
          contacto_emergencia_telefono: contactoEmergenciaTelefono.trim() || undefined,
        });

        let detalles = `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}`;
        if (instagram) detalles += `\nInstagram: ${instagram}`;
        if (pais) detalles += `\nPaís: ${pais}`;
        if (fechaNacimiento) detalles += `\nFecha Nacimiento: ${fechaNacimiento}`;
        if (contactoEmergenciaNombre) detalles += `\nContacto Emergencia: ${contactoEmergenciaNombre}`;

        Alert.alert('Cliente actualizado exitosamente', detalles, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const id = await crearCliente({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          instagram: instagram.trim() || undefined,
          pais: pais.trim() || undefined,
          fecha_nacimiento: fechaNacimiento.trim() || undefined,
          contacto_emergencia_nombre: contactoEmergenciaNombre.trim() || undefined,
          contacto_emergencia_telefono: contactoEmergenciaTelefono.trim() || undefined,
          caballo: '',
        });

        if (id) {
          let detalles = `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}`;
          if (instagram) detalles += `\nInstagram: ${instagram}`;
          if (pais) detalles += `\nPaís: ${pais}`;
          if (fechaNacimiento) detalles += `\nFecha Nacimiento: ${fechaNacimiento}`;
          if (contactoEmergenciaNombre) detalles += `\nContacto Emergencia: ${contactoEmergenciaNombre}`;

          Alert.alert('Cliente creado exitosamente', detalles, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert('Error', 'No se pudo crear el cliente');
        }
      }
    } catch (error) {
      Alert.alert(
        'Error al guardar',
        `No se pudo ${isEditing ? 'actualizar' : 'crear'} el cliente.\n\nDetalle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        [{ text: 'Cerrar' }]
      );
    }
  };

  const renderScrollContent = () => (
    <>
      <Text style={styles.sectionHeader}>INFORMACIÓN</Text>

        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre completo"
              placeholderTextColor="#C7C7CC"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#C7C7CC"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono"
              placeholderTextColor="#C7C7CC"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="Opcional"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>País</Text>
            <TextInput
              style={styles.input}
              value={pais}
              onChangeText={setPais}
              placeholder="Opcional"
              placeholderTextColor="#C7C7CC"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nacimiento</Text>
            <TextInput
              style={styles.input}
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>CONTACTO DE EMERGENCIA</Text>

        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={contactoEmergenciaNombre}
              onChangeText={setContactoEmergenciaNombre}
              placeholder="Opcional"
              placeholderTextColor="#C7C7CC"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={contactoEmergenciaTelefono}
              onChangeText={setContactoEmergenciaTelefono}
              placeholder="Opcional"
              placeholderTextColor="#C7C7CC"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Session history - only show when editing */}
        {isEditing && clienteSesiones.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>HISTORIAL DE SESIONES</Text>
            <View style={styles.formCard}>
              {clienteSesiones.map((sesion, index) => (
                <View key={sesion.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.sesionRow}
                    onPress={() => navigation.navigate('DetalleSesion', { sesionId: sesion.id })}
                    activeOpacity={0.6}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sesionTipo}>{sesion.tipoSesion}</Text>
                      <Text style={styles.sesionMeta}>
                        {sesion.fecha} · {sesion.hora} · {sesion.modalidad}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
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
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Action button inside scroll area */}
        <View style={styles.actionButton}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>
              {isEditing ? 'Actualizar' : 'Crear Cliente'}
            </Text>
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
          {renderScrollContent()}
        </div>
      </div>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
        {renderScrollContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    width: 85,
    fontSize: 17,
    color: '#000',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },

  // Action button (inside scroll)
  actionButton: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 100,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },

  // Session history
  sesionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sesionTipo: { fontSize: 17, fontWeight: '600', color: '#000' },
  sesionMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePendiente: { backgroundColor: '#FFF3E0' },
  badgeFirmada: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgePendienteText: { color: '#E65100' },
  badgeFirmadaText: { color: '#2E7D32' },
  chevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '300' },
});
