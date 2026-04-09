import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthState, Cliente, Sesion, SessionStatus, EstadoSeguimiento } from '../types';

interface AppState {
  // Auth
  auth: AuthState;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Clientes
  clientes: Cliente[];
  fetchClientes: () => Promise<void>;
  crearCliente: (cliente: Omit<Cliente, 'id'>) => Promise<string>;
  actualizarCliente: (id: string, updates: Partial<Omit<Cliente, 'id'>>) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;

  // Sesiones
  sesiones: Sesion[];
  fetchSesiones: () => Promise<void>;
  addSesion: (sesion: Omit<Sesion, 'id' | 'status'>) => Promise<string>;
  crearSesion: (sesion: {
    cliente_id: string;
    modalidad: string;
    tipo_sesion: string;
    fecha_hora: string;
  }) => Promise<string>;
  updateSesionStatus: (id: string, status: SessionStatus) => void;
  updateSesionFirma: (id: string, firmaBase64: string, pdfUri?: string) => void;
  actualizarSesion: (id: string, updates: Record<string, any>) => Promise<void>;
  updateSesionSeguimiento: (
    id: string,
    data: {
      estado?: EstadoSeguimiento;
      autorizacionFotos?: boolean;
      observaciones?: string;
      notas?: string;
    }
  ) => void;
  guardarSeguimiento: (seguimiento: {
    sesion_id: string;
    estado?: string;
    autoriza_fotos?: boolean;
    observaciones?: string;
    notas_progreso?: string;
  }) => Promise<void>;
  getSesionById: (id: string) => Sesion | undefined;
  getClienteById: (id: string) => Cliente | undefined;
}

// Map DB row -> Sesion type
function mapDbSesion(row: any): Sesion {
  const fechaHora = row.fecha_hora ? new Date(row.fecha_hora) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fecha = `${fechaHora.getFullYear()}-${pad(fechaHora.getMonth() + 1)}-${pad(fechaHora.getDate())}`;
  const hora = `${pad(fechaHora.getHours())}:${pad(fechaHora.getMinutes())}`;

  const status: SessionStatus =
    row.carta_responsiva_estado === 'firmada' ? 'Firmada' : 'Pendiente';

  return {
    id: row.id,
    clienteId: row.cliente_id ?? '',
    modalidad: row.modalidad as any,
    tipoSesion: row.tipo_sesion as any,
    fecha,
    hora,
    status,
    estado: row.estado as EstadoSeguimiento,
    autorizacionFotos: false,
    observaciones: '',
    notas: '',
    firmaBase64: row.firma_url ?? undefined,
    pdfUri: row.carta_responsiva_url ?? undefined,
    // keep raw DB fields for Supabase ops
    _dbRow: row,
  } as Sesion & { _dbRow: any };
}

// Map DB row -> Cliente type
function mapDbCliente(row: any): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    caballo: '', // DB doesn't have caballo field
    email: row.email,
    telefono: row.telefono,
    instagram: row.instagram,
    pais: row.pais,
    fecha_nacimiento: row.fecha_nacimiento,
    contacto_emergencia_nombre: row.contacto_emergencia_nombre,
    contacto_emergencia_telefono: row.contacto_emergencia_telefono,
  };
}

export const useStore = create<AppState>((set, get) => ({
  auth: { isAuthenticated: false, userEmail: null },

  login: (email: string, _password: string) => {
    set({ auth: { isAuthenticated: true, userEmail: email } });
    return true;
  },

  logout: () => {
    set({ auth: { isAuthenticated: false, userEmail: null } });
  },

  clientes: [],

  fetchClientes: async () => {
    const { data, error } = await supabase.from('clientes').select('*').order('nombre');
    if (error) {
      console.error('fetchClientes error:', error);
      return;
    }
    if (data) set({ clientes: data.map(mapDbCliente) });
  },

  crearCliente: async (cliente) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono || null,
        instagram: cliente.instagram || null,
        pais: cliente.pais || null,
        fecha_nacimiento: cliente.fecha_nacimiento || null,
        contacto_emergencia_nombre: cliente.contacto_emergencia_nombre || null,
        contacto_emergencia_telefono: cliente.contacto_emergencia_telefono || null,
      })
      .select()
      .single();
    if (error) {
      console.error('crearCliente error:', error);
      return '';
    }
    if (data) {
      const mapped = mapDbCliente(data);
      set((state) => ({ clientes: [...state.clientes, mapped].sort((a, b) => a.nombre.localeCompare(b.nombre)) }));
      return data.id;
    }
    return '';
  },

  actualizarCliente: async (id, updates) => {
    const dbUpdates: any = {};
    if (updates.nombre !== undefined) dbUpdates.nombre = updates.nombre;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.telefono !== undefined) dbUpdates.telefono = updates.telefono || null;
    if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram || null;
    if (updates.pais !== undefined) dbUpdates.pais = updates.pais || null;
    if (updates.fecha_nacimiento !== undefined) dbUpdates.fecha_nacimiento = updates.fecha_nacimiento || null;
    if (updates.contacto_emergencia_nombre !== undefined) dbUpdates.contacto_emergencia_nombre = updates.contacto_emergencia_nombre || null;
    if (updates.contacto_emergencia_telefono !== undefined) dbUpdates.contacto_emergencia_telefono = updates.contacto_emergencia_telefono || null;

    const { error } = await supabase.from('clientes').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('actualizarCliente error:', error);
      return;
    }
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    }));
  },

  eliminarCliente: async (id) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) {
      console.error('eliminarCliente error:', error);
      return;
    }
    set((state) => ({
      clientes: state.clientes.filter((c) => c.id !== id),
    }));
  },

  sesiones: [],

  fetchSesiones: async () => {
    const { data, error } = await supabase
      .from('sesiones')
      .select('*, clientes(*)')
      .order('fecha_hora', { ascending: false });
    if (error) {
      console.error('fetchSesiones error:', error);
      return;
    }
    if (data) set({ sesiones: data.map(mapDbSesion) });
  },

  // Legacy local-only addSesion kept for compatibility — now calls crearSesion
  addSesion: async (sesionData) => {
    const { fecha, hora, clienteId, modalidad, tipoSesion } = sesionData as any;
    const fechaHora = `${fecha}T${hora}:00`;
    return get().crearSesion({
      cliente_id: clienteId,
      modalidad,
      tipo_sesion: tipoSesion,
      fecha_hora: fechaHora,
    });
  },

  crearSesion: async (sesion) => {
    const { data, error } = await supabase
      .from('sesiones')
      .insert(sesion)
      .select()
      .single();
    if (error) {
      console.error('crearSesion error:', error);
      return '';
    }
    if (data) {
      const mapped = mapDbSesion(data);
      set((state) => ({ sesiones: [mapped, ...state.sesiones] }));
      return data.id;
    }
    return '';
  },

  updateSesionStatus: (id, status) => {
    set((state) => ({
      sesiones: state.sesiones.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
  },

  updateSesionFirma: (id, firmaBase64, pdfUri) => {
    set((state) => ({
      sesiones: state.sesiones.map((s) =>
        s.id === id ? { ...s, firmaBase64, pdfUri, status: 'Firmada' } : s
      ),
    }));
  },

  actualizarSesion: async (id, updates) => {
    const { error } = await supabase.from('sesiones').update(updates).eq('id', id);
    if (error) {
      console.error('actualizarSesion error:', error);
      return;
    }
    set((state) => ({
      sesiones: state.sesiones.map((s) =>
        s.id === id ? { ...s, ...updates, status: updates.carta_responsiva_estado === 'firmada' ? 'Firmada' : s.status } : s
      ),
    }));
  },

  updateSesionSeguimiento: (id, data) => {
    set((state) => ({
      sesiones: state.sesiones.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  guardarSeguimiento: async (seguimiento) => {
    const { error } = await supabase.from('seguimientos').insert(seguimiento);
    if (error) {
      console.error('guardarSeguimiento error:', error);
    }
  },

  getSesionById: (id) => get().sesiones.find((s) => s.id === id),

  getClienteById: (id) => get().clientes.find((c) => c.id === id),
}));
