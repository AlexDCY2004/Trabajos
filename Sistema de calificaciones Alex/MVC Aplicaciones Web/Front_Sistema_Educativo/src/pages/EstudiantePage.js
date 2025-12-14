import React, { useState, useEffect } from 'react';
import { listarEstudiantes, crearEstudiante, actualizarEstudiante, eliminarEstudiante, buscarEstudiante } from '../services/estudianteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '-';
  const fn = new Date(fechaNacimiento);
  if (isNaN(fn.getTime())) return '-';
  const hoy = new Date();
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) {
    edad--;
  }
  return edad;
}

export default function EstudiantePage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [showDetalles, setShowDetalles] = useState(false);
  const [estudianteDetalles, setEstudianteDetalles] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    foto: '',
    cursoId: '',
    estado: 'activo'
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    setCargando(true);
    try {
      const data = await listarEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarEstudiantes();
      return;
    }
    
    setCargando(true);
    try {
      const data = await buscarEstudiante(busqueda);
      setEstudiantes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.nombre || !formulario.cedula) {
      setAlert({ show: true, type: 'warning', message: 'Nombre y cédula son obligatorios' });
      return;
    }

    try {
      if (editando) {
        await actualizarEstudiante(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Estudiante actualizado correctamente' });
      } else {
        await crearEstudiante(formulario);
        setAlert({ show: true, type: 'success', message: 'Estudiante creado correctamente' });
      }
      
      setFormulario({ nombre: '', cedula: '', email: '', telefono: '', direccion: '', fechaNacimiento: '', foto: '', cursoId: '', estado: 'activo' });
      setEditando(null);
      setShowFormulario(false);
      cargarEstudiantes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const handleEditar = (estudiante) => {
    setFormulario(estudiante);
    setEditando(estudiante.id);
    setShowFormulario(true);
  };

  const handleEliminar = (estudiante) => {
    setEstudianteAEliminar(estudiante);
    setShowModal(true);
  };

  const handleVer = (estudiante) => {
    setEstudianteDetalles(estudiante);
    setShowDetalles(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarEstudiante(estudianteAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Estudiante eliminado correctamente' });
      setShowModal(false);
      cargarEstudiantes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-people-fill me-2"></i>
            Gestión de Estudiantes
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              setShowFormulario(!showFormulario);
              if (showFormulario) {
              setFormulario({ nombre: '', cedula: '', email: '', telefono: '', direccion: '', fechaNacimiento: '', foto: '', cursoId: '', estado: 'activo' });
                setEditando(null);
              }
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nuevo Estudiante'}
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
            <h5 className="mb-0">{editando ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h5>
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
                  <label className="form-label">Cédula *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.cedula}
                    onChange={(e) => setFormulario({ ...formulario, cedula: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formulario.email}
                    onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={formulario.direccion}
                  onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formulario.fechaNacimiento}
                    onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Foto (URL)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.foto}
                    onChange={(e) => setFormulario({ ...formulario, foto: e.target.value })}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Curso</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formulario.cursoId}
                    onChange={(e) => setFormulario({ ...formulario, cursoId: e.target.value })}
                    placeholder="ID del curso"
                  />
                </div>
              </div>
              <div className="mb-3">
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
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-lg me-2"></i>
                {editando ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleBuscar} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, cédula o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Foto</th>
                  <th>Edad</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay estudiantes registrados
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td>{estudiante.id}</td>
                      <td>{estudiante.nombre}</td>
                      <td>{estudiante.cedula}</td>
                      <td>
                        {estudiante.foto ? (
                          <img src={estudiante.foto} alt={estudiante.nombre} style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '4px' }} />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{calcularEdad(estudiante.fechaNacimiento)}</td>
                      <td>{estudiante.email || '-'}</td>
                      <td>{estudiante.telefono || '-'}</td>
                      <td>
                        <span className={`badge ${estudiante.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                          {estudiante.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleVer(estudiante)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditar(estudiante)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(estudiante)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        show={showModal}
        title="Eliminar Estudiante"
        message={`¿Está seguro de que desea eliminar a ${estudianteAEliminar?.nombre}?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />

      {showDetalles && estudianteDetalles && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Detalles del Estudiante</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetalles(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    {estudianteDetalles.foto ? (
                      <img
                        src={estudianteDetalles.foto}
                        alt={estudianteDetalles.nombre}
                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '200px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                          color: '#999'
                        }}
                      >
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <h4>{estudianteDetalles.nombre}</h4>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: '40%' }}>ID</th>
                          <td>{estudianteDetalles.id}</td>
                        </tr>
                        <tr>
                          <th>Cédula</th>
                          <td>{estudianteDetalles.cedula}</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>{estudianteDetalles.email || '-'}</td>
                        </tr>
                        <tr>
                          <th>Teléfono</th>
                          <td>{estudianteDetalles.telefono || '-'}</td>
                        </tr>
                        <tr>
                          <th>Edad</th>
                          <td>{calcularEdad(estudianteDetalles.fechaNacimiento)}</td>
                        </tr>
                        <tr>
                          <th>Fecha Nacimiento</th>
                          <td>{estudianteDetalles.fechaNacimiento || '-'}</td>
                        </tr>
                        <tr>
                          <th>Dirección</th>
                          <td>{estudianteDetalles.direccion || '-'}</td>
                        </tr>
                        <tr>
                          <th>Curso ID</th>
                          <td>{estudianteDetalles.cursoId || '-'}</td>
                        </tr>
                        <tr>
                          <th>Estado</th>
                          <td>
                            <span
                              className={`badge ${estudianteDetalles.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}
                            >
                              {estudianteDetalles.estado}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetalles(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
