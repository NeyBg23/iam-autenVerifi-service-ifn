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
    });

    // ❌ Si Supabase dice que no hay coincidencia, avisamos al usuario
    if (error) return res.status(401).json({ error: error.message });

    // ✅ Si el login fue exitoso, guardamos el usuario que Supabase nos devolvió
    const user = data.user;

    // 👀 4️⃣ Buscamos el rol de este usuario en la tabla "usuarios"
    // ---------------------------------------------------------
    // Supabase Auth guarda al usuario en su sistema interno, pero nuestro
    // proyecto también tiene una tabla personalizada llamada "usuarios"
    // donde está su “rol” (admin, brigadista, etc).
    // Aquí buscamos ese rol según el ID del usuario.
    const { data: usuarioData, error: userError } = await supabaseServer
      .from("usuarios") // tabla personalizada
      .select("rol, nombre_completo, correo") // campos que queremos
      .eq("id", user.id) // buscamos por ID del usuario autenticado
      .single(); // esperamos solo un resultado

    // ⚠️ Si algo falla al traer el rol, mostramos un error
    if (userError) {
      console.error("Error trayendo rol:", userError);
      return res.status(500).json({ error: "Error al obtener rol del usuario" });
    }

    // 🪪 5️⃣ Creamos nuestro propio JWT personalizado
    // ---------------------------------------------------------
    // Ahora hacemos un NUEVO token JWT que incluye más información:
    // - id (identificador del usuario)
    // - correo
    // - nombre completo
    // - rol (admin, brigadista, etc.)
    //
    // Este token lo firmamos con nuestra clave secreta SUPABASE_JWT_SECRET.
    // Esa clave está guardada en las variables de entorno (.env).
    const token = jwt.sign(
      {
        id: user.id,
        correo: usuarioData.correo,
        nombre: usuarioData.nombre_completo,
        rol: usuarioData.rol || "usuario", // si no tiene rol, le damos “usuario” por defecto
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
          nombre_completo: usuarioData.nombre_completo,
          correo: usuarioData.correo,
          rol: usuarioData.rol,
        },
      },
    });
  } catch (err) {
    // 🧯 Si algo sale mal, capturamos el error y lo mostramos en consola
    console.error(err);

    // Respondemos al frontend con un mensaje de error genérico
    return res.status(500).json({ error: "Error en el servidor 😔" });
  }
});

// 🚀 Exportamos el router
// ---------------------------------------------------------
// Esto permite que en el archivo principal (app.js o index.js)
// podamos usar todas las rutas de autenticación con:
// app.use("/auth", router)
export default router;
