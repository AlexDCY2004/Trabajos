//librerias necesarias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { dbConnect, sequelize } from './src/config/database.js';
//import estudianteRoutes from './routes/estudianteRoute.js';
import estudianteRoutes from './src/routes/estudianteRoute.js';
import notaRoute from './src/routes/notaRoute.js';
import asignaturaRoute from './src/routes/asignaturaRoute.js';
import docenteRoute from './src/routes/docenteRoutes.js';
import cursoRoute from './src/routes/cursoRoute.js';

//inicializar la app
const app = express();
app.use(cors());
app.use(express.json());

// Log simple de peticiones (incluye body para ayudar a depurar PUT/POST)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.method !== 'GET') console.log('Body:', req.body);
    next();
});

//rutas
// Ruta raíz simple para evitar "Cannot GET /"
app.get('/', (req, res) => {
    res.send('API gestion-notas-orm funcionando. Usa /api/estudiantes/');
});

app.use('/api/estudiantes', estudianteRoutes); 
app.use('/api/notas', notaRoute);
app.use('/api/asignaturas', asignaturaRoute);
app.use('/api/docentes', docenteRoute);
app.use('/api/cursos', cursoRoute);


//conexion a la base de datos
dbConnect();
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
});

//puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
