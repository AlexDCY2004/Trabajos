import React, { useState, useEffect } from 'react';
import { listarCursos, crearCurso, actualizarCurso, eliminarCurso, obtenerEstudiantesCurso } from '../services/cursoService';
import { listarDocentes } from '../services/docenteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function CursoPage() {
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [showEstudiantes, setShowEstudiantes] = useState(null);
  const [estudiantesCurso, setEstudiantesCurso] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    nivel: '',
    paralelo: '',
    capacidad: '',
    anio: new Date().getFullYear(),
    estado: 'activo',
    docenteId: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarCursos();
    cargarDocentes();
  }, []);

  const cargarCursos = async () => {
    setCargando(true);
    try {
      const data = await listarCursos();
      setCursos(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const cargarDocentes = async () => {
    try {
      const data = await listarDocentes();
      setDocentes(data);
    } catch (error) {
      console.log('Error al cargar docentes');
    }
  };

  const handleVerEstudiantes = async (cursoId) => {
    try {
      const data = await obtenerEstudiantesCurso(cursoId);
      setEstudiantesCurso(data.Estudiantes || []);
      setShowEstudiantes(cursoId);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: 'Error al cargar estudiantes' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.nombre || !formulario.nivel || !formulario.paralelo) {
      setAlert({ show: true, type: 'warning', message: 'Nombre, nivel y paralelo son obligatorios' });
      return;
    }

    try {
      if (editando) {
        await actualizarCurso(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Curso actualizado correctamente' });
      } else {
        await crearCurso(formulario);
        setAlert({ show: true, type: 'success', message: 'Curso creado correctamente' });
      }
      
      setFormulario({ 
        nombre: '', 
        nivel: '', 
        paralelo: '', 
        capacidad: '', 
        anio: new Date().getFullYear(),
        estado: 'activo',
        docenteId: '' 
      });
      setEditando(null);
      setShowFormulario(false);
      cargarCursos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const handleEditar = (curso) => {
    setFormulario(curso);
    setEditando(curso.id);
    setShowFormulario(true);
  };

  const handleEliminar = (curso) => {
    setCursoAEliminar(curso);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarCurso(cursoAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Curso eliminado correctamente' });
      setShowModal(false);
      cargarCursos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-building me-2"></i>
            Gestión de Cursos
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              setShowFormulario(!showFormulario);
              if (showFormulario) {
                setFormulario({ 
                  nombre: '', 
                  nivel: '', 
                  paralelo: '', 
                  capacidad: '', 
                  anio: new Date().getFullYear(),
                  estado: 'activo',
                  docenteId: '' 
                });
                setEditando(null);
              }
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nuevo Curso'}
          </button>
        </div>
      </div>

      <Alert 
        show={alert.show} 
        message={alert.message} 
        type={alert.type}
        onClose={() => setAlert({ show: false })}
      />

      {showFormulario && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{editando ? 'Editar Curso' : 'Nuevo Curso'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Nivel *</label>
                  <select
                    className="form-select"
                    value={formulario.nivel}
                    onChange={(e) => setFormulario({ ...formulario, nivel: e.target.value })}
                    required
                  >
                    <option value="">Seleccione nivel</option>
                    <option value="Primero">Primero</option>
                    <option value="Segundo">Segundo</option>
                    <option value="Tercero">Tercero</option>
                    <option value="Cuarto">Cuarto</option>
                    <option value="Quinto">Quinto</option>
                    <option value="Sexto">Sexto</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Paralelo *</label>
                  <select
                    className="form-select"
                    value={formulario.paralelo}
                    onChange={(e) => setFormulario({ ...formulario, paralelo: e.target.value })}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Capacidad</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formulario.capacidad}
                    onChange={(e) => setFormulario({ ...formulario, capacidad: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Año</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formulario.anio}
                    onChange={(e) => setFormulario({ ...formulario, anio: e.target.value })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={formulario.estado}
                    onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Profesor Responsable</label>
                <select
                  className="form-select"
                  value={formulario.docenteId || ''}
                  onChange={(e) => setFormulario({ ...formulario, docenteId: e.target.value })}
                >
                  <option value="">Seleccione un profesor</option>
                  {docentes.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowFormulario(false);
                  setFormulario({ 
                    nombre: '', 
                    nivel: '', 
                    paralelo: '', 
                    capacidad: '', 
                    anio: new Date().getFullYear(),
                    estado: 'activo',
                    docenteId: '' 
                  });
                  setEditando(null);
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar' : 'Crear'} Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEstudiantes && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Estudiantes del Curso</h5>
            <button 
              type="button" 
              className="btn btn-sm btn-light"
              onClick={() => setShowEstudiantes(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            {estudiantesCurso.length === 0 ? (
              <p className="text-muted">No hay estudiantes asignados a este curso</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesCurso.map(estudiante => (
                      <tr key={estudiante.id}>
                        <td>{estudiante.id}</td>
                        <td>{estudiante.nombre}</td>
                        <td>{estudiante.cedula}</td>
                        <td>{estudiante.email}</td>
                        <td>{estudiante.telefono}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : cursos.length === 0 ? (
        <div className="alert alert-info">
          No hay cursos registrados. Crear uno nuevo para empezar.
        </div>
      ) : (
        <div className="row">
          {cursos.map(curso => (
            <div key={curso.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="mb-0">{curso.nombre}</h5>
                  <small className="text-muted">{curso.nivel} {curso.paralelo}</small>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Año:</strong> {curso.anio}
                  </p>
                  <p className="mb-2">
                    <strong>Estado:</strong> 
                    <span className={`badge ms-2 ${curso.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                      {curso.estado}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>Estudiantes:</strong> {curso.totalEstudiantes}
                    {curso.capacidad && ` / ${curso.capacidad}`}
                  </p>
                  {curso.Docentes && curso.Docentes.length > 0 && (
                    <p className="mb-2">
                      <strong>Profesor:</strong> {curso.Docentes[0].nombre}
                    </p>
                  )}
                </div>
                <div className="card-footer bg-light">
                  <button 
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleVerEstudiantes(curso.id)}
                  >
                    <i className="bi bi-eye me-1"></i>Ver Estudiantes
                  </button>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEditar(curso)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(curso)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        show={showModal}
        title="Eliminar Curso"
        message={`¿Está seguro de que desea eliminar el curso "${cursoAEliminar?.nombre}"?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
      />
    </div>
  );
}
