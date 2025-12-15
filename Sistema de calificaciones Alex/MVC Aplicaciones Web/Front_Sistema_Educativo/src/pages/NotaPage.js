import React, { useState, useEffect } from 'react';
import { listarNotas, crearNota, actualizarNota, eliminarNota, obtenerHistorialNotas, obtenerEstadoAcademico, exportarNotasExcel, exportarNotasPDF } from '../services/notaService';
import { listarEstudiantes, buscarEstudiante } from '../services/estudianteService';
import { listarDocentes } from '../services/docenteService';
import { listarAsignaturas } from '../services/asignaturaService';
import { obtenerUsuarioActual } from '../services/authService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function NotaPage() {
  const usuario = obtenerUsuarioActual();
  const esEstudiante = usuario?.rol === 'estudiante';
  const esDocente = usuario?.rol === 'docente';
  
  const [notas, setNotas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [notaAEliminar, setNotaAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(esEstudiante); // Auto-abrir para estudiantes
  const [cargandoExport, setCargandoExport] = useState(false);
  const [filtros, setFiltros] = useState({
    estudianteId: '',
    docenteId: '',
    parcial: '',
    ordenar: 'reciente'
  });
  const [formulario, setFormulario] = useState({
    estudianteId: '',
    docenteId: '',
    asignaturaId: '',
    parcial: 1,
    tarea: '',
    informe: '',
    leccion: '',
    examen: '',
    observaciones: '',
    tipoEvaluacion: 'examen',
    fechaEvaluacion: new Date().toISOString().split('T')[0]
  });
  const [editando, setEditando] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [resumenSeleccionado, setResumenSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [notas, estudiantes, docentes, asignaturasData] = await Promise.all([
        listarNotas(),
        listarEstudiantes(),
        listarDocentes(),
        listarAsignaturas()
      ]);
      setNotas(notas);
      setEstudiantes(estudiantes);
      setDocentes(docentes);
      setAsignaturas(asignaturasData);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const cargarNotasConFiltros = async () => {
    setCargando(true);
    try {
      const notasFiltradas = await listarNotas(filtros);
      setNotas(notasFiltradas);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.estudianteId || !formulario.asignaturaId || !formulario.docenteId) {
      setAlert({ show: true, type: 'warning', message: 'Estudiante, asignatura y docente son obligatorios' });
      return;
    }

    if (!formulario.tarea || !formulario.informe || !formulario.leccion || !formulario.examen) {
      setAlert({ show: true, type: 'warning', message: 'Todas las evaluaciones son requeridas' });
      return;
    }

    try {
      if (editando) {
        await actualizarNota(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Nota actualizada correctamente' });
      } else {
        await crearNota(formulario);
        setAlert({ show: true, type: 'success', message: 'Nota creada correctamente' });
      }
      
      resetearFormulario();
      cargarDatos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const resetearFormulario = () => {
    setFormulario({
      estudianteId: '',
      docenteId: '',
      asignaturaId: '',
      parcial: 1,
      tarea: '',
      informe: '',
      leccion: '',
      examen: '',
      observaciones: '',
      tipoEvaluacion: 'examen',
      fechaEvaluacion: new Date().toISOString().split('T')[0]
    });
    setEditando(null);
    setShowFormulario(false);
  };

  const handleEditar = (nota) => {
    setFormulario(nota);
    setEditando(nota.id);
    setShowFormulario(true);
  };

  const handleEliminar = (nota) => {
    setNotaAEliminar(nota);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarNota(notaAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Nota eliminada correctamente' });
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  // Calcular nota final
  const calcularNotaFinal = (tarea, informe, leccion, examen) => {
    if (!tarea || !informe || !leccion || !examen) return 0;
    return (
      parseFloat(tarea) * 0.2 +
      parseFloat(informe) * 0.2 +
      parseFloat(leccion) * 0.2 +
      parseFloat(examen) * 0.4
    ).toFixed(2);
  };

  const buscarHistorial = async () => {
    if (!terminoBusqueda.trim()) {
      setAlert({ show: true, type: 'warning', message: 'Ingrese cédula o nombre para buscar.' });
      return;
    }

    setCargandoHistorial(true);
    setHistorial(null);

    try {
      const resultados = await buscarEstudiante(terminoBusqueda.trim());
      const lista = Array.isArray(resultados) ? resultados : [resultados];
      setResultadosBusqueda(lista);
      if (lista.length === 1) {
        await seleccionarEstudiante(lista[0]);
      }
    } catch (error) {
      setResultadosBusqueda([]);
      setHistorial(null);
      const mensaje = error?.response?.data?.mensaje || error.message || 'Error al buscar estudiante';
      setAlert({ show: true, type: 'danger', message: mensaje });
    } finally {
      setCargandoHistorial(false);
    }
  };

  const seleccionarEstudiante = async (estudiante) => {
    setCargandoHistorial(true);
    setHistorial(null);
    setResumenSeleccionado(null);

    try {
      const data = await obtenerHistorialNotas(estudiante.id);
      setHistorial(data);
    } catch (error) {
      const mensaje = error?.response?.data?.error || error.message || 'Error al cargar historial';
      setAlert({ show: true, type: 'danger', message: mensaje });
    } finally {
      setCargandoHistorial(false);
    }
  };

  const badgeEstado = (estado) => {
    if (estado === 'aprobado' || estado === 'aprobado_anticipado') return 'bg-success';
    if (estado && estado.includes('reprobado')) return 'bg-danger';
    return 'bg-secondary';
  };

  const verResumenAsignatura = async (asig) => {
    if (!historial?.estudiante?.id) return;
    setCargandoResumen(true);
    setResumenSeleccionado(null);
    try {
      const data = await obtenerEstadoAcademico(historial.estudiante.id, asig.asignaturaId);
      setResumenSeleccionado({ asignaturaId: asig.asignaturaId, data });
    } catch (error) {
      const mensaje = error?.response?.data?.error || error.message || 'Error al cargar resumen';
      setAlert({ show: true, type: 'danger', message: mensaje });
    } finally {
      setCargandoResumen(false);
    }
  };

  const descargarArchivo = (blob, nombre) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    setCargandoExport(true);
    try {
      const blob = await exportarNotasExcel(filtros);
      descargarArchivo(blob, 'reporte-notas.xlsx');
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message || 'Error al exportar Excel' });
    } finally {
      setCargandoExport(false);
    }
  };

  const handleExportPDF = async () => {
    setCargandoExport(true);
    try {
      const blob = await exportarNotasPDF(filtros);
      descargarArchivo(blob, 'reporte-notas.pdf');
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message || 'Error al exportar PDF' });
    } finally {
      setCargandoExport(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-file-earmark-text-fill me-2"></i>
            {esEstudiante ? 'Mis Notas' : 'Registro de Notas'}
          </h2>
          {esEstudiante && <p className="text-muted">Vista de tus calificaciones</p>}
        </div>
        <div className="col text-end">
          {!esEstudiante && (
            <button 
              className="btn btn-primary me-2"
              onClick={() => {
                if (showFormulario) resetearFormulario();
                else setShowFormulario(true);
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              {showFormulario ? 'Cerrar' : 'Nueva Nota'}
            </button>
          )}
          <button
            className="btn btn-outline-info"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            <i className="bi bi-clock-history me-2"></i>
            {mostrarHistorial ? 'Ocultar historial' : 'Historial académico'}
          </button>
        </div>
      </div>

      <Alert 
        show={alert.show} 
        message={alert.message} 
        type={alert.type}
        onClose={() => setAlert({ show: false })}
      />

      {showFormulario && !esEstudiante && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{editando ? 'Editar Nota' : 'Nueva Nota'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Estudiante *</label>
                  <select
                    className="form-select"
                    value={formulario.estudianteId}
                    onChange={(e) => setFormulario({ ...formulario, estudianteId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.nombre} ({est.cedula})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Asignatura *</label>
                  <select
                    className="form-select"
                    value={formulario.asignaturaId}
                    onChange={(e) => setFormulario({ ...formulario, asignaturaId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar asignatura</option>
                    {asignaturas.map(asig => (
                      <option key={asig.id} value={asig.id}>
                        {asig.nombre} ({asig.codigo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Docente *</label>
                  <select
                    className="form-select"
                    value={formulario.docenteId}
                    onChange={(e) => setFormulario({ ...formulario, docenteId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar docente</option>
                    {docentes.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.nombre} ({doc.cedula})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Parcial *</label>
                  <select
                    className="form-select"
                    value={formulario.parcial}
                    onChange={(e) => setFormulario({ ...formulario, parcial: e.target.value })}
                    required
                  >
                    <option value={1}>Parcial 1</option>
                    <option value={2}>Parcial 2</option>
                    <option value={3}>Parcial 3</option>
                  </select>
                </div>
              </div>

              <div className="alert alert-info">
                <p className="mb-2"><strong>Instrucciones de evaluación:</strong></p>
                <p className="mb-0">Ingrese las 4 notas (de 0 a 20). La nota final se calculará automáticamente:</p>
                <ul className="mb-0 mt-2">
                  <li>Tarea: 20%</li>
                  <li>Informe: 20%</li>
                  <li>Lección: 20%</li>
                  <li>Examen: 40%</li>
                </ul>
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Tarea (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.tarea}
                    onChange={(e) => setFormulario({ ...formulario, tarea: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Informe (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.informe}
                    onChange={(e) => setFormulario({ ...formulario, informe: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Lección (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.leccion}
                    onChange={(e) => setFormulario({ ...formulario, leccion: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Examen (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.examen}
                    onChange={(e) => setFormulario({ ...formulario, examen: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Nota Final (Calculada): <strong>{calcularNotaFinal(formulario.tarea, formulario.informe, formulario.leccion, formulario.examen)}/20</strong></label>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de Evaluación</label>
                  <select
                    className="form-select"
                    value={formulario.tipoEvaluacion}
                    onChange={(e) => setFormulario({ ...formulario, tipoEvaluacion: e.target.value })}
                  >
                    <option value="examen">Examen</option>
                    <option value="tarea">Tarea</option>
                    <option value="informe">Informe</option>
                    <option value="leccion">Lección</option>
                    <option value="proyecto">Proyecto</option>
                    <option value="participacion">Participación</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Evaluación</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formulario.fechaEvaluacion}
                    onChange={(e) => setFormulario({ ...formulario, fechaEvaluacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formulario.observaciones}
                  onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-lg me-2"></i>
                {editando ? 'Actualizar' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mostrarHistorial && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="mb-0">Historial académico</h5>
                <small>Busca por cédula o nombre</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleExportExcel}
                  disabled={cargandoExport}
                >
                  <i className="bi bi-file-earmark-excel me-1 text-success"></i>
                  {cargandoExport ? 'Generando...' : 'Exportar Excel'}
                </button>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleExportPDF}
                  disabled={cargandoExport}
                >
                  <i className="bi bi-file-earmark-pdf me-1 text-danger"></i>
                  {cargandoExport ? 'Generando...' : 'Exportar PDF'}
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-2 align-items-end mb-3">
              <div className="col-md-6">
                <label className="form-label">Estudiante</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 0102030405 o Juan"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button className="btn btn-info w-100" onClick={buscarHistorial} disabled={cargandoHistorial}>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </button>
              </div>
            </div>

            {cargandoHistorial && (
              <div className="text-center my-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            )}

            {!cargandoHistorial && resultadosBusqueda.length > 1 && (
              <div className="table-responsive mb-3">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Curso</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosBusqueda.map((est) => (
                      <tr key={est.id}>
                        <td>{est.nombre}</td>
                        <td>{est.cedula}</td>
                        <td>{est.cursoId || 'N/A'}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => seleccionarEstudiante(est)}>
                            Ver historial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {historial && (
              <div>
                <div className="alert alert-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{historial.estudiante?.nombre}</strong> ({historial.estudiante?.cedula})
                    {historial.estudiante?.cursoId && <span className="ms-2">Curso: {historial.estudiante.cursoId}</span>}
                  </div>
                  <span className={`badge ${badgeEstado(historial.resumen?.estadoSemestre)}`}>
                    {historial.resumen?.estadoSemestre || 'pendiente'}
                  </span>
                </div>

                {historial.asignaturas?.length === 0 && (
                  <p className="text-muted mb-0">Sin notas registradas.</p>
                )}

                {historial.asignaturas?.map((asig) => (
                  <div key={asig.asignaturaId} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">{asig.asignaturaNombre}</h6>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => verResumenAsignatura(asig)}
                        disabled={cargandoResumen}
                      >
                        <i className="bi bi-clipboard-data me-1"></i>
                        Ver resumen
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Parcial</th>
                            <th>Tarea</th>
                            <th>Informe</th>
                            <th>Lección</th>
                            <th>Examen</th>
                            <th>Nota final</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3].map((num) => {
                            const parcial = asig.parciales[num];
                            return (
                              <tr key={num}>
                                <td>Parcial {num}</td>
                                <td>{parcial?.tarea ?? '-'}</td>
                                <td>{parcial?.informe ?? '-'}</td>
                                <td>{parcial?.leccion ?? '-'}</td>
                                <td>{parcial?.examen ?? '-'}</td>
                                <td>{parcial?.notaFinal ?? '-'}</td>
                                <td>
                                  {parcial ? (
                                    <span className={`badge ${badgeEstado(parcial.estado)}`}>
                                      {parcial.estado || 'pendiente'}
                                    </span>
                                  ) : (
                                    <span className="text-muted">Sin registro</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {resumenSeleccionado && resumenSeleccionado.asignaturaId === asig.asignaturaId && (
                      <div className="mt-2 p-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Resumen de semestre</strong>
                          {cargandoResumen && (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          )}
                        </div>
                        <div className="row g-2">
                          <div className="col-md-3"><small className="text-muted">Parcial 1</small><div>{resumenSeleccionado.data?.resumen?.notaParcial1 ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Parcial 2</small><div>{resumenSeleccionado.data?.resumen?.notaParcial2 ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Parcial 3</small><div>{resumenSeleccionado.data?.resumen?.notaParcial3 ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Promedio</small><div>{resumenSeleccionado.data?.resumen?.promedioFinal ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Suma P1+P2</small><div>{resumenSeleccionado.data?.resumen?.sumaParcial1y2 ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Suma 3 parciales</small><div>{resumenSeleccionado.data?.resumen?.suma3Parciales ?? '-'}</div></div>
                          <div className="col-md-3"><small className="text-muted">Estado</small><div><span className={`badge ${badgeEstado(resumenSeleccionado.data?.resumen?.estadoSemestre)}`}>{resumenSeleccionado.data?.resumen?.estadoSemestre || 'pendiente'}</span></div></div>
                          <div className="col-md-12"><small className="text-muted">Mensaje</small><div>{resumenSeleccionado.data?.resumen?.mensajeEstado || 'Sin mensaje'}</div></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!esEstudiante && (
        <div className="card mb-4">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Filtros</h5>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); cargarNotasConFiltros(); }}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Estudiante</label>
                  <select
                    className="form-select"
                    value={filtros.estudianteId}
                    onChange={(e) => setFiltros({ ...filtros, estudianteId: e.target.value })}
                  >
                    <option value="">Todos</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>{est.nombre}</option>
                    ))}
                  </select>
                </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Parcial</label>
                <select
                  className="form-select"
                  value={filtros.parcial}
                  onChange={(e) => setFiltros({ ...filtros, parcial: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="1">Parcial 1</option>
                  <option value="2">Parcial 2</option>
                  <option value="3">Parcial 3</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Ordenar Por</label>
                <select
                  className="form-select"
                  value={filtros.ordenar}
                  onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                >
                  <option value="reciente">Más reciente</option>
                  <option value="mayor">Mayor nota</option>
                  <option value="menor">Menor nota</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn btn-outline-secondary w-100">
                  <i className="bi bi-search"></i> Filtrar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      )}

      {!esEstudiante && cargando ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : !esEstudiante && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Estudiante</th>
                  <th>Asignatura</th>
                  <th>Docente</th>
                  <th>Parcial</th>
                  <th>Tarea</th>
                  <th>Informe</th>
                  <th>Lección</th>
                  <th>Examen</th>
                  <th>Nota Final</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notas.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center text-muted py-4">
                      No hay notas registradas
                    </td>
                  </tr>
                ) : (
                  notas.map((nota) => (
                    <tr key={nota.id}>
                      <td>{nota.id}</td>
                      <td>{nota.Estudiante?.nombre || 'N/A'}</td>
                      <td>{nota.Asignatura?.nombre || 'N/A'}</td>
                      <td>{nota.Docente?.nombre || 'N/A'}</td>
                      <td>Parcial {nota.parcial}</td>
                      <td>{nota.tarea}</td>
                      <td>{nota.informe}</td>
                      <td>{nota.leccion}</td>
                      <td>{nota.examen}</td>
                      <td>
                        <span className="badge bg-info">
                          {nota.notaFinal || calcularNotaFinal(nota.tarea, nota.informe, nota.leccion, nota.examen)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditar(nota)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(nota)}
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
        title="Eliminar Nota"
        message={`¿Está seguro de que desea eliminar esta nota?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
}
