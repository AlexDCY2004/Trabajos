import { Estudiante } from "../models/estudiante.js";

//crear estudiante
export const crearEstudiante = async (req, res) => {
    try{
        const {nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, curso} = req.body;
        if(!nombre || !cedula){
            return res.status(400).json({mensaje: "Faltan datos requeridos"});
        }

        const nuevo = await Estudiante.create({nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, curso});
        res.status(201).json(nuevo);
    
    }catch (err){
        res.status(500).json({error: err.message});
    }
};

//crear obtener todos los estudiante

export const listarEstudiantes = async (req, res) => {
    try{
        const estudiantes = await Estudiante.findAll();
        res.json(estudiantes);

    } catch (error){
        res.status(500).json({mensaje: "Error al listar los estudiantes", error: error.message});
    }
};


//obtener por ID

export const buscarEstudianteId = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante){
            return res.status(404).json({mensaje: "Estudiante no encontrado"});
        }

        res.json(estudiante);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar el estudiante", error: error.message});
    }
};

//actualizar

export const actualizarEstudiante = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante)
            return res.status(404).json({mensaje: "Estudiante no encontrado para actualizar"});

        const { nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, curso } = req.body;
        if (!nombre && !cedula && !email && !telefono && !direccion && !fechaNacimiento && !foto && !estado && !curso) {
            return res.status(400).json({ message: "No hay campos válidos para actualizar" });
        }

        await estudiante.update({ nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, curso });

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



