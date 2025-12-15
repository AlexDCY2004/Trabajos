import { Estudiante } from "../models/estudiante.js";
import { Curso } from "../models/curso.js";
import { Op } from "sequelize";

//crear estudiante
export const crearEstudiante = async (req, res) => {
    try{
        const {nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado,cursoId} = req.body;
        
        // Validaciones básicas obligatorias
        if(!nombre || !cedula || !email || !telefono){
            return res.status(400).json({error: "Faltan datos requeridos: nombre, cédula, email y teléfono son obligatorios"});
        }

        // Validar formato de cédula Ecuador (11 dígitos)
        if (!/^\d{11}$/.test(String(cedula).trim())) {
            return res.status(400).json({error: "La cédula debe contener exactamente 11 dígitos numéricos"});
        }

        // Verificar que no exista la cédula
        const existente = await Estudiante.findOne({ where: { cedula: String(cedula).trim() } });
        if (existente) {
            return res.status(400).json({error: "Ya existe un estudiante con esa cédula"});
        }

        // Validar email requerido
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            return res.status(400).json({error: "El formato del email no es válido"});
        }

        // Validar teléfono requerido (Ecuador móvil: 09 + 8 dígitos)
        if (!/^09\d{8}$/.test(String(telefono).trim())) {
            return res.status(400).json({error: "El teléfono debe tener 10 dígitos y empezar con 09"});
        }

        // Validar que exista el cursoId si se proporciona
        if(cursoId){
            const cursoExistente = await Curso.findByPk(cursoId);
            if(!cursoExistente){
                return res.status(400).json({error: "Curso no encontrado"});
            }
        }

        // Validar fecha de nacimiento si se proporciona
        if (fechaNacimiento) {
            const fecha = new Date(fechaNacimiento);
            if (isNaN(fecha.getTime())) {
                return res.status(400).json({error: "Fecha de nacimiento inválida"});
            }
            if (fecha > new Date()) {
                return res.status(400).json({error: "La fecha de nacimiento no puede ser futura"});
            }
            const age = (new Date() - fecha) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 3 || age > 100) {
                return res.status(400).json({error: "La edad debe estar entre 3 y 100 años"});
            }
        }

        const nuevo = await Estudiante.create({nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, cursoId});
        res.status(201).json(nuevo);
    
    }catch (err){
        if (err?.name === 'SequelizeValidationError' || err?.name === 'SequelizeUniqueConstraintError') {
            const detalles = err.errors?.map(e => e.message).join('; ');
            return res.status(400).json({ error: detalles || 'Error de validación' });
        }
        res.status(500).json({error: err.message});
    }
};

//crear obtener todos los estudiante

// En listarEstudiantes
export const listarEstudiantes = async (req, res) => {
    try{
        const estudiantes = await Estudiante.findAll({
            where: { estado: 'activo' },
            include: [{
                model: Curso,
                attributes: ['id', 'nombre', 'nivel', 'paralelo']
            }]
        });
        res.json(estudiantes);
    } catch (error){
        res.status(500).json({mensaje: "Error al listar los estudiantes", error: error.message});
    }
};

// En buscarEstudianteId
export const buscarEstudianteId = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id, {
            include: [{
                model: Curso
            }]
        });
        if(!estudiante){
            return res.status(404).json({mensaje: "Estudiante no encontrado"});
        }
        res.json(estudiante);
    } catch (error){
        res.status(500).json({mensaje: "Error al buscar el estudiante", error: error.message});
    }
};

export const buscarEstudiante = async (req, res) => {
    try{
        const { busqueda } = req.query;
        
        if(!busqueda){
            return res.status(400).json({mensaje: "Debe proporcionar un término de búsqueda"});
        }

        const termino = String(busqueda).trim();
        const esNumerico = !isNaN(termino);
        const pareceCedula = esNumerico && termino.length >= 7;

        let where;
        if (esNumerico && !pareceCedula) {
            // Buscar por ID exacto
            where = { id: Number(termino), estado: 'activo' };
        } else if (pareceCedula) {
            // Buscar por cédula exacta o parcial
            where = {
                [Op.and]: [
                    { estado: 'activo' },
                    {
                        [Op.or]: [
                            { cedula: termino },
                            { cedula: { [Op.like]: `%${termino}%` } }
                        ]
                    }
                ]
            };
        } else {
            // Buscar por nombre (parcial)
            where = {
                [Op.and]: [
                    { estado: 'activo' },
                    { nombre: { [Op.like]: `%${termino}%` } }
                ]
            };
        }

        const estudiantes = await Estudiante.findAll({ where });

        if(estudiantes.length === 0){
            return res.status(404).json({mensaje: "No se encontraron estudiantes con ese criterio"});
        }

        res.json(estudiantes);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar estudiantes", error: error.message});
    }
};

//buscar por cédula específica
export const buscarEstudiantePorCedula = async (req, res) => {
    try{
        const estudiante = await Estudiante.findOne({ where: { cedula: req.params.cedula } });
        if(!estudiante){
            return res.status(404).json({mensaje: "Estudiante no encontrado"});
        }

        res.json(estudiante);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar el estudiante", error: error.message});
    }
};

//buscar por nombre
export const buscarEstudiantePorNombre = async (req, res) => {
    try{
        const estudiantes = await Estudiante.findAll({ 
            where: { 
                nombre: { [Op.like]: `%${req.params.nombre}%` }
            } 
        });
        
        if(estudiantes.length === 0){
            return res.status(404).json({mensaje: "No se encontraron estudiantes con ese nombre"});
        }

        res.json(estudiantes);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar estudiantes", error: error.message});
    }
};

//actualizar

export const actualizarEstudiante = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante)
            return res.status(404).json({mensaje: "Estudiante no encontrado para actualizar"});

        const { nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado,cursoId } = req.body;
        if (!nombre && !cedula && !email && !telefono && !direccion && !fechaNacimiento && !foto && !estado && !cursoId) {
            return res.status(400).json({ message: "No hay campos válidos para actualizar" });
        }

        await estudiante.update({ nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, cursoId });

        res.json(estudiante);

    } catch (error){
        res.status(500).json({mensaje: "Error al actualizar el estudiante", error: error.message});
    }
};

//eliminar

export const eliminarEstudiante = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante)
            return res.status(404).json({mensaje: "Estudiante no encontrado para eliminar"});

        await estudiante.destroy();
        res.json({mensaje: "Estudiante eliminado correctamente"});

    } catch (error){
        res.status(500).json({mensaje: "Error al eliminar el estudiante", error: error.message});
    }
};



