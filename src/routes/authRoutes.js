// authRouter.js
import express, { Router } from "express";
import { supabaseServer } from "../db/supabaseServerClient.js";

const router = Router();

router.use(express.json());  // Middleware para parsear JSON data // habilita lectura de req.body en peticiones JSON. 
router.use(express.urlencoded({ extended: true }));     // Middleware para parsear URL-encoded data // permite leer formularios también (por compatibilidad).

// Verificar token: usamos el método getUser del SDK con el access token enviado por el cliente
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token requerido" });

    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(403).json({ error: error?.message || "Token inválido" });
    }

    return res.json({ valido: true, usuario: data.user });
  } catch (err) {
    console.error("Error verify:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Registrar usuario (server-side provisioning)
// Útil si otro servicio/proceso crea usuarios. Para signups desde el cliente
// es preferible usar el flujo cliente de Supabase (signUp).
router.post('/registrar', async (req, res) => {
  try {
    const { correo, contrasea, password } = req.body
    
    if (!correo || (!contrasea && !password)) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' })
    }
    
    // ✅ VALIDAR DOMINIO PERMITIDO
    const dominiosPermitidos = ['udi.edu.co', 'gmail.com', 'hotmail.com']
    const dominioCorreo = correo.toLowerCase().split('@')[1]
    
    if (!dominiosPermitidos.includes(dominioCorreo)) {
      return res.status(403).json({ error: 'User not allowed' })
    }
    
    const passFinal = password || contrasea
    
    // ✅ Crear en Supabase Auth
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email: correo.trim().toLowerCase(),
      password: passFinal
    })
    
    if (error) {
      if (/already exists|duplicate/i.test(error.message)) {
        return res.status(409).json({ error: 'El correo ya está registrado' })
      }
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(201).json({
      message: 'Usuario creado en Auth',
      user: { id: data.user.id, email: data.user.email }
    })
    
  } catch (err) {
    console.error('Error registrar:', err)
    return res.status(500).json({ error: 'Error en el servidor' })
  }
})


// Login: devolvemos la session que genera Supabase (access_token + refresh_token)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // data.session contiene access_token y refresh_token; devolvemos esto al cliente
    return res.json({
      message: "Inicio de sesión exitoso",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    console.error("Error login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;