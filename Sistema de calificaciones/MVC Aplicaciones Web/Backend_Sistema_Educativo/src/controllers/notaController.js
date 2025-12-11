import { Nota } from "../models/nota.js";
import { Estudiante } from "../models/estudiante.js";
import { Asignatura } from "../models/asignatura.js";

// función enRango: valida que una nota sea número entre 0 y 20
const enRango = (n) => {
	return typeof n === "number" && !Number.isNaN(n) && n >= 0 && n <= 20;
};

// Listar todas las notas incluyendo datos básicos del estudiante
export const listarNotas = async (req, res) => {
	try {
		const notas = await Nota.findAll({
			include: [{ model: Estudiante }, { model: Asignatura }]
		});
		return res.json(notas);
	} catch (error) {
		console.error("listarNotas error:", error);
		return res.status(500).json({ error: "Error al obtener notas" });
	}
};

// Obtener una nota por ID
export const obtenerNotaPorId = async (req, res) => {
	try {
		const { id } = req.params;
		const nota = await Nota.findByPk(id, {
			include: [{ model: Estudiante }, { model: Asignatura }]
		});
		if (!nota) return res.status(404).json({ error: "Nota no encontrada" });
		return res.json(nota);
	} catch (error) {
		console.error("Obtener nota por ID error:", error);
		return res.status(500).json({ error: "Error al obtener la nota" });
	}
};

// Crear una nueva nota
const calcularPromedioYCategoria = (n1, n2, n3) => {
	const promedio = Number(((n1 + n2 + n3) / 3).toFixed(2));
	const categoria = promedio > 14 ? "Aprobado" : "Reprobado";
	return { promedio, categoria };
};

export const crearNota = async (req, res) => {
	try {
		const { asignaturaId, nota1, nota2, nota3, promedio, categoria, estudianteId } = req.body;
		// Validaciones básicas
		if (!asignaturaId || nota1 == null || nota2 == null || nota3 == null || !estudianteId) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}
		// Verificar estudiante
		const estudiante = await Estudiante.findByPk(estudianteId);
		if (!estudiante) return res.status(400).json({ error: "Estudiante no existe" });

		// Verificar asignatura
		const asignatura = await Asignatura.findByPk(asignaturaId);
		if (!asignatura) return res.status(400).json({ error: "Asignatura no existe" });

		// Validar que las notas estén en rango 0-20
		if ([nota1, nota2, nota3].every((n) => n !== undefined)) {
			if (![nota1, nota2, nota3].every(enRango)) {
				return res.status(400).json({ mensaje: "Las notas deben estar entre 0 y 20." });
			}
		}

		// Calcular promedio y categoria si no vienen
		let prom = promedio;
		let cat = categoria;
		if (prom == null || cat == null) {
			const calc = calcularPromedioYCategoria(Number(nota1), Number(nota2), Number(nota3));
			prom = calc.promedio;
			cat = calc.categoria;
		}

		const nuevaNota = await Nota.create({
			asignaturaId,
			nota1: Number(nota1),
			nota2: Number(nota2),
			nota3: Number(nota3),
			promedio: prom,
			categoria: cat,
			estudianteId
		});
		return res.status(201).json(nuevaNota);
	} catch (error) {
		console.error("crearNota error:", error);
		return res.status(500).json({ error: "Error al crear la nota" });
	}
};


// calcularPromedio: devuelve promedio de tres notas redondeado a 2 decimales
const calcularPromedio = (n1, n2, n3) => {
	return Number(((Number(n1) + Number(n2) + Number(n3)) / 3).toFixed(2));
};

// categoriaPorPromedio: determina categoría según promedio (misma regla que crearNota)
const categoriaPorPromedio = (prom) => {
	return prom >= 14 ? "Aprobado" : "Reprobado";
};

// Actualizar una nota
export const actualizarNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id);
    if (!nota) return res.status(404).json({ mensaje: "No existe" });

    // Permitir actualizar cualquier campo; si vienen las 3 notas, recalculamos.
    const { nota1, nota2, nota3 } = req.body;
    let payload = { ...req.body };

    if ([nota1, nota2, nota3].every((n) => n !== undefined)) {
      if (![nota1, nota2, nota3].every(enRango)) {
        return res.status(400).json({ mensaje: "Las notas deben estar entre 0 y 20." });
      }
      const promedio = calcularPromedio(nota1, nota2, nota3);
      const categoria = categoriaPorPromedio(promedio);
      payload.promedio = promedio;
      payload.categoria = categoria;
    }

    await nota.update(payload);
    res.json(nota);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


// Eliminar una nota
export const eliminarNota = async (req, res) => {
	try {
		const { id } = req.params;
		const nota = await Nota.findByPk(id);
		if (!nota) return res.status(404).json({ error: "Nota no encontrada" });
		await nota.destroy();
		return res.json({ ok: true, msg: "Nota eliminada" });
	} catch (error) {
		console.error("eliminarNota error:", error);
		return res.status(500).json({ error: "Error al eliminar la nota" });
	}
};
