import apiClient from './apiClient';

// Listar docentes
export const listarDocentes = async () => {
  try {
    const response = await apiClient.get('/api/docentes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener docente por ID
export const obtenerDocente = async (id) => {
  try {
    const response = await apiClient.get(`/api/docentes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar docente por nombre o área
export const buscarDocente = async (busqueda) => {
  try {
    const response = await apiClient.get('/api/docentes/buscar', {
      params: { busqueda }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear docente
export const crearDocente = async (datos) => {
  try {
    const response = await apiClient.post('/api/docentes', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar docente
export const actualizarDocente = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/docentes/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar docente (DELETE físico en backend)
export const eliminarDocente = async (id) => {
  try {
    const response = await apiClient.delete(`/api/docentes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
