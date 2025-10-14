// src/routes/authRoutes.js

/* Rutas de autenticación
   - Registro de usuarios (admin crea usuario con password temporal)
   - Otras rutas auth si se necesitan
*/
import express from 'express';
import { supabaseServer } from '../sr/db/supabaseServerClient.js'; // ruta al cliente central
  
// Crear router de Express    
const router = express.Router();
const RESET_PASSWORD_REDIRECT_TO = process.env.RESET_PASSWORD_REDIRECT_TO;
 // Ruta POST /registrar  
router.post('/registrar', async (req, res) => {
  const { email, nombre, cedula, ...rest } = req.body;
  if (!email) return res.status(400).json({ error: 'email requerido' });
  // Validar otros campos si es necesario
  try {
    const tempPassword = Math.random().toString(36).slice(2, 12);
    const { data: createData, error: createError } = await supabaseServer.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
    });
    // Si hay error o no se creó el usuario
    if (createError || !createData?.user) {
      console.error('Error creando usuario:', createError);
      return res.status(500).json({ error: 'Error creando usuario' });
    }
    const userId = createData.user.id;
    // Insertar datos adicionales en tabla 'usuarios'   
    const usuarioRow = { id: userId, email: email.trim().toLowerCase(), nombre, cedula, ...rest };
    const { error: insertError } = await supabaseServer.from('usuarios').insert([usuarioRow]);

    if (insertError) {
      console.error('Error insertando usuario:', insertError);
      await supabaseServer.auth.admin.deleteUser(userId).catch((delErr) => {
        console.error('Error eliminando usuario tras fallo de insert:', delErr);
      });
      return res.status(500).json({ error: 'Error guardando usuario' });
    }

    const { error: resetError } = await supabaseServer.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: RESET_PASSWORD_REDIRECT_TO,
    });

    if (resetError) {
      console.error('Error solicitando email de reset:', resetError);
      return res.status(500).json({ error: 'Error enviando email de restablecimiento' });
    }

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error /registrar:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;