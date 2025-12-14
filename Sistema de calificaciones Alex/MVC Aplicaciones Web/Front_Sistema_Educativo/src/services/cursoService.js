import apiClient from './apiClient';

// Listar cursos con filtros opcionales
export const listarCursos = async (filtros = {}) => {
  try {
    const response = await apiClient.get('/api/cursos', { params: filtros });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener curso por ID
export const obtenerCurso = async (id) => {
  try {
    const response = await apiClient.get(`/api/cursos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar curso
export const buscarCurso = async (busqueda) => {
  try {
    const response = await apiClient.get('/api/cursos/buscar', {
      params: { busqueda }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear curso
export const crearCurso = async (datos) => {
  try {
    const response = await apiClient.post('/api/cursos', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar curso
export const actualizarCurso = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/cursos/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar curso (eliminación lógica)
export const eliminarCurso = async (id) => {
  try {
    const response = await apiClient.delete(`/api/cursos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener estudiantes de un curso
export const obtenerEstudiantesCurso = async (cursoId) => {
  try {
    const response = await apiClient.get(`/api/cursos/${cursoId}/estudiantes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Asignar estudiante a un curso
export const asignarEstudianteCurso = async (datos) => {
  try {
    const response = await apiClient.post('/api/cursos/asignar-estudiante', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};
