//librerias necesarias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { dbConnect, sequelize } from './src/config/database.js';
//import estudianteRoutes from './routes/estudianteRoute.js';
import estudianteRoutes from './src/routes/estudianteRoute.js';
import notaRoute from './src/routes/notaRoute.js';
import asignaturaRoute from './src/routes/asignaturaRoute.js';
import docenteRoute from './src/routes/docenteRoutes.js';
import cursoRoute from './src/routes/cursoRoute.js';
import authRoute from './src/routes/authRoute.js';
import dashboardRoute from './src/routes/dashboardRoute.js';
import uploadRoute from './src/routes/uploadRoute.js';
import consultaRoute from './src/routes/consultaRoute.js';
import { Usuario } from './src/models/usuario.js';

//inicializar la app
const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde public/
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/api/auth', authRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/consultas', consultaRoute);


dbConnect();
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
    // Seed de usuarios por defecto
    (async () => {
        try {
            // Verificar y crear usuario admin
            const admin = await Usuario.findOne({ where: { username: 'admin' } });
            if (!admin) {
                await Usuario.create({
                    username: 'admin',
                    password: 'admin123',
                    email: 'admin@escuela.com',
                    rol: 'admin',
                    estado: 'activo'
                });
                console.log('✓ Usuario admin creado (admin / admin123)');
            }

            // Verificar y crear usuario docente
            const docente = await Usuario.findOne({ where: { username: 'docente_martinez' } });
            if (!docente) {
                await Usuario.create({
                    username: 'docente_martinez',
                    password: 'docente123',
                    email: 'martinez@escuela.com',
                    rol: 'docente',
                    estado: 'activo'
                });
                console.log('✓ Usuario docente creado (docente_martinez / docente123)');
            }

            // Verificar y crear usuario estudiante
            const estudiante = await Usuario.findOne({ where: { username: 'estudiante_juan' } });
            if (!estudiante) {
                await Usuario.create({
                    username: 'estudiante_juan',
                    password: 'estudiante123',
                    email: 'juan.perez@escuela.com',
                    rol: 'estudiante',
                    estado: 'activo'
                });
                console.log('✓ Usuario estudiante creado (estudiante_juan / estudiante123)');
            }
            
            console.log('✓ Usuarios por defecto verificados');
        } catch (e) {
            console.error('Error al crear usuarios por defecto:', e.message);
        }
    })();
}).catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
});

//puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});