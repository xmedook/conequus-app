export type SessionStatus = 'Pendiente' | 'Firmada';
export type Modalidad = 'Presencial' | 'Virtual' | 'Híbrida';
export type TipoSesion = 'Evaluación inicial' | 'Seguimiento' | 'Cierre' | 'Emergencia';
export type EstadoSeguimiento = 'En proceso' | 'Completado' | 'Cancelado' | 'Reprogramado';

export interface Cliente {
  id: string;
  nombre: string;
  caballo: string;
  email: string;
  telefono?: string;
}

export interface Sesion {
  id: string;
  clienteId: string;
  modalidad: Modalidad;
  tipoSesion: TipoSesion;
  fecha: string; // ISO string
  hora: string;
  status: SessionStatus;
  // Seguimiento
  estado?: EstadoSeguimiento;
  autorizacionFotos?: boolean;
  observaciones?: string;
  notas?: string;
  // Firma
  firmaBase64?: string;
  pdfUri?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
}
