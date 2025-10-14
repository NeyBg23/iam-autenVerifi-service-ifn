<<<<<<< HEAD
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
=======
// 🧩 Importamos la librería "jsonwebtoken"
// Esta librería sabe cómo leer y verificar los tokens JWT.
import jwt from "jsonwebtoken";

/**
 * 🎯 Este middleware se usa para proteger rutas del backend.
 * Es como un guardia que dice:
 * "Muéstrame tu token. Si es bueno, puedes pasar."
 */
export function verificarToken(req, res, next) {
  
  // 🕵️ 1️⃣ Buscamos en los headers del request la llave "Authorization"
  // Cuando alguien manda un token, lo manda así:
  // Authorization: Bearer <aquí va el token>
  const authHeader = req.headers["authorization"];

  // 🔍 2️⃣ Si existe el header, separamos el texto y nos quedamos solo con el token
  // Ejemplo: "Bearer abc.123.xyz" → nos quedamos con "abc.123.xyz"
  const token = authHeader && authHeader.split(" ")[1];

  // 🚫 3️⃣ Si no hay token, detenemos todo y devolvemos un error
  if (!token) {
    // 401 = No autorizado (no mandó el token)
    return res.status(401).json({ error: "Token requerido ❌" });
>>>>>>> parent of d21dfa6 (auht)
  }

  try {
    // 🔐 4️⃣ Aquí tomamos la llave secreta que tenemos guardada en las variables de entorno
    // Supabase usa esta clave para firmar los tokens que nos da cuando alguien inicia sesión
    const secret = process.env.SUPABASE_JWT_SECRET;

    // 🧮 5️⃣ Verificamos el token con esa clave secreta
    // Si el token fue creado con esa clave → es válido ✅
    // Si alguien lo inventó o cambió algo → da error ❌
    const payload = jwt.verify(token, secret);

    // 💾 6️⃣ Guardamos dentro del request (req.user) los datos del usuario que venían en el token
    // Así, las rutas que usen este middleware pueden saber quién es el usuario que hizo la petición
    req.user = payload;

    // 🟢 7️⃣ Si todo salió bien, dejamos que siga hacia la ruta que pidió el usuario
    next();
  } catch (error) {
    // ⚠️ 8️⃣ Si el token no es válido o está vencido → devolvemos error
    // 403 = Prohibido (el token está mal)
    return res.status(403).json({ error: "Token inválido ❌" });
  }
}
