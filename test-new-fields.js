// Test creating a client with all new fields
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://api-supabase.nexosrv.one';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testNewFields() {
  console.log('🔍 Testing new client fields...\n');

  // Test 1: Check current schema
  console.log('Test 1: Checking current schema...');
  const { data: existing, error: schemaError } = await supabase
    .from('clientes')
    .select('*')
    .limit(1);

  if (schemaError) {
    console.error('❌ Error fetching schema:', schemaError.message);
    return;
  }

  if (existing && existing.length > 0) {
    console.log('Current fields:', Object.keys(existing[0]).join(', '));
  }
  console.log('');

  // Test 2: Try to create a test client with new fields
  console.log('Test 2: Creating test client with new fields...');
  const testCliente = {
    nombre: 'Test Cliente',
    email: 'test@example.com',
    telefono: '+52 55 9999 9999',
    instagram: '@testuser',
    pais: 'México',
    fecha_nacimiento: '01/01/1990',
    contacto_emergencia_nombre: 'Juan Pérez',
    contacto_emergencia_telefono: '+52 55 8888 8888',
  };

  const { data: created, error: createError } = await supabase
    .from('clientes')
    .insert(testCliente)
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating client:', createError.message);
    console.log('\n⚠️  Migration needed! Run the SQL migration script in Supabase:');
    console.log('   File: migrate-clientes.sql\n');
    return;
  }

  console.log('✅ Client created successfully!');
  console.log('Created client:', created);
  console.log('');

  // Test 3: Update the test client
  console.log('Test 3: Updating client fields...');
  const { data: updated, error: updateError } = await supabase
    .from('clientes')
    .update({
      instagram: '@updated_user',
      pais: 'Argentina',
    })
    .eq('id', created.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating client:', updateError.message);
  } else {
    console.log('✅ Client updated successfully!');
    console.log('Updated instagram:', updated.instagram);
    console.log('Updated pais:', updated.pais);
  }
  console.log('');

  // Test 4: Clean up - delete test client
  console.log('Test 4: Cleaning up test data...');
  const { error: deleteError } = await supabase
    .from('clientes')
    .delete()
    .eq('id', created.id);

  if (deleteError) {
    console.error('❌ Error deleting test client:', deleteError.message);
  } else {
    console.log('✅ Test client deleted');
  }
  console.log('');

  console.log('🎉 All tests completed successfully!');
  console.log('\n✅ Your database schema supports all new fields!');
}

testNewFields();
