import React, { useState, useEffect } from 'react';
import { listarAsignaturas, crearAsignatura, actualizarAsignatura, eliminarAsignatura } from '../services/asignaturaService';
import { listarDocentes } from '../services/docenteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AsignaturaPage() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [asignaturaAEliminar, setAsignaturaAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: '',
    codigo: '',
    creditos: '',
    docenteId: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarAsignaturas();
    cargarDocentes();
  }, []);

  const cargarAsignaturas = async () => {
    setCargando(true);
    try {
      const data = await listarAsignaturas();
      setAsignaturas(data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.nombre || !formulario.codigo || !formulario.creditos) {
      setAlert({ show: true, type: 'warning', message: 'Nombre, código y créditos son obligatorios' });
      return;
    }

    try {
      if (editando) {
        await actualizarAsignatura(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Asignatura actualizada correctamente' });
      } else {
        await crearAsignatura(formulario);
        setAlert({ show: true, type: 'success', message: 'Asignatura creada correctamente' });
      }
      
      setFormulario({ nombre: '', codigo: '', creditos: '', docenteId: '' });
      setEditando(null);
      setShowFormulario(false);
      cargarAsignaturas();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const handleEditar = (asignatura) => {
    setFormulario(asignatura);
    setEditando(asignatura.id);
    setShowFormulario(true);
  };

  const handleEliminar = (asignatura) => {
    setAsignaturaAEliminar(asignatura);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarAsignatura(asignaturaAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Asignatura eliminada correctamente' });
      setShowModal(false);
      cargarAsignaturas();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-book-fill me-2"></i>
            Gestión de Asignaturas
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              setShowFormulario(!showFormulario);
              if (showFormulario) {
                setFormulario({ nombre: '', codigo: '', creditos: '', docenteId: '' });
                setEditando(null);
              }
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nueva Asignatura'}
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
            <h5 className="mb-0">{editando ? 'Editar Asignatura' : 'Nueva Asignatura'}</h5>
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
                <div className="col-md-6 mb-3">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.codigo}
                    onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Créditos *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formulario.creditos}
                    onChange={(e) => setFormulario({ ...formulario, creditos: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Docente</label>
                  <select
                    className="form-select"
                    value={formulario.docenteId || ''}
                    onChange={(e) => setFormulario({ ...formulario, docenteId: e.target.value })}
                  >
                    <option value="">Seleccione un docente</option>
                    {docentes.map(docente => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowFormulario(false);
                  setFormulario({ nombre: '', codigo: '', creditos: '', docenteId: '' });
                  setEditando(null);
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar' : 'Crear'} Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : asignaturas.length === 0 ? (
        <div className="alert alert-info">
          No hay asignaturas registradas. Crear una nueva para empezar.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Código</th>
                <th>Créditos</th>
                <th>Docente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.map(asignatura => (
                <tr key={asignatura.id}>
                  <td>{asignatura.id}</td>
                  <td>{asignatura.nombre}</td>
                  <td>{asignatura.codigo}</td>
                  <td>{asignatura.creditos}</td>
                  <td>{asignatura.Docente?.nombre || 'Sin asignar'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditar(asignatura)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminar(asignatura)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        show={showModal}
        title="Eliminar Asignatura"
        message={`¿Está seguro de que desea eliminar la asignatura "${asignaturaAEliminar?.nombre}"?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
      />
    </div>
  );
}
