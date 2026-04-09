# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conequus is a React Native (Expo) application for managing equestrian coaching sessions. The app tracks clients, sessions, signatures on liability waivers ("Carta Responsiva"), and session follow-ups. It uses Supabase as the backend database and storage service.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Architecture

### Tech Stack
- **Framework**: Expo ~54.0 with React Native 0.81.5
- **Navigation**: React Navigation (Stack navigator)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL database + storage)
- **Language**: TypeScript with strict mode enabled

### Database Schema (Supabase)

The app connects to a Supabase instance with these tables:

- **clientes**: `id`, `nombre`, `email`, `telefono`
- **sesiones**: `id`, `cliente_id`, `modalidad`, `tipo_sesion`, `fecha_hora`, `estado`, `carta_responsiva_estado`, `carta_responsiva_url`, `firma_url`
- **seguimientos**: `sesion_id`, `estado`, `autoriza_fotos`, `observaciones`, `notas_progreso`

### State Management (src/store/index.ts)

Global state is managed via Zustand with the following structure:

- **Auth**: `auth.isAuthenticated`, `auth.userEmail`, `login()`, `logout()`
- **Clientes**: `clientes[]`, `fetchClientes()`, `getClienteById()`
- **Sesiones**: `sesiones[]`, `fetchSesiones()`, `crearSesion()`, `addSesion()`, `actualizarSesion()`, `updateSesionFirma()`, `getSesionById()`
- **Seguimientos**: `guardarSeguimiento()`, `updateSesionSeguimiento()`

**Key mapping functions:**
- `mapDbSesion()`: Converts database rows to app `Sesion` type
- `mapDbCliente()`: Converts database rows to app `Cliente` type

The store maintains a `_dbRow` field on sesiones for raw database access during updates.

### Navigation Structure (App.tsx)

```
Login (unauthenticated)
  └─> Dashboard (main authenticated view)
       ├─> NuevaSesion
       ├─> DetalleSesion { sesionId }
       ├─> Firma { sesionId }
       └─> Seguimiento { sesionId }
```

Navigation types are defined in `RootStackParamList`.

### Platform-Specific Components

The app uses platform-specific implementations for cross-platform compatibility:

- **SignatureCanvas.native.tsx**: Uses `react-native-signature-canvas` for iOS/Android
- **SignatureCanvas.web.tsx**: Uses `signature_pad` library for web platform

React Native automatically selects the correct file based on `.native.tsx` and `.web.tsx` extensions.

### Type System (src/types/index.ts)

Core types:
- `Cliente`: Client/rider information
- `Sesion`: Session data with status, signature, and follow-up fields
- `SessionStatus`: 'Pendiente' | 'Firmada'
- `Modalidad`: 'Presencial' | 'Virtual' | 'Híbrida'
- `TipoSesion`: 'Evaluación inicial' | 'Seguimiento' | 'Cierre' | 'Emergencia'
- `EstadoSeguimiento`: 'En proceso' | 'Completado' | 'Cancelado' | 'Reprogramado'

### Key Screens

1. **LoginScreen**: Simple email/password authentication (currently stores locally, no Supabase auth integration)
2. **DashboardScreen**: Lists all sessions with stats (Total/Pendientes/Firmadas), fetches clientes and sesiones on mount
3. **NuevaSesionScreen**: Form to create new session
4. **DetalleSesionScreen**: Shows session details with navigation to Firma and Seguimiento
5. **FirmaScreen**: Captures signature on liability waiver, generates PDF, updates session
6. **SeguimientoScreen**: Records session follow-up data

## Important Notes

### Supabase Configuration
The Supabase client is configured in [src/lib/supabase.ts](src/lib/supabase.ts) with hardcoded URL and anon key. This points to a local Supabase instance at `http://74.208.30.214:54321`.

### Data Flow Pattern
1. Screens call Zustand store actions
2. Store actions make Supabase queries
3. Store maps DB rows to app types using `mapDbSesion` / `mapDbCliente`
4. Store updates local state
5. React components re-render via Zustand subscriptions

### Session Status Mapping
- DB field `carta_responsiva_estado === 'firmada'` → App status `'Firmada'`
- Otherwise → App status `'Pendiente'`

### Signature Storage
- Signatures are stored as base64 data URLs in `firma_url` field
- PDFs are stored in Supabase storage with URLs in `carta_responsiva_url`

### Date Handling
Sessions store `fecha_hora` as ISO timestamp in DB, split into separate `fecha` (YYYY-MM-DD) and `hora` (HH:MM) strings in app state.

## Common Patterns

### Creating a new session
```typescript
const id = await useStore.getState().crearSesion({
  cliente_id: string,
  modalidad: string,
  tipo_sesion: string,
  fecha_hora: string, // ISO format: "YYYY-MM-DDTHH:MM:00"
});
```

### Updating a session
```typescript
await useStore.getState().actualizarSesion(id, {
  carta_responsiva_estado: 'firmada',
  firma_url: base64String,
  carta_responsiva_url: pdfUrl,
});
```

### Fetching data
Data is fetched in `useEffect` hooks on screen mount:
```typescript
const fetchClientes = useStore((s) => s.fetchClientes);
const fetchSesiones = useStore((s) => s.fetchSesiones);

useEffect(() => {
  fetchClientes();
  fetchSesiones();
}, []);
```
