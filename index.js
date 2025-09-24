import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", // ajustar si tu Vite usa otro origen/puerto
  "https://react-vercel-deploy-brown.vercel.app" // producción
  ],
  credentials: true
}));
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
