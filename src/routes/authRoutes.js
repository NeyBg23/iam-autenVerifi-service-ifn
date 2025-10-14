<<<<<<< HEAD
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
=======
// 🚪 Importamos Router de Express
// ---------------------------------------------------------
// Express tiene una función llamada Router() que nos deja
// crear “mini rutas” separadas para organizar mejor el código.
// Aquí vamos a crear las rutas relacionadas con la autenticación (login).
import { Router } from "express";

// 🔐 Importamos la librería jsonwebtoken
// ---------------------------------------------------------
// Esta librería nos permite crear y verificar “tokens JWT”.
// Un JWT es como una “tarjeta mágica” que prueba quién eres.
// La app lo usa para saber si tienes permiso de entrar.
import jwt from "jsonwebtoken";

// 🧠 Importamos el cliente de Supabase
// ---------------------------------------------------------
// Supabase nos deja conectarnos con nuestra base de datos y
// usar su sistema de autenticación.
import { supabaseServer } from "../db/supabaseServerClient.js";

// 🚗 Creamos el enrutador (como un mini servidor dentro del servidor)
const router = Router();


// 🚀 RUTA DE LOGIN (inicio de sesión)
// ---------------------------------------------------------
// Esta ruta recibe el email y la contraseña del usuario.
// Si todo está bien, genera un token con su información (rol, nombre, etc.) 
// y se lo devuelve al frontend.

router.get("/verify", (req, res) => {  // Ruta para verificar el token
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token requerido" });

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    return res.json({ valido: true, usuario: decoded });
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
});


// Este es el post para registrar nuevos usuarios, y sera llamado desde el backend de brigadas.

router.post("/registrar", async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    const { data, error } = await supabaseServer.auth.admin.createUser({
      email: correo,
      password: contraseña,
    });

    if (error) {
      if (error.status === 400 && /already exists|duplicate/i.test(error.message || "")) {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
      return res.status(409).json({ error: error.message });
    }

    return res.json({ mensaje: data });

  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

router.post("/login", async (req, res) => {
  try {
    // 📥 1️⃣ Leemos los datos que nos envía el usuario desde el frontend
    const { email, password } = req.body;

    // 🧩 2️⃣ Validamos que sí haya mandado ambos campos
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    // 🔑 3️⃣ Hacemos login con Supabase Auth
    // ---------------------------------------------------------
    // Aquí Supabase revisa si ese correo y contraseña existen.
    // Si el usuario existe → devuelve su info y un token (de Supabase)
    // Si no existe → devuelve un error.
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: email.trim().toLowerCase(), // limpiamos espacios y minúsculas
      password,
>>>>>>> parent of d21dfa6 (auht)
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

<<<<<<< HEAD
    if (insertError) {
      console.error('Error insertando usuario:', insertError);
      await supabaseServer.auth.admin.deleteUser(userId).catch((delErr) => {
        console.error('Error eliminando usuario tras fallo de insert:', delErr);
      });
      return res.status(500).json({ error: 'Error guardando usuario' });
    }

    const { error: resetError } = await supabaseServer.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: RESET_PASSWORD_REDIRECT_TO,
=======
    // ❌ Si Supabase dice que no hay coincidencia, avisamos al usuario
    if (error) return res.status(401).json({ error: error.message });

    // ✅ Si el login fue exitoso, guardamos el usuario que Supabase nos devolvió
    const user = data.user;

    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo,
      },
      process.env.SUPABASE_JWT_SECRET, // clave secreta que solo el servidor conoce
      { expiresIn: "1d" } // ⏳ el token dura 1 día
    );

    // 🎁 6️⃣ Devolvemos una respuesta al frontend con toda la información
    // ---------------------------------------------------------
    // Enviamos:
    // - Un mensaje
    // - Una “session” que incluye el token (access_token)
    //   y los datos del usuario logueado.
    return res.json({
      message: "Inicio de sesión exitoso ✅",
      session: {
        access_token: token, // este token lo guardará el frontend en localStorage
        user: {
          id: user.id,
          correo: user.correo,
        },
      },
>>>>>>> parent of d21dfa6 (auht)
    });

    if (resetError) {
      console.error('Error solicitando email de reset:', resetError);
      return res.status(500).json({ error: 'Error enviando email de restablecimiento' });
    }

    return res.status(201).json({ success: true });
  } catch (err) {
<<<<<<< HEAD
    console.error('Error /registrar:', err);
    return res.status(500).json({ error: 'Error interno' });
=======
    // 🧯 Si algo sale mal, capturamos el error y lo mostramos en consola
    console.error(err);

    // Respondemos al frontend con un mensaje de error genérico
    return res.status(500).json({ error: "Error en el servidor 😔" });
>>>>>>> parent of d21dfa6 (auht)
  }
});

// 🚀 Exportamos el router
// ---------------------------------------------------------
// Esto permite que en el archivo principal (app.js o index.js)
// podamos usar todas las rutas de autenticación con:
// app.use("/auth", router)
export default router;
