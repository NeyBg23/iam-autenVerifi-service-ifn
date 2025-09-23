// src/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * Middleware para verificar el token JWT
 * - Revisa si viene en el header Authorization: Bearer <token>
 * - Valida el token usando SUPABASE_JWT_SECRET
 * - Si es válido → agrega los datos del usuario a req.user
 * - Si no → devuelve error 403
 */
export function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Token requerido ❌" });
  }

  try {
    // Validamos el token con la secret de Supabase
    const secret = process.env.SUPABASE_JWT_SECRET;
    const payload = jwt.verify(token, secret);

    // Guardamos la info del usuario en req.user
    req.user = payload;
    next(); // continúa a la ruta protegida
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ❌" });
  }
}
