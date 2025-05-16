document.addEventListener('DOMContentLoaded', () => {
    // Mostrar solo la sección seleccionada y ocultar las demás
    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none'); 
        document.getElementById(sectionId).style.display = 'block';
    }

    // Cargar lista de doctores
    function fetchDoctors() {
        fetch('/doctores')
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('doctorList');
                list.innerHTML = '';
                data.forEach(doc => {
                    const li = document.createElement('li');
                    li.textContent = `${doc.nombre} ${doc.apellido} - Especialidad: ${doc.especialidad}`;
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Cargar lista de pacientes
    function fetchPatients() {
        fetch('/pacientes')
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('patientList');
                list.innerHTML = '';
                data.forEach(pac => {
                    const li = document.createElement('li');
                    li.textContent = `${pac.nombre} ${pac.apellido} - Tipo Afiliación: ${pac.tipo_afiliacion}`;
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Cargar lista de citas
    function fetchCitas() {
        fetch('/citas')
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('citaList');
                list.innerHTML = '';
                data.forEach(cita => {
                    const li = document.createElement('li');
                    li.textContent = `Cita ID: ${cita.id_cita} - Paciente: ${cita.paciente} - Doctor: ${cita.doctor} - Unidad: ${cita.unidad} - Fecha: ${cita.fecha_cita} - Hora: ${cita.hora_cita}`;
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Cargar lista de consultas
    function fetchConsultas() {
        fetch('/consultas')
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('consultaList');
                list.innerHTML = '';
                data.forEach(consulta => {
                    const li = document.createElement('li');
                    li.textContent = `Consulta ID: ${consulta.id_consulta} - Paciente: ${consulta.paciente} - Doctor: ${consulta.doctor} - Fecha Atención: ${consulta.fecha_atencion} - Síntomas: ${consulta.sintomas} - Tratamiento: ${consulta.tratamiento}`;
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Formulario paciente
    const formPaciente = document.getElementById('formPaciente');
    const mensajePaciente = document.getElementById('mensajePaciente');
    formPaciente.addEventListener('submit', function(event) {
        event.preventDefault();
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => {
            if(response.ok) {
                mensajePaciente.textContent = 'Paciente guardado exitosamente.';
                formPaciente.reset();
            } else {
                mensajePaciente.textContent = 'Error al guardar paciente.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajePaciente.textContent = 'Error de conexión.';
        });
    });

    // Formulario doctor
    const formDoctor = document.getElementById('formDoctor');
    const mensajeDoctor = document.getElementById('mensajeDoctor');
    formDoctor.addEventListener('submit', function(event) {
        event.preventDefault();
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => {
            if(response.ok) {
                mensajeDoctor.textContent = 'Doctor guardado exitosamente.';
                formDoctor.reset();
            } else {
                mensajeDoctor.textContent = 'Error al guardar doctor.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeDoctor.textContent = 'Error de conexión.';
        });
    });

    // Formulario cita
    const formCita = document.getElementById('formCita');
    const mensajeCita = document.getElementById('mensajeCita');
    formCita.addEventListener('submit', function(event) {
        event.preventDefault();
        const data = {
            id_paciente: parseInt(document.getElementById('idPaciente').value),
            id_doctor: parseInt(document.getElementById('idDoctor').value),
            id_unidad: parseInt(document.getElementById('idUnidad').value),
            fecha_cita: document.getElementById('fechaCita').value,
            hora_cita: document.getElementById('horaCita').value
        };
        fetch('/citas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => {
            if(response.ok) {
                mensajeCita.textContent = 'Cita guardada exitosamente.';
                formCita.reset();
            } else {
                response.json().then(data => {
                    mensajeCita.textContent = data.error || 'Error al guardar cita.';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeCita.textContent = 'Error de conexión.';
        });
    });

    // Formulario consulta
    const formConsulta = document.getElementById('formConsulta');
    const mensajeConsulta = document.getElementById('mensajeConsulta');
    formConsulta.addEventListener('submit', function(event) {
        event.preventDefault();
        const data = {
            id_cita: parseInt(document.getElementById('idCita').value),
            fecha_atencion: document.getElementById('fechaAtencion').value,
            sintomas: document.getElementById('sintomas').value,
            tratamiento: document.getElementById('tratamiento').value
        };
        fetch('/consultas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => {
            if(response.ok) {
                mensajeConsulta.textContent = 'Consulta registrada exitosamente.';
                formConsulta.reset();
            } else {
                mensajeConsulta.textContent = 'Error al registrar consulta.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeConsulta.textContent = 'Error de conexión.';
        });
    });

      // Nueva funcionalidad: consultar citas por doctor y fecha
    const formConsultarCitas = document.getElementById('formConsultarCitas');
    const listaCitasDoctor = document.getElementById('listaCitasDoctor');

    formConsultarCitas.addEventListener('submit', function(event) {
        event.preventDefault();
        const idDoctor = document.getElementById('doctorIdConsulta').value;
        const fecha = document.getElementById('fechaConsulta').value;

        fetch(`/citas/doctor/${idDoctor}/fecha/${fecha}`)
        .then(response => response.json())
        .then(data => {
            listaCitasDoctor.innerHTML = '';
            if (data.error) {
                listaCitasDoctor.innerHTML = `<li>Error: ${data.error}</li>`;
                return;
            }
            if (data.length === 0) {
                listaCitasDoctor.innerHTML = '<li>No hay citas para esa fecha.</li>';
                return;
            }
            data.forEach(cita => {
                const li = document.createElement('li');
                li.textContent = `Cita ${cita.id_cita}: Paciente ${cita.paciente_nombre} ${cita.paciente_apellido}, Unidad: ${cita.unidad_nombre}, Hora: ${cita.hora_cita}`;
                listaCitasDoctor.appendChild(li);
            });
        })
        .catch(error => {
            listaCitasDoctor.innerHTML = `<li>Error de conexión: ${error}</li>`;
        });
    });


    // Exponer funciones globalmente para el HTML
    window.showSection = showSection;
    window.fetchDoctors = fetchDoctors;
    window.fetchPatients = fetchPatients;
    window.fetchCitas = fetchCitas;
    window.fetchConsultas = fetchConsultas;

    // Mostrar sección por defecto
    showSection('doctores');
});
