import { Nota } from "../models/nota.js";
import { Estudiante } from "../models/estudiante.js";
import { Asignatura } from "../models/asignatura.js";
import { Docente } from "../models/docente.js";
import { Op } from "sequelize";
import PDFDocument from "pdfkit";
import XLSX from "xlsx";

const enRango = (n) => {
    return typeof n === "number" && !isNaN(n) && n >= 0 && n <= 20;
};

// Calcular nota final de un parcial
const calcularNotaFinalParcial = (tarea, informe, leccion, examen) => {
    return parseFloat((
        parseFloat(tarea) * 0.20 +
        parseFloat(informe) * 0.20 +
        parseFloat(leccion) * 0.20 +
        parseFloat(examen) * 0.40
    ).toFixed(2));
};

// ============================================
// CRUD BÁSICO DE NOTAS
// ============================================

// Listar todas las notas con filtros opcionales
export const listarNotas = async (req, res) => {
    try {
        const { estudianteId, docenteId, asignaturaId, parcial, estado, ordenar } = req.query;
        
        // Construir filtros dinámicos
        const filtros = {};
        if (estudianteId) filtros.estudianteId = estudianteId;
        if (docenteId) filtros.docenteId = docenteId;
        if (asignaturaId) filtros.asignaturaId = asignaturaId;
        if (parcial) filtros.parcial = parcial;
        if (estado) filtros.estado = estado;
        
        // Configurar ordenamiento
        let orden = [['fecha', 'DESC']]; // Por defecto: más recientes primero
        if (ordenar === 'mayor') orden = [['notaFinal', 'DESC']];
        if (ordenar === 'menor') orden = [['notaFinal', 'ASC']];
        
        const notas = await Nota.findAll({
            where: filtros,
            include: [
                { model: Estudiante, attributes: ['id', 'nombre', 'cedula', 'cursoId'] },
                { model: Asignatura, attributes: ['id', 'nombre'] },
                { model: Docente, attributes: ['id', 'nombre', 'cedula'] }
            ],
            order: orden
        });
        
        return res.json(notas);
    } catch (error) {
        console.error("Error al listar notas:", error);
        return res.status(500).json({ error: "Error al obtener notas" });
    }
};

// Obtener una nota por ID
export const obtenerNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id, {
            include: [
                { model: Estudiante },
                { model: Asignatura },
                { model: Docente }
            ]
        });
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        return res.json(nota);
    } catch (error) {
        console.error("Error al obtener nota:", error);
        return res.status(500).json({ error: "Error al obtener la nota" });
    }
};

// Crear una nueva nota
export const crearNota = async (req, res) => {
    try {
        const { 
            estudianteId, 
            asignaturaId, 
            docenteId, 
            parcial, 
            tarea, 
            informe, 
            leccion, 
            examen,
            observaciones,
            tipoEvaluacion,
            fechaEvaluacion
        } = req.body;
        
        // Validaciones básicas
        if (!estudianteId || !asignaturaId || !parcial || 
            tarea == null || informe == null || leccion == null || examen == null) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: estudianteId, asignaturaId, parcial, tarea, informe, leccion, examen" 
            });
        }
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(400).json({ error: "El estudiante no existe" });
        }
        
        // Verificar que la asignatura existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) {
            return res.status(400).json({ error: "La asignatura no existe" });
        }
        
        // Validar parcial
        if (![1, 2, 3].includes(parseInt(parcial))) {
            return res.status(400).json({ error: "El parcial debe ser 1, 2 o 3" });
        }

        // Validar docente (ahora requerido en UI)
        if (!docenteId) {
            return res.status(400).json({ error: "El docente es obligatorio" });
        }

        const docente = await Docente.findByPk(docenteId);
        if (!docente) {
            return res.status(400).json({ error: "El docente no existe" });
        }
        
        // Validar que las notas estén en rango 0-20
        const notas = [tarea, informe, leccion, examen].map(n => parseFloat(n));
        if (!notas.every(enRango)) {
            return res.status(400).json({ 
                error: "Todas las notas deben estar entre 0 y 20" 
            });
        }
        
        // Verificar si ya existe una nota para este estudiante, asignatura y parcial
        const notaExistente = await Nota.findOne({
            where: { estudianteId, asignaturaId, parcial }
        });
        
        if (notaExistente) {
            return res.status(400).json({ 
                error: `Ya existe una nota registrada para el parcial ${parcial} de esta asignatura` 
            });
        }
        
        // Crear la nota (el hook calculará notaFinal y estado automáticamente)
        const nuevaNota = await Nota.create({
            estudianteId,
            asignaturaId,
            docenteId,
            parcial: parseInt(parcial),
            tarea: parseFloat(tarea),
            informe: parseFloat(informe),
            leccion: parseFloat(leccion),
            examen: parseFloat(examen),
            observaciones,
            tipoEvaluacion: tipoEvaluacion || 'examen',
            fechaEvaluacion: fechaEvaluacion || new Date(),
            docenteModifico: docenteId
        });
        
        // Obtener la nota completa con relaciones
        const notaCompleta = await Nota.findByPk(nuevaNota.id, {
            include: [
                { model: Estudiante, attributes: ['id', 'nombre', 'cedula'] },
                { model: Asignatura, attributes: ['id', 'nombre'] },
                { model: Docente, attributes: ['id', 'nombre', 'cedula'] }
            ]
        });
        
        return res.status(201).json(notaCompleta);
    } catch (error) {
        console.error("Error al crear nota:", error);
        return res.status(500).json({ error: "Error al crear la nota: " + error.message });
    }
};

// Actualizar una nota
export const actualizarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id);
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        const { 
            tarea, informe, leccion, examen, 
            observaciones, docenteId, 
            tipoEvaluacion, fechaEvaluacion 
        } = req.body;
        
        // Preparar datos para actualizar
        const datosActualizar = {};
        
        if (tarea !== undefined) {
            if (!enRango(parseFloat(tarea))) {
                return res.status(400).json({ error: "La tarea debe estar entre 0 y 20" });
            }
            datosActualizar.tarea = parseFloat(tarea);
        }
        
        if (informe !== undefined) {
            if (!enRango(parseFloat(informe))) {
                return res.status(400).json({ error: "El informe debe estar entre 0 y 20" });
            }
            datosActualizar.informe = parseFloat(informe);
        }
        
        if (leccion !== undefined) {
            if (!enRango(parseFloat(leccion))) {
                return res.status(400).json({ error: "La lección debe estar entre 0 y 20" });
            }
            datosActualizar.leccion = parseFloat(leccion);
        }
        
        if (examen !== undefined) {
            if (!enRango(parseFloat(examen))) {
                return res.status(400).json({ error: "El examen debe estar entre 0 y 20" });
            }
            datosActualizar.examen = parseFloat(examen);
        }
        
        if (observaciones !== undefined) {
            datosActualizar.observaciones = observaciones;
        }
        
        if (docenteId !== undefined) {
            const docente = await Docente.findByPk(docenteId);
            if (!docente) {
                return res.status(400).json({ error: "El docente no existe" });
            }
            datosActualizar.docenteId = docenteId;
        }

        // Campos de auditoría
        if (tipoEvaluacion !== undefined) {
            datosActualizar.tipoEvaluacion = tipoEvaluacion;
        }

        if (fechaEvaluacion !== undefined) {
            datosActualizar.fechaEvaluacion = fechaEvaluacion;
        }

        // Registrar quién modificó y cuándo
        datosActualizar.docenteModifico = docenteId || nota.docenteId;
        datosActualizar.fechaModificacion = new Date();
        
        // Actualizar (el hook recalculará notaFinal y estado si cambió alguna nota)
        await nota.update(datosActualizar);
        
        // Obtener nota actualizada con relaciones
        const notaActualizada = await Nota.findByPk(id, {
            include: [
                { model: Estudiante, attributes: ['id', 'nombre', 'cedula'] },
                { model: Asignatura, attributes: ['id', 'nombre'] },
                { model: Docente, attributes: ['id', 'nombre', 'cedula'] }
            ]
        });
        
        return res.json(notaActualizada);
    } catch (error) {
        console.error("Error al actualizar nota:", error);
        return res.status(500).json({ error: "Error al actualizar la nota: " + error.message });
    }
};

// Eliminar una nota (eliminación física - puedes cambiar a lógica si prefieres)
export const eliminarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id);
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        await nota.destroy();
        
        return res.json({ 
            ok: true, 
            mensaje: "Nota eliminada correctamente" 
        });
    } catch (error) {
        console.error("Error al eliminar nota:", error);
        return res.status(500).json({ error: "Error al eliminar la nota" });
    }
};

// ============================================
// ENDPOINTS ESPECIALES PARA ESTADO ACADÉMICO
// ============================================

// Obtener todas las notas de un estudiante agrupadas por asignatura
export const obtenerNotasEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        // Obtener todas las notas del estudiante
        const notas = await Nota.findAll({
            where: { estudianteId },
            include: [
                { model: Asignatura, attributes: ['id', 'nombre'] }
            ],
            order: [['asignaturaId', 'ASC'], ['parcial', 'ASC']]
        });
        
        // Agrupar por asignatura
        const notasPorAsignatura = {};
        
        notas.forEach(nota => {
            const asignaturaId = nota.asignaturaId;
            const asignaturaNombre = nota.Asignatura?.nombre || 'Sin asignatura';
            
            if (!notasPorAsignatura[asignaturaId]) {
                notasPorAsignatura[asignaturaId] = {
                    asignaturaId,
                    asignaturaNombre,
                    parciales: {}
                };
            }
            
            notasPorAsignatura[asignaturaId].parciales[nota.parcial] = {
                id: nota.id,
                parcial: nota.parcial,
                tarea: nota.tarea,
                informe: nota.informe,
                leccion: nota.leccion,
                examen: nota.examen,
                notaFinal: nota.notaFinal,
                estado: nota.estado,
                fecha: nota.fecha,
                observaciones: nota.observaciones
            };
        });
        
        return res.json({
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                cedula: estudiante.cedula,
                cursoId: estudiante.cursoId
            },
            asignaturas: Object.values(notasPorAsignatura)
        });
    } catch (error) {
        console.error("Error al obtener notas del estudiante:", error);
        return res.status(500).json({ error: "Error al obtener las notas del estudiante" });
    }
};

// Obtener estado académico completo de un estudiante por asignatura
export const obtenerEstadoAcademico = async (req, res) => {
    try {
        const { estudianteId, asignaturaId } = req.params;
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        // Verificar que la asignatura existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) {
            return res.status(404).json({ error: "Asignatura no encontrada" });
        }
        
        // Obtener las notas de los 3 parciales
        const notas = await Nota.findAll({
            where: { estudianteId, asignaturaId },
            order: [['parcial', 'ASC']]
        });

        // Organizar notas por parcial
        const parciales = { 1: null, 2: null, 3: null };
        notas.forEach(nota => {
            parciales[nota.parcial] = {
                tarea: nota.tarea,
                informe: nota.informe,
                leccion: nota.leccion,
                examen: nota.examen,
                notaFinal: nota.notaFinal,
                estado: nota.estado
            };
        });

        // Calcular totales
        const notaParcial1 = parciales[1]?.notaFinal || 0;
        const notaParcial2 = parciales[2]?.notaFinal || 0;
        const notaParcial3 = parciales[3]?.notaFinal || 0;

        const sumaParcial1y2 = notaParcial1 + notaParcial2;
        const totalSemestre = notaParcial1 + notaParcial2 + notaParcial3; // suma de los 3 parciales
        const promedioFinal = parseFloat((totalSemestre / 3).toFixed(2)); // promedio de los 3 parciales
        const UMBRAL_APROBACION_SEMESTRE = 42.10;

        // Determinar estado académico
        let estadoSemestre = 'pendiente';
        let mensajeEstado = '';

        if (parciales[1] && parciales[2]) {
            if (sumaParcial1y2 < 28) {
                estadoSemestre = 'reprobado_anticipado';
                mensajeEstado = 'Reprobado anticipadamente. La suma del Parcial 1 y Parcial 2 es menor a 28 puntos.';
            } else if (!parciales[3]) {
                estadoSemestre = 'pendiente';
                mensajeEstado = 'Pendiente del Parcial 3 para evaluar el semestre.';
            } else {
                if (totalSemestre >= UMBRAL_APROBACION_SEMESTRE) {
                    estadoSemestre = 'aprobado';
                    mensajeEstado = 'Aprobó el semestre';
                } else {
                    estadoSemestre = 'reprobado';
                    mensajeEstado = 'Reprobó el semestre';
                }
            }
        } else {
            estadoSemestre = 'pendiente';
            mensajeEstado = 'Pendiente de completar Parcial 1 y Parcial 2.';
        }

        return res.json({
            estudiante: { id: estudiante.id, nombre: estudiante.nombre, cedula: estudiante.cedula },
            asignatura: { id: asignatura.id, nombre: asignatura.nombre },
            parciales,
            resumen: {
                notaParcial1,
                notaParcial2,
                notaParcial3,
                sumaParcial1y2,
                suma3Parciales: totalSemestre, // nuevo nombre
                promedioFinal,                  // nuevo campo
                estadoSemestre,
                mensajeEstado
            }
        });
    } catch (error) {
        console.error("Error al obtener estado académico:", error);
        return res.status(500).json({ error: "Error al obtener el estado académico" });
    }
};

// Exportar notas a Excel
export const exportarNotasExcel = async (req, res) => {
    try {
        const { estudianteId, docenteId, asignaturaId, parcial, estado, ordenar } = req.query;

        const filtros = {};
        if (estudianteId) filtros.estudianteId = estudianteId;
        if (docenteId) filtros.docenteId = docenteId;
        if (asignaturaId) filtros.asignaturaId = asignaturaId;
        if (parcial) filtros.parcial = parcial;
        if (estado) filtros.estado = estado;

        let orden = [["fecha", "DESC"]];
        if (ordenar === "mayor") orden = [["notaFinal", "DESC"]];
        if (ordenar === "menor") orden = [["notaFinal", "ASC"]];

        const notas = await Nota.findAll({
            where: filtros,
            include: [
                { model: Estudiante, attributes: ["id", "nombre", "cedula"] },
                { model: Asignatura, attributes: ["id", "nombre"] },
                { model: Docente, attributes: ["id", "nombre", "cedula"] }
            ],
            order: orden
        });

        const rows = notas.map((n) => ({
            ID: n.id,
            Estudiante: n.Estudiante?.nombre || "",
            Cedula: n.Estudiante?.cedula || "",
            Asignatura: n.Asignatura?.nombre || "",
            Docente: n.Docente?.nombre || "",
            Parcial: n.parcial,
            Tarea: n.tarea,
            Informe: n.informe,
            Leccion: n.leccion,
            Examen: n.examen,
            NotaFinal: n.notaFinal,
            Estado: n.estado,
            Fecha: n.fecha ? new Date(n.fecha).toISOString().split("T")[0] : ""
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Notas");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=notas.xlsx");
        res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        console.error("Error al exportar notas a Excel:", error);
        res.status(500).json({ error: "Error al exportar notas a Excel" });
    }
};

// Exportar notas a PDF
export const exportarNotasPDF = async (req, res) => {
    try {
        const { estudianteId, docenteId, asignaturaId, parcial, estado, ordenar } = req.query;

        const filtros = {};
        if (estudianteId) filtros.estudianteId = estudianteId;
        if (docenteId) filtros.docenteId = docenteId;
        if (asignaturaId) filtros.asignaturaId = asignaturaId;
        if (parcial) filtros.parcial = parcial;
        if (estado) filtros.estado = estado;

        let orden = [["estudianteId", "ASC"], ["asignaturaId", "ASC"], ["parcial", "ASC"]];
        if (ordenar === "mayor") orden = [["notaFinal", "DESC"]];
        if (ordenar === "menor") orden = [["notaFinal", "ASC"]];

        const notas = await Nota.findAll({
            where: filtros,
            include: [
                { model: Estudiante, attributes: ["id", "nombre", "cedula", "cursoId"] },
                { model: Asignatura, attributes: ["id", "nombre"] },
                { model: Docente, attributes: ["id", "nombre", "cedula"] }
            ],
            order: orden
        });

        res.setHeader("Content-Disposition", "attachment; filename=reporte-notas.pdf");
        res.type("application/pdf");

        const doc = new PDFDocument({ margin: 40, size: "A4" });
        doc.pipe(res);

        // Título
        doc.fontSize(18).fillColor("#0d6efd").text("Reporte de Notas - Sistema Académico", { align: "center" });
        doc.moveDown();
        doc.fontSize(10).fillColor("#000").text(`Fecha: ${new Date().toLocaleDateString()} | Total registros: ${notas.length}`, { align: "center" });
        doc.moveDown(2);

        // Agrupar notas por estudiante y asignatura
        const porEstudiante = {};
        notas.forEach(nota => {
            const estId = nota.estudianteId;
            if (!porEstudiante[estId]) {
                porEstudiante[estId] = {
                    estudiante: nota.Estudiante,
                    asignaturas: {}
                };
            }
            const asigId = nota.asignaturaId;
            if (!porEstudiante[estId].asignaturas[asigId]) {
                porEstudiante[estId].asignaturas[asigId] = {
                    asignatura: nota.Asignatura,
                    parciales: {}
                };
            }
            porEstudiante[estId].asignaturas[asigId].parciales[nota.parcial] = nota;
        });

        // Generar PDF por cada estudiante
        Object.values(porEstudiante).forEach((data, estudianteIdx) => {
            if (estudianteIdx > 0) doc.addPage();

            const est = data.estudiante;
            // Header del estudiante
            doc.fontSize(14).fillColor("#0d6efd").text(`Estudiante: ${est?.nombre || "N/A"}`, { underline: true });
            doc.fontSize(10).fillColor("#000").text(`Cédula: ${est?.cedula || "N/A"} | Curso: ${est?.cursoId || "N/A"}`);
            doc.moveDown(1.5);

            // Por cada asignatura
            Object.values(data.asignaturas).forEach((asigData) => {
                const asig = asigData.asignatura;
                doc.fontSize(12).fillColor("#198754").text(`Asignatura: ${asig?.nombre || "N/A"}`, { underline: false });
                doc.moveDown(0.5);

                // Tabla de parciales
                const startX = 40;
                let startY = doc.y;
                const rowHeight = 20;
                const colWidths = [60, 50, 50, 50, 50, 60, 60];

                // Encabezados
                doc.fontSize(9).fillColor("#fff");
                doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#6c757d");
                doc.fillColor("#fff").text("Parcial", startX + 5, startY + 5, { width: colWidths[0], align: "left" });
                doc.text("Tarea", startX + colWidths[0] + 5, startY + 5, { width: colWidths[1], align: "center" });
                doc.text("Informe", startX + colWidths[0] + colWidths[1] + 5, startY + 5, { width: colWidths[2], align: "center" });
                doc.text("Lección", startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, startY + 5, { width: colWidths[3], align: "center" });
                doc.text("Examen", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, startY + 5, { width: colWidths[4], align: "center" });
                doc.text("Nota Final", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5, startY + 5, { width: colWidths[5], align: "center" });
                doc.text("Estado", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 5, startY + 5, { width: colWidths[6], align: "center" });

                startY += rowHeight;

                // Filas de parciales
                [1, 2, 3].forEach((numParcial, idx) => {
                    const nota = asigData.parciales[numParcial];
                    const bgColor = idx % 2 === 0 ? "#f8f9fa" : "#ffffff";
                    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
                    doc.fillColor("#000").fontSize(8);
                    doc.text(`Parcial ${numParcial}`, startX + 5, startY + 5, { width: colWidths[0], align: "left" });
                    doc.text(nota?.tarea?.toString() || "-", startX + colWidths[0] + 5, startY + 5, { width: colWidths[1], align: "center" });
                    doc.text(nota?.informe?.toString() || "-", startX + colWidths[0] + colWidths[1] + 5, startY + 5, { width: colWidths[2], align: "center" });
                    doc.text(nota?.leccion?.toString() || "-", startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, startY + 5, { width: colWidths[3], align: "center" });
                    doc.text(nota?.examen?.toString() || "-", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, startY + 5, { width: colWidths[4], align: "center" });
                    doc.text(nota?.notaFinal?.toString() || "-", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 5, startY + 5, { width: colWidths[5], align: "center" });
                    doc.text(nota?.estado || "Sin registro", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 5, startY + 5, { width: colWidths[6], align: "center" });
                    startY += rowHeight;
                });

                doc.y = startY + 10;

                // Calcular resumen de semestre
                const p1 = asigData.parciales[1]?.notaFinal || 0;
                const p2 = asigData.parciales[2]?.notaFinal || 0;
                const p3 = asigData.parciales[3]?.notaFinal || 0;
                const sumaP1P2 = p1 + p2;
                const suma3 = p1 + p2 + p3;
                const promedio = suma3 > 0 ? (suma3 / 3).toFixed(2) : 0;

                // Cuadro de resumen
                doc.fontSize(10).fillColor("#17a2b8").text("Resumen de semestre:", { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(9).fillColor("#000");
                doc.text(`Parcial 1: ${p1} | Parcial 2: ${p2} | Parcial 3: ${p3} | Promedio: ${promedio}`);
                doc.text(`Suma P1+P2: ${sumaP1P2} | Suma 3 parciales: ${suma3}`);
                
                let estadoTexto = "Pendiente";
                if (asigData.parciales[1] && asigData.parciales[2]) {
                    if (sumaP1P2 < 28) estadoTexto = "Reprobado anticipadamente";
                    else if (asigData.parciales[3] && suma3 >= 42.10) estadoTexto = "Aprobado";
                    else if (asigData.parciales[3]) estadoTexto = "Reprobado";
                }
                doc.text(`Estado: ${estadoTexto}`);
                
                doc.moveDown(1.5);
            });
        });

        doc.end();
    } catch (error) {
        console.error("Error al exportar notas a PDF:", error);
        res.status(500).json({ error: "Error al exportar notas a PDF" });
    }
};
