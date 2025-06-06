document.addEventListener('DOMContentLoaded', () => {
    // Mostrar solo la sección indicada
    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        const sec = document.getElementById(sectionId);
        if (sec) sec.style.display = 'block';
    }

    // --- Consultar Citas por Doctor y Fecha ---
    const formConsultarCitas = document.getElementById('formConsultarCitas');
    const listaCitasDoctor = document.getElementById('listaCitasDoctor');

    if (formConsultarCitas) {
        formConsultarCitas.addEventListener('submit', function (e) {
            e.preventDefault();
            const doctorId = document.getElementById('doctorIdConsulta').value;
            const fecha = document.getElementById('fechaConsulta').value;
            if (!doctorId || !fecha) return;

            fetch(`/citas/doctor/${doctorId}/fecha/${fecha}`)
                .then(res => res.json())
                .then(data => {
                    listaCitasDoctor.innerHTML = '';
                    if (!Array.isArray(data) || data.length === 0) {
                        listaCitasDoctor.innerHTML = '<li class="list-group-item">No hay citas para este doctor en esa fecha.</li>';
                        return;
                    }
                    data.forEach(cita => {
                        const li = document.createElement('li');
                        li.classList.add('list-group-item');
                        li.textContent = `ID: ${cita.id_cita} - Paciente: ${cita.paciente} - Unidad: ${cita.unidad} - Fecha: ${cita.fecha_cita} - Hora: ${cita.hora_cita}`;
                        listaCitasDoctor.appendChild(li);
                    });
                })
                .catch(err => {
                    listaCitasDoctor.innerHTML = '<li class="list-group-item text-danger">Error al consultar citas.</li>';
                    console.error(err);
                });
        });
    }

    // --- Doctores ---
    function fetchDoctors() {
        fetch('/doctores')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('doctorList');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(doc => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        ${doc.nombre} ${doc.apellido} - Especialidad: ${doc.especialidad}
                        <span>
                            <button class="btn btn-sm btn-warning me-2" onclick="editDoctor(${doc.id_doctor})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doc.id_doctor})">Eliminar</button>
                        </span>
                    `;
                    list.appendChild(li);
                });
            })
            .catch(console.error);
    }

    function editDoctor(id) {
        fetch(`/doctores/${id}`)
            .then(res => res.json())
            .then(doc => {
                document.getElementById('docIdentificacion').value = doc.identificacion || '';
                document.getElementById('docNombre').value = doc.nombre || '';
                document.getElementById('docApellido').value = doc.apellido || '';
                document.getElementById('docDireccion').value = doc.direccion || '';
                document.getElementById('docTelefono').value = doc.telefono || '';
                document.getElementById('docEspecialidad').value = doc.especialidad || '';
                document.getElementById('docJornada').value = doc.jornada_laboral || 'Matinal';
                document.getElementById('docContrasena').value = doc.contraseña || '';
                formDoctor.dataset.editingId = id;
                mensajeDoctor.textContent = 'Editando doctor ID ' + id;
            })
            .catch(console.error);
    }

    function deleteDoctor(id) {
        if (!confirm('¿Seguro que deseas eliminar este doctor?')) return;
        fetch(`/doctores/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    mensajeDoctor.textContent = 'Doctor eliminado correctamente.';
                    fetchDoctors();
                    if (formDoctor.dataset.editingId == id) {
                        formDoctor.reset();
                        delete formDoctor.dataset.editingId;
                    }
                } else {
                    res.json().then(d => {
                        mensajeDoctor.textContent = d.error || 'Error al eliminar doctor.';
                    });
                }
            })
            .catch(err => {
                mensajeDoctor.textContent = 'Error de conexión.';
                console.error(err);
            });
    }

    const formDoctor = document.getElementById('formDoctor');
    const mensajeDoctor = document.getElementById('mensajeDoctor');
    if (formDoctor) {
        formDoctor.addEventListener('submit', e => {
            e.preventDefault();
            const id = formDoctor.dataset.editingId;
            const data = {
                identificacion: document.getElementById('docIdentificacion').value,
                nombre: document.getElementById('docNombre').value,
                apellido: document.getElementById('docApellido').value,
                direccion: document.getElementById('docDireccion').value,
                telefono: document.getElementById('docTelefono').value,
                especialidad: document.getElementById('docEspecialidad').value,
                jornada_laboral: document.getElementById('docJornada').value,
                contrasena: document.getElementById('docContrasena').value
            };
            let url = '/doctores';
            let method = 'POST';
            if (id) {
                url = `/doctores/${id}`;
                method = 'PUT';
            }
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include' // <-- Esto es clave
            })
                .then(res => {
                    if (res.ok) {
                        mensajeDoctor.textContent = id ? 'Doctor actualizado exitosamente.' : 'Doctor guardado exitosamente.';
                        formDoctor.reset();
                        delete formDoctor.dataset.editingId;
                        fetchDoctors();
                    } else {
                        res.json().then(d => {
                            mensajeDoctor.textContent = d.error || 'Error al guardar doctor.';
                        });
                    }
                })
                .catch(err => {
                    mensajeDoctor.textContent = 'Error de conexión.';
                    console.error(err);
                });
        });
    }

    // --- Pacientes ---
    function fetchPatients() {
        fetch('/pacientes')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('patientList');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(pac => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        ${pac.nombre} ${pac.apellido} - Tipo Afiliación: ${pac.tipo_afiliacion || ''}
                        <span>
                            <button class="btn btn-sm btn-warning me-2" onclick="editPaciente(${pac.id_paciente})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deletePaciente(${pac.id_paciente})">Eliminar</button>
                        </span>
                    `;
                    list.appendChild(li);
                });
            })
            .catch(console.error);
    }

    function editPaciente(id) {
        fetch(`/pacientes/${id}`)
            .then(res => res.json())
            .then(pac => {
                document.getElementById('identificacion').value = pac.identificacion || '';
                document.getElementById('nombre').value = pac.nombre || '';
                document.getElementById('apellido').value = pac.apellido || '';
                document.getElementById('direccion').value = pac.direccion || '';
                document.getElementById('edad').value = pac.edad || '';
                document.getElementById('tipoAfiliacion').value = pac.tipo_afiliacion || '';
                document.getElementById('fechaIngreso').value = pac.fecha_ingreso || '';
                document.getElementById('pacContrasena').value = pac.contraseña || '';
                formPaciente.dataset.editingId = id;
                mensajePaciente.textContent = 'Editando paciente ID ' + id;
            })
            .catch(console.error);
    }

    function deletePaciente(id) {
        if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
        fetch(`/pacientes/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    mensajePaciente.textContent = 'Paciente eliminado correctamente.';
                    fetchPatients();
                    if (formPaciente.dataset.editingId == id) {
                        formPaciente.reset();
                        delete formPaciente.dataset.editingId;
                    }
                } else {
                    res.json().then(d => {
                        mensajePaciente.textContent = d.error || 'Error al eliminar paciente.';
                    });
                }
            })
            .catch(err => {
                mensajePaciente.textContent = 'Error de conexión.';
                console.error(err);
            });
    }

    const formPaciente = document.getElementById('formPaciente');
    const mensajePaciente = document.getElementById('mensajePaciente');
    if (formPaciente) {
        formPaciente.addEventListener('submit', e => {
            e.preventDefault();
            const id = formPaciente.dataset.editingId;
            const data = {
                identificacion: document.getElementById('identificacion').value,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                direccion: document.getElementById('direccion').value,
                edad: parseInt(document.getElementById('edad').value) || null,
                tipo_afiliacion: document.getElementById('tipoAfiliacion').value,
                fecha_ingreso: document.getElementById('fechaIngreso').value,
                contrasena: document.getElementById('pacContrasena').value
            };
            let url = '/pacientes';
            let method = 'POST';
            if (id) {
                url = `/pacientes/${id}`;
                method = 'PUT';
            }
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) {
                        mensajePaciente.textContent = id ? 'Paciente actualizado exitosamente.' : 'Paciente guardado exitosamente.';
                        formPaciente.reset();
                        delete formPaciente.dataset.editingId;
                        fetchPatients();
                    } else {
                        res.json().then(d => {
                            mensajePaciente.textContent = d.error || 'Error al guardar paciente.';
                        });
                    }
                })
                .catch(() => {
                    mensajePaciente.textContent = 'Error de conexión.';

                });
        });
    }
    // --- Unidades ---
    function fetchUnidades() {
        fetch('/unidades')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('unidadList');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(unidad => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        ID: ${unidad.id_unidad} - ${unidad.nombre} - Planta: ${unidad.planta} - Doctor responsable ID: ${unidad.id_doctor_responsable}
                        <span>
                            <button class="btn btn-sm btn-warning me-2" onclick="editUnidad(${unidad.id_unidad})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUnidad(${unidad.id_unidad})">Eliminar</button>
                        </span>
                    `;
                    list.appendChild(li);
                });
            })
            .catch(console.error);
    }

    function editUnidad(id) {
        fetch(`/unidades/${id}`)
            .then(res => res.json())
            .then(unidad => {
                document.getElementById('unidadNombre').value = unidad.nombre || '';
                document.getElementById('unidadPlanta').value = unidad.planta || '';
                document.getElementById('unidadDoctorId').value = unidad.id_doctor_responsable || '';
                formUnidad.dataset.editingId = id;
                mensajeUnidad.textContent = 'Editando unidad ID ' + id;
            })
            .catch(console.error);
    }

    function deleteUnidad(id) {
        if (!confirm('¿Seguro que deseas eliminar esta unidad?')) return;
        fetch(`/unidades/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    mensajeUnidad.textContent = 'Unidad eliminada correctamente.';
                    fetchUnidades();
                    if (formUnidad.dataset.editingId == id) {
                        formUnidad.reset();
                        delete formUnidad.dataset.editingId;
                    }
                } else {
                    res.json().then(d => {
                        mensajeUnidad.textContent = d.error || 'Error al eliminar unidad.';
                    });
                }
            })
            .catch(err => {
                mensajeUnidad.textContent = 'Error de conexión.';
                console.error(err);
            });
    }
    const formHistoriaClinica = document.getElementById('formHistoriaClinica');
    const listaHistoriaClinica = document.getElementById('listaHistoriaClinica');

    if (formHistoriaClinica) {
        formHistoriaClinica.addEventListener('submit', async function (e) {
            e.preventDefault();
            const idPaciente = document.getElementById('historiaPacienteId').value;
            if (!idPaciente) return;
            listaHistoriaClinica.innerHTML = '';
            try {
                const res = await fetch(`/historias/${idPaciente}`);
                if (!res.ok) {
                    listaHistoriaClinica.innerHTML = '<li class="list-group-item bg-danger text-white">No se encontró historia clínica para este paciente o error en la consulta.</li>';
                    return;
                }
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    listaHistoriaClinica.innerHTML = '<li class="list-group-item bg-warning text-dark">No hay registros de historia clínica.</li>';
                    return;
                }
                data.forEach(historia => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `ID: ${historia.id_historia} - Fecha: ${historia.fecha_creacion} - Descripción: ${historia.descripcion}`;
                    listaHistoriaClinica.appendChild(li);
                });
            } catch (error) {
                listaHistoriaClinica.innerHTML = '<li class="list-group-item bg-danger text-white">Error al consultar historia clínica.</li>';
                console.error(error);
            }
        });
    }



    const formUnidad = document.getElementById('formUnidad');
    const mensajeUnidad = document.getElementById('mensajeUnidad');
    if (formUnidad) {
        formUnidad.addEventListener('submit', e => {
            e.preventDefault();
            const id = formUnidad.dataset.editingId;
            const data = {
                nombre: document.getElementById('unidadNombre').value,
                planta: document.getElementById('unidadPlanta').value,
                id_doctor_responsable: parseInt(document.getElementById('unidadDoctorId').value)
            };
            let url = '/unidades';
            let method = 'POST';
            if (id) {
                url = `/unidades/${id}`;
                method = 'PUT';
            }
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) {
                        mensajeUnidad.textContent = id ? 'Unidad actualizada exitosamente.' : 'Unidad guardada exitosamente.';
                        formUnidad.reset();
                        delete formUnidad.dataset.editingId;
                        fetchUnidades();
                    } else {
                        res.json().then(d => {
                            mensajeUnidad.textContent = d.error || 'Error al guardar unidad.';
                        });
                    }
                })
                .catch(err => {
                    mensajeUnidad.textContent = 'Error de conexión.';
                    console.error(err);
                });
        });
    }

    // --- Citas (Paciente) ---
    function fetchCitas() {
        fetch('/citas')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('citaList');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(cita => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        ID: ${cita.id_cita} - Doctor: ${cita.doctor} - Unidad: ${cita.unidad} - Fecha: ${cita.fecha_cita} - Hora: ${cita.hora_cita}
                        <span>
                            <button class="btn btn-sm btn-warning me-2" onclick="editCita(${cita.id_cita})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCita(${cita.id_cita})">Eliminar</button>
                        </span>
                    `;
                    list.appendChild(li);
                });
            })
            .catch(console.error);
    }

    function editCita(id) {
        fetch(`/citas/${id}`)
            .then(res => res.json())
            .then(cita => {
                document.getElementById('citaId').value = cita.id_cita || '';
                document.getElementById('idDoctor').value = cita.id_doctor || '';
                document.getElementById('idUnidad').value = cita.id_unidad || '';
                document.getElementById('fechaCita').value = cita.fecha_cita || '';
                document.getElementById('horaCita').value = cita.hora_cita || '';
                formCita.dataset.editingId = id;
                mensajeCita.textContent = 'Editando cita ID ' + id;
                document.getElementById('cancelUpdateCita').style.display = 'inline-block';
                showSection('agendarCita');
            })
            .catch(console.error);
    }

    function deleteCita(id) {
        if (!confirm('¿Seguro que deseas eliminar esta cita?')) return;
        fetch(`/citas/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    mensajeCita.textContent = 'Cita eliminada correctamente.';
                    fetchCitas();
                    if (formCita.dataset.editingId == id) {
                        formCita.reset();
                        delete formCita.dataset.editingId;
                        document.getElementById('cancelUpdateCita').style.display = 'none';
                    }
                } else {
                    res.json().then(d => {
                        mensajeCita.textContent = d.error || 'Error al eliminar cita.';
                    });
                }
            })
            .catch(err => {
                mensajeCita.textContent = 'Error de conexión.';
                console.error(err);
            });
    }

    const formCita = document.getElementById('formCita');
    const mensajeCita = document.getElementById('mensajeCita');
    const btnCancelUpdateCita = document.getElementById('cancelUpdateCita');
    if (formCita) {
        formCita.addEventListener('submit', e => {
            e.preventDefault();

            const id = document.getElementById('citaId').value;  // Usamos input oculto en vez de dataset
            const userId = parseInt(document.getElementById('userIdHidden').value);
            const data = {
                id_paciente: userId,
                id_doctor: parseInt(document.getElementById('idDoctor').value),
                id_unidad: parseInt(document.getElementById('idUnidad').value),
                fecha_cita: document.getElementById('fechaCita').value,
                hora_cita: document.getElementById('horaCita').value
            };
            let url = '/citas';
            let method = 'POST';
            if (id) {  // Si hay id, se hace PUT (actualización)
                url = `/citas/${id}`;
                method = 'PUT';
            }
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include' // <-- Esto es lo importante
            })
                .then(res => {
                    if (res.ok) {
                        mensajeCita.textContent = id ? 'Cita actualizada exitosamente.' : 'Cita agendada exitosamente.';
                        formCita.reset();
                        document.getElementById('citaId').value = ''; // Limpia el id oculto
                        btnCancelUpdateCita.style.display = 'none';
                        fetchCitas();
                        showSection('citas');
                    } else {
                        res.json().then(d => {
                            mensajeCita.textContent = d.error || 'Error al guardar cita.';
                        });
                    }
                })
                .catch(err => {
                    mensajeCita.textContent = 'Error de conexión.';
                    console.error(err);
                });
        });

        btnCancelUpdateCita.addEventListener('click', () => {
            formCita.reset();
            document.getElementById('citaId').value = ''; // Limpia el id oculto al cancelar
            btnCancelUpdateCita.style.display = 'none';
            mensajeCita.textContent = '';
            showSection('citas');
        });
    }

    // --- Consultas (Doctor) ---
    function fetchConsultas() {
        fetch('/consultas')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('consultaList');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(cons => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                        ID: ${cons.id_consulta} - Paciente: ${cons.paciente} - Fecha: ${cons.fecha_atencion} - Síntomas: ${cons.sintomas}
                        <span>
                            <button class="btn btn-sm btn-warning me-2" onclick="editConsulta(${cons.id_consulta})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteConsulta(${cons.id_consulta})">Eliminar</button>
                        </span>
                    `;
                    list.appendChild(li);
                });
            })
            .catch(console.error);
    }

    function editConsulta(id) {
        fetch(`/consultas/${id}`)
            .then(res => res.json())
            .then(cons => {
                document.getElementById('idCita').value = cons.id_cita || '';
                document.getElementById('fechaAtencion').value = cons.fecha_atencion || '';
                document.getElementById('sintomas').value = cons.sintomas || '';
                document.getElementById('tratamiento').value = cons.tratamiento || '';
                formConsulta.dataset.editingId = id;
                mensajeConsulta.textContent = 'Editando consulta ID ' + id;
                showSection('agregarConsulta');
            })
            .catch(console.error);
    }

    function deleteConsulta(id) {
        if (!confirm('¿Seguro que deseas eliminar esta consulta?')) return;
        fetch(`/consultas/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    mensajeConsulta.textContent = 'Consulta eliminada correctamente.';
                    fetchConsultas();
                    if (formConsulta.dataset.editingId == id) {
                        formConsulta.reset();
                        delete formConsulta.dataset.editingId;
                    }
                } else {
                    res.json().then(d => {
                        mensajeConsulta.textContent = d.error || 'Error al eliminar consulta.';
                    });
                }
            })
            .catch(err => {
                mensajeConsulta.textContent = 'Error de conexión.';
                console.error(err);
            });
    }

    const formConsulta = document.getElementById('formConsulta');
    const mensajeConsulta = document.getElementById('mensajeConsulta');
    if (formConsulta) {
        formConsulta.addEventListener('submit', e => {
            e.preventDefault();
            const id = formConsulta.dataset.editingId;
            const data = {
                id_cita: parseInt(document.getElementById('idCita').value),
                fecha_atencion: document.getElementById('fechaAtencion').value,
                sintomas: document.getElementById('sintomas').value,
                tratamiento: document.getElementById('tratamiento').value
            };
            let url = '/consultas';
            let method = 'POST';
            if (id) {
                url = `/consultas/${id}`;
                method = 'PUT';
            }
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) {
                        mensajeConsulta.textContent = id ? 'Consulta actualizada exitosamente.' : 'Consulta registrada exitosamente.';
                        formConsulta.reset();
                        delete formConsulta.dataset.editingId;
                        fetchConsultas();
                        showSection('consultas');
                    } else {
                        mensajeConsulta.textContent = 'Error al registrar consulta.';
                    }
                })
                .catch(err => {
                    mensajeConsulta.textContent = 'Error de conexión.';
                    console.error(err);
                });
        });
    }

    // --- Agendar Historia Clínica ---
    const formHistoriaNueva = document.getElementById('formHistoriaNueva');
    const mensajeHistoriaNueva = document.getElementById('mensajeHistoriaNueva');

    if (formHistoriaNueva) {
        formHistoriaNueva.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = {
                id_paciente: document.getElementById('historiaNuevaPacienteId').value,
                fecha_creacion: document.getElementById('historiaNuevaFecha').value,
                descripcion: document.getElementById('historiaNuevaDescripcion').value
            };
            fetch('/historias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) {
                        mensajeHistoriaNueva.textContent = 'Historia clínica creada exitosamente.';
                        formHistoriaNueva.reset();
                    } else {
                        res.json().then(d => {
                            mensajeHistoriaNueva.textContent = d.error || 'Error al crear historia clínica.';
                        });
                    }
                })
                .catch(() => {
                    mensajeHistoriaNueva.textContent = 'Error de conexión.';
                });
        });
    }


    // Manejo de navegación entre secciones del dashboard
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.getAttribute('data-section');
            if (target) {
                showSection(target);

                // Cargar datos según la sección mostrada
                switch (target) {
                    case 'doctores': fetchDoctors(); break;
                    case 'pacientes': fetchPatients(); break;
                    case 'unidades': fetchUnidades(); break;
                    case 'citas': fetchCitas(); break;
                    case 'consultas': fetchConsultas(); break;
                    case 'agendarCita':
                        if (btnCancelUpdateCita) btnCancelUpdateCita.style.display = 'none';
                        break;
                    case 'agregarConsulta':
                        if (mensajeConsulta) mensajeConsulta.textContent = '';
                        if (formConsulta) {
                            formConsulta.reset();
                            delete formConsulta.dataset.editingId;
                        }
                        break;
                }
            }
        });
    });
    // Exportar funciones globales para que puedan ser llamadas desde HTML
    window.showSection = showSection;
    window.fetchDoctors = fetchDoctors;
    window.fetchPatients = fetchPatients;
    window.fetchUnidades = fetchUnidades;
    window.fetchCitas = fetchCitas;
    window.fetchConsultas = fetchConsultas;

    window.editDoctor = editDoctor;
    window.deleteDoctor = deleteDoctor;
    window.editPaciente = editPaciente;
    window.deletePaciente = deletePaciente;
    window.editUnidad = editUnidad;
    window.deleteUnidad = deleteUnidad;
    window.editCita = editCita;
    window.deleteCita = deleteCita;
    window.editConsulta = editConsulta;
    window.deleteConsulta = deleteConsulta;

    // Mostrar sección por defecto en dashboards
    showSection('doctores');
    fetchDoctors();
});

