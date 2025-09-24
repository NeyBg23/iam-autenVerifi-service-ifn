import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", // ajustar si tu Vite usa otro origen/puerto
    "https://react-vercel-deploy-brown.vercel.app" // Solo para produccion establecer el dominio de tu frontend
    
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],  //permite todas las acciones que tu frontend pueda necesitar.
  allowedHeaders: ["Content-Type","Authorization"], //permite que se envíen headers como Content-Type y Authorization.
  credentials: true //permite enviar cookies o tokens si tu backend los usa.
}));

//  Middleware para parsear JSON
app.use(express.json()); 

// Ruta pública de prueba
app.get("/", (req, res) => {    // Ruta pública de prueba
  res.send("🚀 AutenVerifi funcionando"); 
}); // Ruta pública de prueba

// Usar todas las rutas de auth
app.use("/auth", authRoutes);

// Arrancar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
