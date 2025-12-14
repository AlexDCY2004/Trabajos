import apiClient from './apiClient';

// Listar asignaturas
export const listarAsignaturas = async () => {
  try {
    const response = await apiClient.get('/api/asignaturas');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener asignatura por ID
export const obtenerAsignatura = async (id) => {
  try {
    const response = await apiClient.get(`/api/asignaturas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear asignatura
export const crearAsignatura = async (datos) => {
  try {
    const response = await apiClient.post('/api/asignaturas', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar asignatura
export const actualizarAsignatura = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/asignaturas/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar asignatura
export const eliminarAsignatura = async (id) => {
  try {
    const response = await apiClient.delete(`/api/asignaturas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar asignatura
export const buscarAsignatura = async (busqueda) => {
  try {
    const response = await apiClient.get('/api/asignaturas/buscar', {
      params: { busqueda }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
