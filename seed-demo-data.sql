-- Script de datos de demostración para Conequus
-- Este script crea clientes y sesiones de ejemplo con variedad de estados y modalidades

-- Insertar clientes demo
INSERT INTO clientes (nombre, email, telefono) VALUES
  ('María González Martínez', 'maria.gonzalez@email.com', '55-1234-5678'),
  ('Carlos Rodríguez López', 'carlos.rodriguez@email.com', '55-2345-6789'),
  ('Ana Patricia Fernández', 'ana.fernandez@email.com', '55-3456-7890'),
  ('Roberto Sánchez Ruiz', 'roberto.sanchez@email.com', '55-4567-8901'),
  ('Laura Jiménez Castro', 'laura.jimenez@email.com', '55-5678-9012'),
  ('Diego Morales Vega', 'diego.morales@email.com', '55-6789-0123'),
  ('Carmen Ortiz Flores', 'carmen.ortiz@email.com', '55-7890-1234'),
  ('Fernando Ramírez Torres', 'fernando.ramirez@email.com', '55-8901-2345'),
  ('Patricia Herrera Silva', 'patricia.herrera@email.com', '55-9012-3456'),
  ('Miguel Ángel Castro Mendoza', 'miguel.castro@email.com', '55-0123-4567'),
  ('Daniela Vargas Reyes', 'daniela.vargas@email.com', '55-1111-2222'),
  ('Javier Mendoza Pérez', 'javier.mendoza@email.com', '55-2222-3333'),
  ('Sofía Luna Guerrero', 'sofia.luna@email.com', '55-3333-4444'),
  ('Ricardo Delgado Romero', 'ricardo.delgado@email.com', '55-4444-5555'),
  ('Valentina Cruz Navarro', 'valentina.cruz@email.com', '55-5555-6666')
ON CONFLICT (email) DO NOTHING;

-- Insertar sesiones demo con diferentes estados, modalidades y fechas
-- Nota: Usaremos NOW() y fechas relativas para tener un rango temporal realista

-- Sesiones del mes pasado (completadas)
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'maria.gonzalez@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '25 days' + TIME '10:00:00',
  'Completada',
  'firmada',
  'Primera sesión, excelente conexión con el caballo';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'carlos.rodriguez@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '23 days' + TIME '14:00:00',
  'Completada',
  'firmada',
  'Cliente experimentado, busca trabajo profundo en liderazgo';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'ana.fernandez@email.com'),
  'Híbrida',
  'Evaluación inicial',
  NOW() - INTERVAL '20 days' + TIME '16:00:00',
  'Completada',
  'firmada',
  'Sesión híbrida, parte online para preparación';

-- Sesiones de seguimiento recientes
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'maria.gonzalez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() - INTERVAL '18 days' + TIME '10:00:00',
  'Completada',
  'firmada',
  'Gran avance en autoconfianza';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'roberto.sanchez@email.com'),
  'Virtual',
  'Evaluación inicial',
  NOW() - INTERVAL '15 days' + TIME '18:00:00',
  'Completada',
  'no_aplica',
  'Sesión virtual de introducción y establecimiento de objetivos';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'laura.jimenez@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '12 days' + TIME '11:00:00',
  'Completada',
  'firmada',
  'Trabajo en gestión del estrés';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'carlos.rodriguez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() - INTERVAL '10 days' + TIME '14:00:00',
  'Completada',
  'firmada',
  'Excelente progreso en comunicación no verbal';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'diego.morales@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '8 days' + TIME '09:00:00',
  'Completada',
  'firmada',
  'Cliente corporativo, enfoque en liderazgo de equipos';

-- Sesiones de esta semana
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'carmen.ortiz@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '5 days' + TIME '10:30:00',
  'Completada',
  'firmada',
  'Primera experiencia con caballos, muy receptiva';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'maria.gonzalez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() - INTERVAL '4 days' + TIME '10:00:00',
  'Completada',
  'firmada',
  'Consolidación de aprendizajes';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'fernando.ramirez@email.com'),
  'Híbrida',
  'Evaluación inicial',
  NOW() - INTERVAL '3 days' + TIME '15:00:00',
  'Completada',
  'firmada',
  'Empresario buscando balance vida-trabajo';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'laura.jimenez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() - INTERVAL '2 days' + TIME '11:00:00',
  'Completada',
  'firmada',
  'Trabajando límites personales';

-- Sesiones de ayer y hoy (algunas pendientes de firma)
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'patricia.herrera@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() - INTERVAL '1 day' + TIME '09:30:00',
  'Completada',
  'pendiente',
  'Sesión realizada, pendiente de firma de carta responsiva';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'carlos.rodriguez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() - INTERVAL '1 day' + TIME '14:00:00',
  'Completada',
  'firmada',
  'Cuarta sesión, preparación para cierre de ciclo';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'miguel.castro@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() + TIME '10:00:00',
  'Pendiente',
  'no_aplica',
  'Sesión programada para hoy';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'daniela.vargas@email.com'),
  'Virtual',
  'Evaluación inicial',
  NOW() + TIME '17:00:00',
  'Pendiente',
  'no_aplica',
  'Sesión virtual de introducción programada';

-- Sesiones futuras (próxima semana)
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'javier.mendoza@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() + INTERVAL '2 days' + TIME '11:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'maria.gonzalez@email.com'),
  'Presencial',
  'Cierre',
  NOW() + INTERVAL '4 days' + TIME '10:00:00',
  'Pendiente',
  'no_aplica',
  'Sesión de cierre de ciclo de 4 sesiones';

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'sofia.luna@email.com'),
  'Híbrida',
  'Evaluación inicial',
  NOW() + INTERVAL '5 days' + TIME '16:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'laura.jimenez@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() + INTERVAL '6 days' + TIME '11:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'ricardo.delgado@email.com'),
  'Presencial',
  'Evaluación inicial',
  NOW() + INTERVAL '7 days' + TIME '09:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'valentina.cruz@email.com'),
  'Virtual',
  'Evaluación inicial',
  NOW() + INTERVAL '8 days' + TIME '18:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'diego.morales@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() + INTERVAL '9 days' + TIME '09:00:00',
  'Pendiente',
  'no_aplica',
  NULL;

INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'carmen.ortiz@email.com'),
  'Presencial',
  'Seguimiento',
  NOW() + INTERVAL '10 days' + TIME '10:30:00',
  'Pendiente',
  'no_aplica',
  NULL;

-- Sesión de emergencia (caso especial)
INSERT INTO sesiones (cliente_id, modalidad, tipo_sesion, fecha_hora, estado, carta_responsiva_estado, observaciones)
SELECT
  (SELECT id FROM clientes WHERE email = 'fernando.ramirez@email.com'),
  'Presencial',
  'Emergencia',
  NOW() - INTERVAL '7 days' + TIME '19:00:00',
  'Completada',
  'firmada',
  'Sesión de emergencia por situación de crisis personal';

-- Verificar resultados
SELECT 'Clientes insertados:' as info, COUNT(*) as total FROM clientes;
SELECT 'Sesiones insertadas:' as info, COUNT(*) as total FROM sesiones;
SELECT 'Sesiones por estado:' as info, carta_responsiva_estado, COUNT(*) as total
FROM sesiones
GROUP BY carta_responsiva_estado;
