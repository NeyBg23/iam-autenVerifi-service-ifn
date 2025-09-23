// src/routes/authroutes.js
import { Router } from "express";
import { verificarToken } from "../middleware/auth.js";
import { supabaseServer } from "../lib/supabaseServerClient.js";

const router = Router();

/**
 * 📌 POST /auth/login
 * 
 * Flujo:
 * 1. Recibe email y contraseña desde el frontend (Login.jsx).
 * 2. Llama a Supabase (con supabaseServer) para validar credenciales.
 * 3. Si es válido → devuelve la sesión con el access_token (JWT).
 * 4. Si no → responde con error 400 o 401.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que vengan credenciales
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    // Llamada a Supabase para autenticar
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    // Si falla la autenticación
    if (error) return res.status(401).json({ error: error.message });

    // Devuelve la sesión completa (incluye access_token)
    return res.json({ session: data.session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * 📌 GET /auth/perfil
 * 
 * Flujo:
 * 1. Requiere que el cliente envíe `Authorization: Bearer <token>`.
 * 2. El middleware verificarToken valida el JWT usando SUPABASE_JWT_SECRET.
 * 3. Si es válido → devuelve info básica del usuario.
 * 4. Si no → devuelve error 403.
 */
router.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Accediste al perfil protegido ✅",
    usuario: req.user, // viene del JWT validado en el middleware
  });
});

export default router;
