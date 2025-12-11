//rutas de notas
import {Router} from 'express';
import {
	crearNota,
	listarNotas,
	obtenerNotaPorId,
	actualizarNota,
	eliminarNota
} from "../controllers/notaController.js";

const router = Router();

//Rutas para estudiantes
router.post('/', crearNota);
router.get('/', listarNotas);
router.get('/:id', obtenerNotaPorId);
router.put('/:id', actualizarNota);
router.delete('/:id', eliminarNota);

export default router;
