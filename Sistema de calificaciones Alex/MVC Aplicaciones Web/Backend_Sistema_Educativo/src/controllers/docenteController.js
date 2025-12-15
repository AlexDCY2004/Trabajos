import { Docente } from "../models/docente.js";
import { Asignatura } from "../models/asignatura.js";
import { Op } from "sequelize";

export const crearDocente = async (req, res) => {
    try {
        const { 
            nombre, 
            cedula, 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        } = req.body;
        
        if (!nombre || !cedula || !departamento || !email || !telefono) {
            return res.status(400).json({ error: "Faltan datos requeridos: nombre, cédula, email, teléfono y departamento son obligatorios" });
        }

        // Validar formato de cédula Ecuador (11 dígitos)
        if (!/^\d{11}$/.test(String(cedula).trim())) {
            return res.status(400).json({ error: "La cédula debe contener exactamente 11 dígitos numéricos" });
        }

        // Evitar duplicados de cédula con mensaje claro
        const existente = await Docente.findOne({ where: { cedula: String(cedula).trim() } });
        if (existente) {
            return res.status(400).json({ error: "Ya existe un docente con esa cédula" });
        }

        // Validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            return res.status(400).json({ error: "El formato del email no es válido" });
        }

        // Validar teléfono Ecuador (10 dígitos, inicia con 09)
        if (!/^09\d{8}$/.test(String(telefono).trim())) {
            return res.status(400).json({ error: "El teléfono debe tener 10 dígitos y empezar con 09" });
        }
        
        const nuevo = await Docente.create({ 
            nombre, 
            cedula: String(cedula).trim(), 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        });
        
        return res.status(201).json(nuevo);
    } catch (err) {
        // Mejorar mensajes de validación Sequelize
        if (err?.name === 'SequelizeValidationError' || err?.name === 'SequelizeUniqueConstraintError') {
            const detalles = err.errors?.map(e => e.message).join('; ');
            return res.status(400).json({ error: detalles || 'Error de validación' });
        }
        return res.status(500).json({ error: err.message });
    }
};

export const listarDocentes = async (req, res) => {
    try {
        const docentes = await Docente.findAll();
        return res.json(docentes);
    } catch (err) {
        return res.status(500).json({ error: "Error al listar docentes" });
    }
};

export const buscarDocente = async (req, res) => {
    try {
        const { busqueda } = req.query;
        if (!busqueda || String(busqueda).trim() === '') {
            return res.status(400).json({ error: "Debe proporcionar un término de búsqueda" });
        }

        const termino = String(busqueda).trim();
        const esNumerico = !isNaN(termino);
        const pareceCedula = esNumerico && termino.length >= 7; // cédulas suelen ser de 7+ dígitos

        let where;
        if (esNumerico && !pareceCedula) {
            // Búsqueda por ID estricta (números cortos)
            where = { id: Number(termino) };
        } else if (pareceCedula) {
            // Búsqueda por cédula (exacta y parcial)
            where = {
                [Op.or]: [
                    { cedula: termino },
                    { cedula: { [Op.like]: `%${termino}%` } }
                ]
            };
        } else {
            // Búsqueda por texto en campos
            where = {
                [Op.or]: [
                    { cedula: { [Op.like]: `%${termino}%` } },
                    { nombre: { [Op.like]: `%${termino}%` } },
                    { departamento: { [Op.like]: `%${termino}%` } },
                    { especialidad: { [Op.like]: `%${termino}%` } }
                ]
            };
        }

        const resultados = await Docente.findAll({
            where,
            order: [["nombre", "ASC"]]
        });

        // Devuelve array vacío con 200 para evitar errores en el front
        return res.json(resultados || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const obtenerDocentePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await Docente.findByPk(id);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });
        return res.json(docente);
    } catch (err) {
        return res.status(500).json({ error: "Error al obtener docente" });
    }
};

export const ActualizarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await Docente.findByPk(id);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

        const { 
            nombre, 
            cedula, 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        } = req.body;
        
        await docente.update({ 
            nombre: nombre ?? docente.nombre,
            cedula: cedula ?? docente.cedula,
            email: email ?? docente.email,
            telefono: telefono ?? docente.telefono,
            direccion: direccion ?? docente.direccion,
            fechaContratacion: fechaContratacion ?? docente.fechaContratacion,
            especialidad: especialidad ?? docente.especialidad,
            horasLaborales: horasLaborales ?? docente.horasLaborales,
            departamento: departamento ?? docente.departamento
        });

        return res.json(docente);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const eliminarDocente = async (req, res) => {
    try{
        const docente = await Docente.findByPk(req.params.id);
        if(!docente)
            return res.status(404).json({mensaje: "Docente no encontrado para eliminar"});

        await docente.destroy();
        res.json({mensaje: "Docente eliminado correctamente"});

    } catch (error){
        res.status(500).json({mensaje: "Error al eliminar el docente", error: error.mensaje});
    }
};

export const asignarAsignatura = async (req, res) => {
    try {
        const { id: docenteId, asignaturaId } = req.params;
        const docente = await Docente.findByPk(docenteId);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) return res.status(404).json({ error: "Asignatura no encontrada" });

        await asignatura.update({ docenteId: docente.id });
        return res.json(asignatura);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const desasignarAsignatura = async (req, res) => {
    try {
        const { id: docenteId, asignaturaId } = req.params;
        // opcional: verificar docente existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) return res.status(404).json({ error: "Asignatura no encontrada" });

        // permitir solo si la asignatura estaba asignada al docente indicado (seguridad opcional)
        if (asignatura.docenteId && String(asignatura.docenteId) !== String(docenteId)) {
            return res.status(400).json({ error: "La asignatura no está asignada a ese docente" });
        }

        await asignatura.update({ docenteId: null });
        return res.json(asignatura);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const listarAsignaturasDeDocente = async (req, res) => {
    try {
        const { id: docenteId } = req.params;
        const asignaturas = await Asignatura.findAll({ where: { docenteId } });
        return res.json(asignaturas);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

