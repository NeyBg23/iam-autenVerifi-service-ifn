// src/lib/supabaseServerClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * 📌 Cliente de Supabase para el backend (autenVerifi).
 * - Usa la Service Role Key porque este microservicio es de confianza.
 * - Permite validar credenciales, crear usuarios, etc.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("❌ Faltan variables SUPABASE_URL o SUPABASE_ROLE_KEY en .env");
}

// Creamos el cliente de Supabase para el servidor
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
// Ahora puedes usar `supabaseServer` en tu backend para operaciones administrativas
// como crear usuarios, validar tokens, etc.
