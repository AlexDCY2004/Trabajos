import { Estudiante } from "../models/estudiante.js";
import { Docente } from "../models/docente.js";
import { Asignatura } from "../models/asignatura.js";
import { Curso } from "../models/curso.js";
import { Nota } from "../models/nota.js";

// Devuelve conteos básicos para el panel de inicio
export const obtenerResumenDashboard = async (_req, res) => {
  try {
    const [estudiantesActivos, docentes, asignaturas, cursosActivos, notasRegistradas] = await Promise.all([
      Estudiante.count({ where: { estado: "activo" } }),
      Docente.count(),
      Asignatura.count(),
      Curso.count({ where: { estado: "activo" } }),
      Nota.count(),
    ]);

    res.json({
      estudiantesActivos,
      docentes,
      asignaturas,
      cursosActivos,
      notasRegistradas,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el resumen", error: error.message });
  }
};