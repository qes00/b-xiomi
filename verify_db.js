
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar .env manualmente (ya que no usamos Vite aquí)
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const url = envConfig.VITE_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY;

console.log(`Conectando a: ${url}`);

const supabase = createClient(url, key);

async function verify() {
  console.log("1. Verificando lectura (SELECT)...");
  const { data: readData, error: readError } = await supabase.from('products').select('*').limit(1);
  
  if (readError) {
    console.error("❌ Error de LECTURA:", readError.message);
  } else {
    console.log("✅ Lectura exitosa.", readData?.length, "productos encontrados.");
  }

  console.log("\n2. Verificando escritura (INSERT)...");
  const { data: writeData, error: writeError } = await supabase.from('products').insert({
    name: 'Producto Test Diagnostico',
    price: 10.00,
    description: 'Test generado por agente'
  }).select();

  if (writeError) {
    console.error("❌ Error de ESCRITURA:", writeError.message);
    console.log("\nDIAGNÓSTICO: " + writeError.message);
    if (writeError.message.includes('row-level security')) {
        console.log("⚠️  CONFIRMADO: Las políticas de seguridad (RLS) están bloqueando la creación.");
        console.log("   Necesitas ejecutar el script 'fix-rls.sql' en Supabase.");
    }
  } else {
    console.log("✅ Escritura exitosa! El producto fue creado.");
    // Limpiar
    await supabase.from('products').delete().eq('id', writeData[0].id);
  }
}

verify();
