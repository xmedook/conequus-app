import { create } from 'zustand';
import { AuthState, Cliente, Sesion, SessionStatus, EstadoSeguimiento } from '../types';

const MOCK_CLIENTES: Cliente[] = [
  { id: 'c1', nombre: 'Valentina Torres', caballo: 'Relámpago', email: 'valentina@example.com' },
  { id: 'c2', nombre: 'Diego Hernández', caballo: 'Luna de Plata', email: 'diego@example.com' },
  { id: 'c3', nombre: 'Sofía Ramírez', caballo: 'Viento Norte', email: 'sofia@example.com' },
];

const MOCK_SESIONES: Sesion[] = [
  {
    id: 's1',
    clienteId: 'c1',
    modalidad: 'Presencial',
    tipoSesion: 'Evaluación inicial',
    fecha: '2025-07-10',
    hora: '09:00',
    status: 'Pendiente',
    estado: 'En proceso',
    autorizacionFotos: true,
    observaciones: 'Primera sesión — buen ánimo',
    notas: 'Revisar postura en trote',
  },
  {
    id: 's2',
    clienteId: 'c2',
    modalidad: 'Virtual',
    tipoSesion: 'Seguimiento',
    fecha: '2025-07-08',
    hora: '11:00',
    status: 'Firmada',
    estado: 'Completado',
    autorizacionFotos: false,
    observaciones: 'Muy buena sesión, avance notable',
    notas: '',
    firmaBase64: 'mock_firma',
  },
  {
    id: 's3',
    clienteId: 'c3',
    modalidad: 'Híbrida',
    tipoSesion: 'Cierre',
    fecha: '2025-07-15',
    hora: '14:30',
    status: 'Pendiente',
    estado: 'Reprogramado',
    autorizacionFotos: true,
    observaciones: '',
    notas: 'Reprogramar por lluvia',
  },
];

interface AppState {
  // Auth
  auth: AuthState;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Clientes
  clientes: Cliente[];

  // Sesiones
  sesiones: Sesion[];
  addSesion: (sesion: Omit<Sesion, 'id' | 'status'>) => string;
  updateSesionStatus: (id: string, status: SessionStatus) => void;
  updateSesionFirma: (id: string, firmaBase64: string, pdfUri?: string) => void;
  updateSesionSeguimiento: (
    id: string,
    data: {
      estado?: EstadoSeguimiento;
      autorizacionFotos?: boolean;
      observaciones?: string;
      notas?: string;
    }
  ) => void;
  getSesionById: (id: string) => Sesion | undefined;
  getClienteById: (id: string) => Cliente | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  auth: { isAuthenticated: false, userEmail: null },

  login: (email: string, _password: string) => {
    // Mock auth — any credentials work
    set({ auth: { isAuthenticated: true, userEmail: email } });
    return true;
  },

  logout: () => {
    set({ auth: { isAuthenticated: false, userEmail: null } });
  },

  clientes: MOCK_CLIENTES,

  sesiones: MOCK_SESIONES,

  addSesion: (sesionData) => {
    const id = `s_${Date.now()}`;
    const newSesion: Sesion = {
      ...sesionData,
      id,
      status: 'Pendiente',
      estado: 'En proceso',
      autorizacionFotos: false,
      observaciones: '',
      notas: '',
    };
    set((state) => ({ sesiones: [newSesion, ...state.sesiones] }));
    return id;
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

  updateSesionSeguimiento: (id, data) => {
    set((state) => ({
      sesiones: state.sesiones.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  getSesionById: (id) => get().sesiones.find((s) => s.id === id),

  getClienteById: (id) => get().clientes.find((c) => c.id === id),
}));
