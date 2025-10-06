import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

// Configura el cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ROLE_KEY
);

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader("Access-Control-Allow-Origin", "https://react-vercel-deploy-brown.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    // Autenticación con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const user = data.user;

    // Obtener rol desde la tabla "usuarios"
    const { data: usuarioData, error: userError } = await supabase
      .from("usuarios")
      .select("rol, nombre_completo, correo")
      .eq("id", user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: "Error al obtener rol del usuario" });
    }

    // Crear token personalizado
    const token = jwt.sign(
      {
        id: user.id,
        correo: usuarioData.correo,
        nombre: usuarioData.nombre_completo,
        rol: usuarioData.rol || "usuario",
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Enviar respuesta
    return res.status(200).json({
      message: "Inicio de sesión exitoso ✅",
      session: {
        access_token: token,
        user: {
          id: user.id,
          nombre_completo: usuarioData.nombre_completo,
          correo: usuarioData.correo,
          rol: usuarioData.rol,
        },
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor 😔" });
  }
}
