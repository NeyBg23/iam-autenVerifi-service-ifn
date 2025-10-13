// verificarToken.js
import { supabaseServer } from "../db/supabaseServerClient.js";

/**
 * Middleware para proteger rutas.
 * Espera Authorization: Bearer <access_token> (token de Supabase).
 */
export async function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token requerido ❌" });
    }

    // Validamos el access token usando el SDK server-side
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(403).json({ error: error?.message || "Token inválido ❌" });
    }

    // Adjuntamos el usuario verificado en req.user
    req.user = data.user;
    next();
  } catch (err) {
    console.error("Error verificarToken:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}