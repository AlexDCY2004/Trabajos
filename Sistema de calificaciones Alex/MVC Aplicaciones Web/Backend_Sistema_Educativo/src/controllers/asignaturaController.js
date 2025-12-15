import { Asignatura } from "../models/asignatura.js";
import { Docente } from "../models/docente.js";
import { Nota } from "../models/nota.js";
import { Op } from "sequelize";

//crear asignatura
export const crearAsignatura = async (req, res) => {
    try{
        const {nombre, codigo, creditos, docenteId} = req.body;
        
        // Validaciones básicas
        if(!nombre || !codigo || !creditos || docenteId == null){
            return res.status(400).json({error: "Faltan datos requeridos: nombre, código, créditos y docente son obligatorios"});
        }

        // Validar código
        if (!/^[A-Z0-9\-]{2,10}$/.test(String(codigo).trim().toUpperCase())) {
            return res.status(400).json({error: "El código debe tener entre 2 y 10 caracteres y solo contener letras mayúsculas, números y guiones"});
        }

        // Verificar que no exista el código
        const existente = await Asignatura.findOne({ where: { codigo: String(codigo).trim().toUpperCase() } });
        if (existente) {
            return res.status(400).json({error: "Ya existe una asignatura con ese código"});
        }

        // Validar créditos
        const creditosNum = parseInt(creditos);
        if (isNaN(creditosNum) || creditosNum < 1 || creditosNum > 10) {
            return res.status(400).json({error: "Los créditos deben ser un número entre 1 y 10"});
        }

        // Verificar que exista el docente indicado
        const docente = await Docente.findByPk(docenteId);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

        const nuevo = await Asignatura.create({nombre, codigo, creditos: creditosNum, docenteId});

        // devolver con include para que muestre el docente
        const creado = await Asignatura.findByPk(nuevo.id, { include: [{ model: Docente }] });
        res.status(201).json(creado);

    }catch (err){
        if (err?.name === 'SequelizeValidationError' || err?.name === 'SequelizeUniqueConstraintError') {
            const detalles = err.errors?.map(e => e.message).join('; ');
            return res.status(400).json({ error: detalles || 'Error de validación' });
        }
        res.status(500).json({error: err.message});
    }
};

//crear obtener todos las asignaturas

export const listarAsignaturas = async (req, res) => {
    try{
        const asignaturas = await Asignatura.findAll({include : [{ model: Docente }]});
        res.json(asignaturas);

    } catch (error){
        res.status(500).json({mensaje: "Error al listar las asignaturas", error: error.mensaje});
    }
};


//obtener por ID

export const buscarAsignaturaId = async (req, res) => {
    try{
        const asignatura = await Asignatura.findByPk(req.params.id, {
                    include: [{ model: Docente }]
                });
        if(!asignatura){
            return res.status(404).json({mensaje: "Asignatura no encontrada"});
        }

        res.json(asignatura);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar la asignatura", error: error.mensaje});
    }
};

//actualizar

export const actualizarAsignatura = async (req, res) => {
    try{
        const asignatura = await Asignatura.findByPk(req.params.id);
        if(!asignatura) return res.status(404).json({ mensaje: "Asignatura no encontrada para actualizar" });
        const { nombre, codigo, creditos, docenteId } = req.body;

        if (nombre == null && codigo == null && creditos == null && docenteId == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        if (creditos != null && Number.isNaN(Number(creditos))) {
            return res.status(400).json({ mensaje: "El campo creditos debe ser numérico" });
        }

        // Si se envía docenteId, validar que exista dicho docente
        if (docenteId != null) {
            const docente = await Docente.findByPk(docenteId);
            if (!docente) return res.status(404).json({ mensaje: "Docente no encontrado" });
        }

        // Construir objeto con los campos a actualizar (evitar sobrescribir con undefined)
        const updates = {};
        if (nombre != null) updates.nombre = nombre;
        if (codigo != null) updates.codigo = codigo;
        if (creditos != null) updates.creditos = creditos;
        if (docenteId != null) updates.docenteId = docenteId;

        await asignatura.update(updates);
        return res.json(asignatura);

    } catch (err){
        console.error("actualizarAsignatura error:", err);
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ mensaje: "Código de asignatura ya existe" });
        }
        return res.status(500).json({ mensaje: "Error al actualizar la asignatura", error: err.message });
    }
};

//eliminar

export const eliminarAsignatura = async (req, res) => {
    try{
        const asignatura = await Asignatura.findByPk(req.params.id);
        if(!asignatura)
            return res.status(404).json({mensaje: "Asignatura no encontrada para eliminar"});

        // Opción segura: eliminar primero las notas relacionadas para evitar violación de FK
        await Nota.destroy({ where: { asignaturaId: asignatura.id } });

        await asignatura.destroy();
        res.json({mensaje: "Asignatura eliminada correctamente (notas relacionadas eliminadas)"});

    } catch (error){
        res.status(500).json({mensaje: "Error al eliminar la asignatura", error: error.mensaje});
    }
};

// Buscar asignatura por nombre o código
export const buscarAsignatura = async (req, res) => {
    try {
        const { busqueda } = req.query;
        
        if (!busqueda || String(busqueda).trim() === '') {
            return res.status(400).json({ error: "Debe proporcionar un término de búsqueda" });
        }

        const termino = String(busqueda).trim();
        const esNumericoCorto = !isNaN(termino) && termino.length <= 3; // ID exacto solo si tiene hasta 3 dígitos

        let where;
        if (esNumericoCorto) {
            // Si es un número muy corto (como 1, 2, 3), buscar por ID exacto
            where = { id: Number(termino) };
        } else {
            // Búsqueda por texto en nombre o código
            where = {
                [Op.or]: [
                    { nombre: { [Op.like]: `%${termino}%` } },
                    { codigo: { [Op.like]: `%${termino}%` } }
                ]
            };
        }
        
        const asignaturas = await Asignatura.findAll({
            where,
            order: [['nombre', 'ASC']],
            include: [{ model: Docente }]
        });
        
        res.json(asignaturas);
    } catch (error) {
        console.error("Error al buscar asignatura:", error);
        res.status(500).json({ error: "Error al buscar asignatura" });
    }
};



