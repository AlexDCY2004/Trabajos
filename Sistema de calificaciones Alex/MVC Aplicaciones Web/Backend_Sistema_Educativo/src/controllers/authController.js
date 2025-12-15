import { Usuario } from '../models/usuario.js';

export const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Usuario y contraseña son requeridos' 
            });
        }

        // Normalizar username a minúsculas
        const normalizedUsername = username.trim().toLowerCase();
        
        const usuario = await Usuario.findOne({ 
            where: { username: normalizedUsername, estado: 'activo' } 
        });

        console.log('Intento de login:', normalizedUsername, '- Usuario encontrado:', !!usuario);

        if (!usuario || usuario.password !== password) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Simular token JWT (en producción usa jwt real)
        const token = Buffer.from(JSON.stringify({ 
            id: usuario.id, 
            username: usuario.username, 
            rol: usuario.rol 
        })).toString('base64');

        console.log('Login exitoso:', usuario.username, '- Rol:', usuario.rol);

        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
};

export const registroController = async (req, res) => {
    try {
        const { username, password, email, rol } = req.body;

        // Validaciones básicas
        if (!username || !password || !email) {
            return res.status(400).json({ 
                error: 'Usuario, contraseña y email son requeridos' 
            });
        }

        // Validar username
        if (!/^[a-z0-9_\-]{3,50}$/.test(String(username).trim().toLowerCase())) {
            return res.status(400).json({ 
                error: 'El usuario debe tener entre 3 y 50 caracteres y solo contener letras minúsculas, números, guiones y guiones bajos' 
            });
        }

        // Validar password
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                error: 'El formato del email no es válido' 
            });
        }

        // Verificar usuario existente
        const usuarioExistente = await Usuario.findOne({ where: { username: String(username).trim().toLowerCase() } });
        if (usuarioExistente) {
            return res.status(409).json({ 
                error: 'El usuario ya existe' 
            });
        }

        // Verificar email existente
        const emailExistente = await Usuario.findOne({ where: { email: String(email).trim().toLowerCase() } });
        if (emailExistente) {
            return res.status(409).json({ 
                error: 'El email ya está registrado' 
            });
        }

        // Validar rol
        const rolesPermitidos = ['admin', 'docente', 'estudiante'];
        if (rol && !rolesPermitidos.includes(rol)) {
            return res.status(400).json({ 
                error: 'Rol inválido. Debe ser: admin, docente o estudiante' 
            });
        }

        const nuevoUsuario = await Usuario.create({
            username,
            password, // En producción: hashear con bcrypt
            email,
            rol: rol || 'estudiante',
            estado: 'activo'
        });

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                username: nuevoUsuario.username,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        if (error?.name === 'SequelizeValidationError' || error?.name === 'SequelizeUniqueConstraintError') {
            const detalles = error.errors?.map(e => e.message).join('; ');
            return res.status(400).json({ error: detalles || 'Error de validación' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPerfilController = async (req, res) => {
    try {
        const usuarioId = req.usuario?.id;
        
        if (!usuarioId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const usuario = await Usuario.findByPk(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            estado: usuario.estado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
