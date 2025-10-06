import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
// ✅ Configurar CORS
const corsOptions = {
  origin: [
    "http://localhost:5173", // desarrollo local
    "https://react-vercel-deploy-brown.vercel.app" // producción
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ Middleware global para asegurar headers CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://react-vercel-deploy-brown.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ Manejo explícito de preflight OPTIONS
app.options("*", cors(corsOptions));
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


