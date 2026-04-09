/**
 * Script para poblar la base de datos con datos de prueba
 *
 * Para ejecutar:
 * npx ts-node scripts/seed-data.ts
 *
 * O desde el código de la app, importar y llamar seedData()
 */

import { supabase } from '../src/lib/supabase';

const clientes = [
  {
    nombre: 'María García',
    email: 'maria.garcia@example.com',
    telefono: '+52 55 1234 5678',
    instagram: '@maria_coaching',
    pais: 'México',
    fecha_nacimiento: '15/03/1985',
    contacto_emergencia_nombre: 'Carlos García',
    contacto_emergencia_telefono: '+52 55 8765 4321',
    caballo: 'Luna',
  },
  {
    nombre: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    telefono: '+52 33 2345 6789',
    instagram: '@ana_ecuestre',
    pais: 'México',
    fecha_nacimiento: '22/07/1990',
    contacto_emergencia_nombre: 'Roberto Martínez',
    contacto_emergencia_telefono: '+52 33 9876 5432',
    caballo: 'Trueno',
  },
  {
    nombre: 'Sofía López',
    email: 'sofia.lopez@example.com',
    telefono: '+52 81 3456 7890',
    instagram: '@sofia_horses',
    pais: 'México',
    fecha_nacimiento: '10/11/1988',
    contacto_emergencia_nombre: 'Laura López',
    contacto_emergencia_telefono: '+52 81 0987 6543',
    caballo: 'Centella',
  },
  {
    nombre: 'Isabella Rossi',
    email: 'isabella.rossi@example.com',
    telefono: '+1 305 456 7890',
    instagram: '@bella_riding',
    pais: 'Estados Unidos',
    fecha_nacimiento: '05/09/1992',
    contacto_emergencia_nombre: 'Marco Rossi',
    contacto_emergencia_telefono: '+1 305 098 7654',
    caballo: 'Shadow',
  },
  {
    nombre: 'Carmen Fernández',
    email: 'carmen.fernandez@example.com',
    telefono: '+34 91 567 8901',
    instagram: '@carmen_ecuestre',
    pais: 'España',
    fecha_nacimiento: '18/04/1987',
    contacto_emergencia_nombre: 'Miguel Fernández',
    contacto_emergencia_telefono: '+34 91 109 8765',
    caballo: 'Estrella',
  },
];

export async function seedData() {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // 1. Crear clientes
    console.log('📝 Creando clientes...');
    const clientesCreados = [];

    for (const cliente of clientes) {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();

      if (error) {
        console.error(`Error creando cliente ${cliente.nombre}:`, error);
        continue;
      }

      console.log(`✅ Cliente creado: ${cliente.nombre}`);
      clientesCreados.push(data);
    }

    // 2. Crear sesiones para cada cliente
    console.log('\n📅 Creando sesiones...');

    const tiposSesion = ['Evaluación inicial', 'Seguimiento', 'Cierre', 'Emergencia'];
    const modalidades = ['Presencial', 'Virtual', 'Híbrida'];
    const estados = ['En proceso', 'Completado', 'Cancelado'];

    for (const cliente of clientesCreados) {
      // Crear 3-5 sesiones por cliente
      const numSesiones = Math.floor(Math.random() * 3) + 3; // 3-5 sesiones

      for (let i = 0; i < numSesiones; i++) {
        // Generar fecha aleatoria en los últimos 60 días
        const diasAtras = Math.floor(Math.random() * 60);
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - diasAtras);

        const hora = `${String(Math.floor(Math.random() * 8) + 9).padStart(2, '0')}:00`; // 9:00 - 16:00

        const sesion = {
          cliente_id: cliente.id,
          tipo_sesion: i === 0 ? 'Evaluación inicial' : tiposSesion[Math.floor(Math.random() * tiposSesion.length)],
          modalidad: modalidades[Math.floor(Math.random() * modalidades.length)],
          fecha_hora: `${fecha.toISOString().split('T')[0]}T${hora}:00`,
          status: Math.random() > 0.3 ? 'Firmada' : 'Pendiente',
          estado: estados[Math.floor(Math.random() * estados.length)],
          autorizacion_fotos: Math.random() > 0.5,
          observaciones: Math.random() > 0.5 ? 'Sesión muy productiva. El cliente mostró gran avance.' : null,
          notas: Math.random() > 0.7 ? 'Notas privadas del coach sobre la sesión.' : null,
        };

        const { error } = await supabase
          .from('sesiones')
          .insert([sesion]);

        if (error) {
          console.error(`Error creando sesión para ${cliente.nombre}:`, error);
          continue;
        }

        console.log(`  ✅ Sesión creada para ${cliente.nombre}: ${sesion.tipo_sesion} - ${fecha.toISOString().split('T')[0]}`);
      }
    }

    console.log('\n✨ Seed completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   ${clientesCreados.length} clientes creados`);
    console.log(`   ~${clientesCreados.length * 4} sesiones creadas`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('\n🎉 Proceso completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}
