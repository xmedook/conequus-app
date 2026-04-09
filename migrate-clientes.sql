-- Migration: Add new fields to clientes table
-- Run this in your Supabase SQL Editor

-- Add new columns to clientes table
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS pais TEXT,
ADD COLUMN IF NOT EXISTS fecha_nacimiento TEXT,
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre TEXT,
ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono TEXT;

-- Add comment to document the migration
COMMENT ON COLUMN clientes.instagram IS 'Instagram handle of the client';
COMMENT ON COLUMN clientes.pais IS 'Country of the client';
COMMENT ON COLUMN clientes.fecha_nacimiento IS 'Birth date of the client (format: dd/mm/yyyy)';
COMMENT ON COLUMN clientes.contacto_emergencia_nombre IS 'Emergency contact name';
COMMENT ON COLUMN clientes.contacto_emergencia_telefono IS 'Emergency contact phone number';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
