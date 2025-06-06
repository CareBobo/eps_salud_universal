document.addEventListener('DOMContentLoaded', () => {
    // Variables para controlar sesión y tipo de usuario
    let usuarioTipo = null; // 'doctor' o 'paciente'
    let usuarioId = null;

    // Referencias a elementos importantes
    const loginSection = document.getElementById('loginSection');
    const mainContent = document.querySelector('main');
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const logoutBtn = document.getElementById('logoutBtn');

    // Oculta todo excepto login al inicio
    function iniciarSesion() {
        loginSection.style.display = 'block';
        mainContent.style.display = 'none';
        sidebarLinks.forEach(link => link.style.display = 'none');
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    // Mostrar sección y ocultar otras
    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        const seccion = document.getElementById(sectionId);
        if (seccion) seccion.style.display = 'block';
    }

    // Mostrar menú lateral con opciones según tipo usuario
    function mostrarMenuSegunUsuario() {
        loginSection.style.display = 'none';
        mainContent.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';

        sidebarLinks.forEach(link => link.style.display = 'none'); // ocultar todas

        if (usuarioTipo === 'doctor') {
            // Opciones permitidas para doctor
            const idsPermitidos = [
                'doctores', 'pacientes', 'citas', 'consultas', 'unidades',
                'agregarCita', 'agregarConsulta', 'consultarCitasDoctor', 'historiaClinica'
            ];
            sidebarLinks.forEach(link => {
                if (idsPermitidos.includes(link.getAttribute('onclick').match(/'([^']+)'/)[1])) {
                    link.style.display = 'block';
                }
            });
            showSection('doctores'); // sección inicial para doctor
        } else if (usuarioTipo === 'paciente') {
            // Opciones permitidas para paciente
            const idsPermitidos = [
                'pacientes', 'citas', 'consultarCitasDoctor', 'historiaClinica'
            ];
            sidebarLinks.forEach(link => {
                if (idsPermitidos.includes(link.getAttribute('onclick').match(/'([^']+)'/)[1])) {
                    link.style.display = 'block';
                }
            });
            showSection('pacientes'); // sección inicial para paciente
        }
    }

    // Manejar el submit del formulario login
    const formLogin = document.getElementById('formLogin');
    const loginMensaje = document.getElementById('loginMensaje');
    formLogin.addEventListener('submit', e => {
        e.preventDefault();

        const tipo = document.getElementById('loginTipo').value; // 'doctor' o 'paciente'
        const identificacion = document.getElementById('loginIdentificacion').value;
        const contrasena = document.getElementById('loginContrasena').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, identificacion, contrasena })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    loginMensaje.textContent = data.error;
                    loginMensaje.style.color = 'red';
                } else {
                    usuarioTipo = tipo;
                    usuarioId = data.id;
                    loginMensaje.textContent = '';
                    mostrarMenuSegunUsuario();
                }
            })
            .catch(err => {
                loginMensaje.textContent = 'Error de conexión';
                loginMensaje.style.color = 'red';
                console.error(err);
            });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            usuarioTipo = null;
            usuarioId = null;
            iniciarSesion();
        });
    }

    // Funciones fetch para cargar datos (sin cambio respecto a tu código previo)

    function fetchDoctors() {
        fetch('/doctores')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('doctorList');
                list.innerHTML = '';
                data.forEach(doc => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `${doc.nombre} ${doc.apellido} - Especialidad: ${doc.especialidad}`;
                    list.appendChild(li);
                });
            })
            .catch(e => console.error(e));
    }

    function fetchPatients() {
        fetch('/pacientes')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('patientList');
                list.innerHTML = '';
                data.forEach(pac => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `${pac.nombre} ${pac.apellido} - Tipo Afiliación: ${pac.tipo_afiliacion}`;
                    list.appendChild(li);
                });
            })
            .catch(e => console.error(e));
    }

    function fetchCitas() {
        fetch('/citas')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('citaList');
                list.innerHTML = '';
                data.forEach(cita => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `Cita ID: ${cita.id_cita} - Paciente: ${cita.paciente} - Doctor: ${cita.doctor} - Unidad: ${cita.unidad} - Fecha: ${cita.fecha_cita} - Hora: ${cita.hora_cita}`;
                    list.appendChild(li);
                });
            })
            .catch(e => console.error(e));
    }

    function fetchConsultas() {
        fetch('/consultas')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('consultaList');
                list.innerHTML = '';
                data.forEach(consulta => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `Consulta ID: ${consulta.id_consulta} - Paciente: ${consulta.paciente} - Doctor: ${consulta.doctor} - Fecha Atención: ${consulta.fecha_atencion} - Síntomas: ${consulta.sintomas} - Tratamiento: ${consulta.tratamiento}`;
                    list.appendChild(li);
                });
            })
            .catch(e => console.error(e));
    }

    function fetchUnidades() {
        fetch('/unidades')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('unidadList');
                list.innerHTML = '';
                data.forEach(unidad => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `ID: ${unidad.id_unidad} - ${unidad.nombre} - Planta: ${unidad.planta} - Doctor responsable ID: ${unidad.id_doctor_responsable}`;
                    list.appendChild(li);
                });
            })
            .catch(err => console.error(err));
    }

    // Manejo formularios crear paciente, doctor, cita, consulta, unidad (sin cambios)

    const formPaciente = document.getElementById('formPaciente');
    const mensajePaciente = document.getElementById('mensajePaciente');
    formPaciente.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            identificacion: document.getElementById('identificacion').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            direccion: document.getElementById('direccion').value,
            edad: parseInt(document.getElementById('edad').value),
            tipo_afiliacion: document.getElementById('tipoAfiliacion').value,
            fecha_ingreso: document.getElementById('fechaIngreso').value,
            contrasena: document.getElementById('contrasena').value
        };
        fetch('/pacientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    mensajePaciente.textContent = 'Paciente guardado exitosamente.';
                    formPaciente.reset();
                } else {
                    mensajePaciente.textContent = 'Error al guardar paciente.';
                }
            })
            .catch(err => {
                mensajePaciente.textContent = 'Error de conexión.';
                console.error(err);
            });
    });

    const formDoctor = document.getElementById('formDoctor');
    const mensajeDoctor = document.getElementById('mensajeDoctor');
    formDoctor.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            identificacion: document.getElementById('docIdentificacion').value,
            nombre: document.getElementById('docNombre').value,
            apellido: document.getElementById('docApellido').value,
            direccion: document.getElementById('docDireccion').value,
            telefono: document.getElementById('docTelefono').value,
            especialidad: document.getElementById('docEspecialidad').value,
            jornada_laboral: document.getElementById('docJornada').value,
            contraseña: document.getElementById('docContrasena').value
        };
        fetch('/doctores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    mensajeDoctor.textContent = 'Doctor guardado exitosamente.';
                    formDoctor.reset();
                } else {
                    mensajeDoctor.textContent = 'Error al guardar doctor.';
                }
            })
            .catch(err => {
                mensajeDoctor.textContent = 'Error de conexión.';
                console.error(err);
            });
    });

    const formCita = document.getElementById('formCita');
    const mensajeCita = document.getElementById('mensajeCita');
    formCita.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            id_paciente: parseInt(document.getElementById('idPaciente').value),
            id_doctor: parseInt(document.getElementById('idDoctor').value),
            id_unidad: parseInt(document.getElementById('idUnidad').value),
            fecha_cita: document.getElementById('fechaCita').value,
            hora_cita: document.getElementById('horaCita').value
        };
        fetch('/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    mensajeCita.textContent = 'Cita guardada exitosamente.';
                    formCita.reset();
                } else {
                    response.json().then(data => {
                        mensajeCita.textContent = data.error || 'Error al guardar cita.';
                    });
                }
            })
            .catch(err => {
                mensajeCita.textContent = 'Error de conexión.';
                console.error(err);
            });
    });

    const formConsulta = document.getElementById('formConsulta');
    const mensajeConsulta = document.getElementById('mensajeConsulta');
    formConsulta.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            id_cita: parseInt(document.getElementById('idCita').value),
            fecha_atencion: document.getElementById('fechaAtencion').value,
            sintomas: document.getElementById('sintomas').value,
            tratamiento: document.getElementById('tratamiento').value
        };
        fetch('/consultas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    mensajeConsulta.textContent = 'Consulta registrada exitosamente.';
                    formConsulta.reset();
                } else {
                    mensajeConsulta.textContent = 'Error al registrar consulta.';
                }
            })
            .catch(err => {
                mensajeConsulta.textContent = 'Error de conexión.';
                console.error(err);
            });
    });

    const formUnidad = document.getElementById('formUnidad');
    const mensajeUnidad = document.getElementById('mensajeUnidad');
    formUnidad.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('unidadNombre').value,
            planta: document.getElementById('unidadPlanta').value,
            id_doctor_responsable: parseInt(document.getElementById('unidadDoctorId').value)
        };
        fetch('/unidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    mensajeUnidad.textContent = 'Unidad guardada exitosamente.';
                    formUnidad.reset();
                } else {
                    mensajeUnidad.textContent = 'Error al guardar unidad.';
                }
            })
            .catch(err => {
                mensajeUnidad.textContent = 'Error de conexión.';
                console.error(err);
            });
    });

    // Historia clínica
    const formHistoriaClinica = document.getElementById('formHistoriaClinica');
    const listaHistoriaClinica = document.getElementById('listaHistoriaClinica');
    formHistoriaClinica.addEventListener('submit', e => {
        e.preventDefault();
        const idPaciente = document.getElementById('historiaPacienteId').value;
        fetch(`/historia_clinica/${idPaciente}`)
            .then(res => res.json())
            .then(data => {
                listaHistoriaClinica.innerHTML = '';
                if (data.error) {
                    listaHistoriaClinica.innerHTML = `<li class="list-group-item text-danger">Error: ${data.error}</li>`;
                    return;
                }
                if (data.length === 0) {
                    listaHistoriaClinica.innerHTML = '<li class="list-group-item">No se encontraron registros para este paciente.</li>';
                    return;
                }
                data.forEach(reg => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.innerHTML = `
            <strong>Fecha Atención:</strong> ${reg.fecha_atencion} <br>
            <strong>Doctor:</strong> ${reg.doctor_nombre} ${reg.doctor_apellido} <br>
            <strong>Unidad:</strong> ${reg.unidad_nombre} <br>
            <strong>Síntomas:</strong> ${reg.sintomas} <br>
            <strong>Tratamiento:</strong> ${reg.tratamiento}
          `;
                    listaHistoriaClinica.appendChild(li);
                });
            })
            .catch(err => {
                listaHistoriaClinica.innerHTML = `<li class="list-group-item text-danger">Error de conexión: ${err}</li>`;
            });
    });

    // Consultar citas por doctor y fecha
    const formConsultarCitas = document.getElementById('formConsultarCitas');
    const listaCitasDoctor = document.getElementById('listaCitasDoctor');
    formConsultarCitas.addEventListener('submit', e => {
        e.preventDefault();
        const idDoctor = document.getElementById('doctorIdConsulta').value;
        const fecha = document.getElementById('fechaConsulta').value;
        fetch(`/citas/doctor/${idDoctor}/fecha/${fecha}`)
            .then(res => res.json())
            .then(data => {
                listaCitasDoctor.innerHTML = '';
                if (data.error) {
                    listaCitasDoctor.innerHTML = `<li class="list-group-item text-danger">Error: ${data.error}</li>`;
                    return;
                }
                if (data.length === 0) {
                    listaCitasDoctor.innerHTML = '<li class="list-group-item">No hay citas para esa fecha.</li>';
                    return;
                }
                data.forEach(cita => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');
                    li.textContent = `Cita ${cita.id_cita}: Paciente ${cita.paciente_nombre} ${cita.paciente_apellido}, Unidad: ${cita.unidad_nombre}, Hora: ${cita.hora_cita}`;
                    listaCitasDoctor.appendChild(li);
                });
            })
            .catch(err => {
                listaCitasDoctor.innerHTML = `<li class="list-group-item text-danger">Error de conexión: ${err}</li>`;
            });
    });

    // Exponer funciones globales para HTML
    window.showSection = showSection;
    window.fetchDoctors = fetchDoctors;
    window.fetchPatients = fetchPatients;
    window.fetchCitas = fetchCitas;
    window.fetchConsultas = fetchConsultas;
    window.fetchHistoriaClinica = () => formHistoriaClinica.dispatchEvent(new Event('submit'));
    window.fetchCitasPorDoctor = () => formConsultarCitas.dispatchEvent(new Event('submit'));
    window.fetchUnidades = fetchUnidades;

    // Mostrar sección por defecto
    showSection('doctores');
});
