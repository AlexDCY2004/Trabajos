import express from "express";
import { 
    crearDocente, 
    listarDocentes, 
    obtenerDocentePorId, 
    ActualizarDocente, 
    eliminarDocente,
    asignarAsignatura,        
    desasignarAsignatura,     
    listarAsignaturasDeDocente,
    asignarAsignaturasMasivas
} from '../controllers/docenteController.js';

const router = express.Router();

// CRUD Docente
router.post("/", crearDocente);
router.get("/", listarDocentes);
router.get("/:id", obtenerDocentePorId);
router.put("/:id", ActualizarDocente);
router.delete("/:id", eliminarDocente);

// Rutas para asignaciones
router.post("/:id/asignaturas/:asignaturaId", asignarAsignatura);
router.delete("/:id/asignaturas/:asignaturaId", desasignarAsignatura);
router.post("/:id/asignaturas", asignarAsignaturasMasivas);

export default router;