import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // ajustar si tu Vite usa otro origen/puerto
}));
app.use(express.json());

// Ruta pública de prueba
//app.get("/", (req, res) => {
  //res.send("🚀 AutenVerifi funcionando");
//});

// Usar todas las rutas de auth
app.use("/auth", authRoutes);

// Arrancar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
