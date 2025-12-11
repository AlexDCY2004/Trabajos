import {Router} from 'express';
import { 
    crearEstudiante, 
    listarEstudiantes, 
    buscarEstudianteId, 
    actualizarEstudiante, 
    eliminarEstudiante 
} from '../controllers/estudianteController.js';

const router = Router();

//Rutas para estudiantes
router.post('/', crearEstudiante);
router.get('/', listarEstudiantes);
router.get('/:id', buscarEstudianteId);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

export default router;
