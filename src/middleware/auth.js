// src/middleware/auth.js

/* Middleware para verificar tokens JWT de Supabase
   Usar en rutas que requieren autenticación.
   Espera header Authorization: Bearer <access_token>
*/
import { supabaseServer } from '../sr/db/supabaseServerClient.js'; // ruta según tu estructura: sr/db...

/**
 * Middleware verificarToken
 * Espera header Authorization: Bearer <access_token>
 */
export async function verificarToken(req, res, next) {  // eslint-disable-line
  try {
    const authHeader = req.headers['authorization'] || '';   // puede ser
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;  // extraer token

    if (!token) return res.status(401).json({ error: 'Token requerido' });  // 401 No autorizado

    const { data, error } = await supabaseServer.auth.getUser(token);  // verificar token

    if (error) {
      console.warn('verificarToken: supabase auth.getUser error:', error);  // loguear error
      return res.status(403).json({ error: error.message || 'Token inválido' });  // 403 Prohibido
    }
    if (!data?.user) return res.status(403).json({ error: 'Token inválido o usuario no encontrado' });  // 403 Prohibido

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Error verificarToken:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}