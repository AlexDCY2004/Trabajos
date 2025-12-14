// Endpoint para subir fotos de estudiantes
export const subirFoto = async (req, res) => {
    try {
        if (!req.file) {
            console.error('❌ No se proporcionó archivo');
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        console.log('✅ Archivo subido exitosamente:', req.file.filename);

        // Devolver la ruta relativa para acceder a la imagen
        const fotoPath = `/uploads/${req.file.filename}`;
        console.log('📍 Ruta de acceso:', fotoPath);
        
        res.status(200).json({ 
            mensaje: 'Foto subida correctamente',
            foto: fotoPath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('❌ Error en upload:', error);
        res.status(500).json({ error: error.message });
    }
};
