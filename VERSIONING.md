# Control de Versiones - Conequus App

## Sistema de Versionado

La app utiliza **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** (0.x.x): Cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (x.x.1): Correcciones de bugs compatibles con versiones anteriores

### Versión Actual: 0.1.0

Estamos en fase **0.x.x** (pre-release/POC), lo que significa que la API puede cambiar en cualquier momento.

## Build Info

Cada build incluye información automática de Git:

- **Commit Hash**: Hash corto del commit (primeros 7 caracteres)
- **Branch**: Rama de Git donde se hizo el build
- **Build Date**: Fecha y hora del build

Esta información se muestra en el footer de la aplicación.

## Scripts de Build

```bash
# Generar build-info.json manualmente
npm run prebuild

# Build para Web (incluye prebuild automáticamente)
npm run build:web

# Build para Android (incluye prebuild automáticamente)
npm run build:android

# Build para iOS (incluye prebuild automáticamente)
npm run build:ios
```

## Proceso para Actualizar Versión

1. **Determinar el tipo de cambio**:
   - Bug fix → incrementar PATCH (0.1.0 → 0.1.1)
   - Nueva feature → incrementar MINOR (0.1.0 → 0.2.0)
   - Breaking change → incrementar MAJOR (0.1.0 → 1.0.0)

2. **Actualizar en 3 lugares**:
   ```bash
   # 1. package.json
   "version": "0.2.0"

   # 2. app.json
   "version": "0.2.0"

   # 3. Commit
   git commit -m "chore: bump version to 0.2.0"
   ```

3. **Crear tag de Git** (opcional pero recomendado):
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

## Verificar Versión en la App

La versión actual se muestra en el footer del Dashboard:

```
Conequus v0.1.0 • Build 18bda56 • 10 abr 2026
Web
```

Formato:
- **v0.1.0**: Versión de app.json
- **Build 18bda56**: Hash corto del commit de Git
- **10 abr 2026**: Fecha del build
- **Web/iOS/Android**: Plataforma

## Changelog

Mantener un CHANGELOG.md con los cambios por versión (recomendado):

```markdown
# Changelog

## [0.1.0] - 2026-04-10

### Added
- Sistema de versiones con build info
- Footer con información de build y commit hash
- Scripts de prebuild automático

### Fixed
- Espaciado dinámico en formularios usando useSafeAreaInsets()
- Scroll vertical en web para FirmaScreen

### Changed
- Actualizado branding a "Coaching Cuántico Asistido con Caballos"
```

## Archivos Importantes

- `package.json`: Versión de NPM
- `app.json`: Versión de Expo/App stores
- `build-info.json`: Generado automáticamente (NO commitear)
- `scripts/generate-build-info.js`: Script de generación
- `src/components/AppFooter.tsx`: Componente que muestra la versión
