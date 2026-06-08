/* mi base local */
let usuarioActual = null;
let pistaActiva = null;

// base de mi usuario admin
let usuariosRegistrados = JSON.parse(
  localStorage.getItem("usuarios_music"),
) || [
  {
    fullname: "Stefania Cardenas",
    email: "stefania@gmail.com",
    user: "admin",
    pass: "123",
  },
];

let favoritosUsuario =
  JSON.parse(localStorage.getItem("favoritos_music")) || {};
let canalesSuscritos = JSON.parse(localStorage.getItem("canales_music")) || {};
let lanzamientosSuscritos =
  JSON.parse(localStorage.getItem("lanzamientos_music")) || [];

function guardarEnLocalStorage() {
  localStorage.setItem("usuarios_music", JSON.stringify(usuariosRegistrados));
  localStorage.setItem("favoritos_music", JSON.stringify(favoritosUsuario));
  localStorage.setItem("canales_music", JSON.stringify(canalesSuscritos));
  localStorage.setItem(
    "lanzamientos_music",
    JSON.stringify(lanzamientosSuscritos),
  );
}

/* login y registro */
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // bloquea scroll inicial en el Login
  document.body.style.overflow = "hidden";

  // Validación de ingreso
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userIn = document.getElementById("login-user").value.trim();
      const passIn = document.getElementById("login-pass").value.trim();

      if (userIn === "" || passIn === "") {
        alert("Todos los campos son obligatorios.");
        return;
      }

      const usuarioValido = usuariosRegistrados.find(
        (u) => u.user === userIn && u.pass === passIn,
      );

      if (usuarioValido) {
        usuarioActual = usuarioValido;

        // dar bienvenida
        document.getElementById("saludo-usuario").innerText =
          `¡Bienvenido, ${usuarioActual.fullname}!`;

        // resttricción panel admin    //
        const menuAdmin = document.getElementById("menu-item-admin");
        if (usuarioActual.user === "admin") {
          menuAdmin.style.setProperty("display", "block", "important");
        } else {
          menuAdmin.style.setProperty("display", "none", "important");
        }

        // Ocultar login y registro
        document
          .getElementById("section-login")
          .style.setProperty("display", "none", "important");
        document
          .getElementById("section-register")
          .style.setProperty("display", "none", "important");

        // Quitar clase flex del body para que se acomode el contenido general
        document.body.classList.remove("body-login");
        document.body.style.overflow = "auto"; // Permitir scroll normal

        // Mostrar app y menú
        document.getElementById("app-content").style.display = "block";

        // carga datos del usuario
        actualizarInterfazLanzamientoBoton();
        renderizarFavoritos();
        renderizarTablaSuscripciones();
        renderizarTablaAdmin();

        showSection("section-home");
      } else {
        alert("Las credenciales ingresadas son incorrectas o no existen.");
      }
    });
  }

  // Registro de cuenta nueva
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullnameVal = document.getElementById("reg-fullname").value.trim();
      const emailVal = document.getElementById("reg-email").value.trim();
      const userVal = document.getElementById("reg-user").value.trim();
      const passVal = document.getElementById("reg-pass").value.trim();

      if (usuariosRegistrados.some((u) => u.user === userVal)) {
        alert("El nombre de usuario elegido ya existe.");
        return;
      }

      usuariosRegistrados.push({
        fullname: fullnameVal,
        email: emailVal,
        user: userVal,
        pass: passVal,
        fechaRegistro: new Date().toLocaleDateString(),
      });

      guardarEnLocalStorage();
      alert("¡Registro Exitoso! Ahora puedes iniciar sesión.");
      mostrarVistaAutenticacion("section-login");
    });
  }
});

// Cambiar entre la vista de Login y la de Registro
function mostrarVistaAutenticacion(vistaActiva) {
  const loginSec = document.getElementById("section-login");
  const registerSec = document.getElementById("section-register");

  if (vistaActiva === "section-register") {
    loginSec.style.setProperty("display", "none", "important");
    registerSec.style.setProperty("display", "flex", "important");
  } else {
    registerSec.style.setProperty("display", "none", "important");
    loginSec.style.setProperty("display", "flex", "important");
  }
}

function logout() {
  location.reload();
}

/* navegación */
function showSection(sectionId) {
  const sections = ["section-home", "section-library", "section-admin"];

  sections.forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) sec.style.display = "none";
  });

  const activeSec = document.getElementById(sectionId);
  if (activeSec) activeSec.style.display = "block";

  const navMapping = {
    "section-home": "nav-home",
    "section-library": "nav-library",
    "section-admin": "nav-admin",
  };

  Object.values(navMapping).forEach((navId) => {
    const navElem = document.getElementById(navId);
    if (navElem) navElem.classList.remove("active");
  });

  const activeNav = document.getElementById(navMapping[sectionId]);
  if (activeNav) activeNav.classList.add("active");
}

/* reproduccion de mis canciones*/
function reproducirYRegistrar(titulo, artista, imagen, audioId, boton) {
  const audioElemento = document.getElementById(audioId);
  const todosLosAudios = document.querySelectorAll("audio");
  const todosLosBotonesCircular = document.querySelectorAll(
    ".btn-accion-circular",
  );

  if (!audioElemento.paused) {
    audioElemento.pause();
    boton.innerHTML = '<i class="fas fa-play"></i>';
    pistaActiva = null;
    actualizarPanelReproduccionPopular();
    return;
  }

  todosLosAudios.forEach((audio) => audio.pause());
  todosLosBotonesCircular.forEach((btn) => {
    if (btn.querySelector(".fa-play") || btn.querySelector(".fa-pause")) {
      btn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  audioElemento
    .play()
    .then(() => {
      boton.innerHTML = '<i class="fas fa-pause"></i>';

      // Registramos la pista activa actual
      pistaActiva = { titulo, artista, imagen, audioId };
      actualizarPanelReproduccionPopular();
    })
    .catch((error) => {
      console.log("Audio local simulado:", error);

      // Simular reproducción si el archivo local no está presente en el hosting
      pistaActiva = { titulo, artista, imagen, audioId };
      actualizarPanelReproduccionPopular();
      alert(
        `Sin audio`,
      );
    });
}

function actualizarPanelReproduccionPopular() {
  const vacioPanel = document.getElementById("reproductor-vacio");
  const activoPanel = document.getElementById("reproductor-activo-panel");
  const imgRep = document.getElementById("reproductor-imagen");
  const titRep = document.getElementById("reproductor-titulo");
  const artRep = document.getElementById("reproductor-artista");

  if (!pistaActiva) {
    if (vacioPanel) vacioPanel.style.display = "block";
    if (activoPanel) activoPanel.style.display = "none";
  } else {
    if (vacioPanel) vacioPanel.style.display = "none";
    if (activoPanel) {
      activoPanel.style.display = "block";
      imgRep.src = pistaActiva.imagen;
      titRep.innerText = pistaActiva.titulo;
      artRep.innerText = pistaActiva.artista;
    }
  }
}

function pausarPistaActiva() {
  if (pistaActiva) {
    const audio = document.getElementById(pistaActiva.audioId);
    if (audio) {
      audio.pause();
    }
    pistaActiva = null;
    actualizarPanelReproduccionPopular();

    // Resetear iconos en el inicio
    const todosLosBotonesCircular = document.querySelectorAll(
      ".btn-accion-circular",
    );
    todosLosBotonesCircular.forEach((btn) => {
      if (btn.querySelector(".fa-pause")) {
        btn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });
  }
}

/* suscripcion de canales */
function toggleSuscripcionCanal(nombreCanal, imagenCanal, botonId) {
  if (!usuarioActual) return;
  const userKey = usuarioActual.user;

  if (!canalesSuscritos[userKey]) {
    canalesSuscritos[userKey] = [];
  }

  const index = canalesSuscritos[userKey].findIndex(
    (c) => c.nombre === nombreCanal,
  );

  if (index === -1) {
    canalesSuscritos[userKey].push({
      nombre: nombreCanal,
      imagen: imagenCanal,
      meses: 1,
    });
    document.getElementById(botonId).innerText = "Suscrito";
    document.getElementById(botonId).classList.add("activo-canal");
    alert(
      `Te has suscrito al canal. Puedes configurar los meses en tu Biblioteca.`,
    );
  } else {
    canalesSuscritos[userKey].splice(index, 1);
    document.getElementById(botonId).innerText = "Suscribirse";
    document.getElementById(botonId).classList.remove("activo-canal");
    alert(`Suscripción removida`);
  }

  guardarEnLocalStorage();
  renderizarTablaSuscripciones();
}

function cambiarMesesSuscripcion(nombreCanal, nuevosMeses) {
  const userKey = usuarioActual.user;
  const valor = parseInt(nuevosMeses);

  if (isNaN(valor) || valor <= 0) {
    alert("Ingresa un número válido de meses (mayor a 0).");
    renderizarTablaSuscripciones();
    return;
  }

  const item = canalesSuscritos[userKey].find((c) => c.nombre === nombreCanal);
  if (item) {
    item.meses = valor;
    guardarEnLocalStorage();
  }
}

function cancelarSuscripcionDesdeTabla(nombreCanal) {
  const userKey = usuarioActual.user;

  if (confirm(`¿Quieres cancelar la suscripción al canal?`)) {
    canalesSuscritos[userKey] = canalesSuscritos[userKey].filter(
      (c) => c.nombre !== nombreCanal,
    );
    guardarEnLocalStorage();
    sincronizarBotonesCanales();
    renderizarTablaSuscripciones();
  }
}

function sincronizarBotonesCanales() {
  const userKey = usuarioActual.user;
  const lista = canalesSuscritos[userKey] || [];

  const canales = [
    { nombre: "Perros Criollos", id: "btn-canal-perros" },
    { nombre: "La Red Caracol", id: "btn-canal-red" },
    { nombre: "Fucks News", id: "btn-canal-fucks" },
  ];

  canales.forEach((c) => {
    const btn = document.getElementById(c.id);
    if (btn) {
      const estaSuscrito = lista.some((item) => item.nombre === c.nombre);
      if (estaSuscrito) {
        btn.innerText = "Suscrito";
        btn.classList.add("activo-canal");
      } else {
        btn.innerText = "Suscribirse";
        btn.classList.replace("btn-danger", "btn-outline-danger");
      }
    }
  });
}

function renderizarTablaSuscripciones() {
  const tbody = document.getElementById("tabla-suscripciones-cuerpo");
  if (!tbody || !usuarioActual) return;

  const userKey = usuarioActual.user;
  const lista = canalesSuscritos[userKey] || [];

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted small">No tienes suscripciones activas actualmente.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  lista.forEach((canal) => {
    tbody.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${canal.imagen}" style="width: 40px; height: 25px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://placehold.co/40x25'">
                        <span class="fw-bold" style="font-size: 0.85rem;">${canal.nombre}</span>
                    </div>
                </td>
                <td>
                    <input type="number" class="input-meses" min="1" value="${canal.meses}" onchange="cambiarMesesSuscripcion('${canal.nombre}', this.value)" />
                </td>
                <td>
                    <button class="btn btn-sm btn-danger py-1 px-2" onclick="cancelarSuscripcionDesdeTabla('${canal.nombre}')" style="font-size: 0.7rem;">
                        <i class="fas fa-trash"></i> Cancelar
                    </button>
                </td>
            </tr>
        `;
  });
}

/* canciones favoritas */
function toggleFavorito(titulo, artista, imagen, boton) {
  if (!usuarioActual) return;
  const userKey = usuarioActual.user;

  if (!favoritosUsuario[userKey]) {
    favoritosUsuario[userKey] = [];
  }

  const index = favoritosUsuario[userKey].findIndex((f) => f.titulo === titulo);

  if (index === -1) {
    favoritosUsuario[userKey].push({ titulo, artista, imagen });
    if (boton) boton.classList.add("favorito-activo");
    alert(`Guardado en favoritos: ${titulo}`);
  } else {
    favoritosUsuario[userKey].splice(index, 1);
    if (boton) boton.classList.remove("favorito-activo");
    alert(`Eliminado de favoritos: ${titulo}`);
  }

  guardarEnLocalStorage();
  renderizarFavoritos();
}

function renderizarFavoritos() {
  const contenedor = document.getElementById("contenedor-favoritos");
  if (!contenedor || !usuarioActual) return;

  const userKey = usuarioActual.user;
  const lista = favoritosUsuario[userKey] || [];

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="text-muted small w-100">Presiona el corazón en las canciones para verlas aquí.</p>`;
    return;
  }

  contenedor.innerHTML = "";
  lista.forEach((fav) => {
    contenedor.innerHTML += `
    <div class="w-100 mb-2">
        <div class="d-flex justify-content-between align-items-center bg-dark px-3 py-2 rounded sombreado">

            <div>
                <p class="mb-0 fw-bold" style="font-size: 0.85rem;">
                    ${fav.titulo}
                </p>

                <p class="text-muted mb-0" style="font-size: 0.72rem;">
                    ${fav.artista}
                </p>
            </div>

            <i class="fas fa-heart" style="color: var(--color-principal);"></i>

        </div>
    </div>
`;
  });
}

/* panel admin */
function registrarSuscripcionLanzamiento() {
  if (!usuarioActual) return;

  const index = lanzamientosSuscritos.findIndex(
    (item) => item.user === usuarioActual.user,
  );

  if (index !== -1) {
    lanzamientosSuscritos.splice(index, 1);
    alert("Te has desuscrito de las alertas del lanzamiento AWOOWEEN.");
  } else {
    lanzamientosSuscritos.push({
      fullname: usuarioActual.fullname,
      email: usuarioActual.email,
      user: usuarioActual.user,
      fecha: new Date().toLocaleDateString(),
    });
    alert(
      `¡Suscrito con éxito! Estaremos en contacto en ${usuarioActual.email}.`,
    );
  }

  guardarEnLocalStorage();
  actualizarInterfazLanzamientoBoton();
  renderizarTablaAdmin();
}

function actualizarInterfazLanzamientoBoton() {
  const btn = document.getElementById("btn-suscribirse-lanzamiento");
  if (!btn || !usuarioActual) return;

  const estaRegistrado = lanzamientosSuscritos.some(
    (item) => item.user === usuarioActual.user,
  );
  if (estaRegistrado) {
    btn.innerHTML = `<i class="fas fa-bell-slash me-2"></i> Cancelar Alerta`;
    btn.classList.replace("btn-danger", "btn-secondary");
  } else {
    btn.innerHTML = `<i class="fas fa-bell me-2"></i> Suscribirse`;
    btn.classList.replace("btn-secondary", "btn-danger");
  }
}

function renderizarTablaAdmin() {
  const tbody = document.getElementById("tabla-admin-suscritos-cuerpo");
  if (!tbody) return;

  if (lanzamientosSuscritos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted small">No hay registros de suscripción de lanzamiento actualmente.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  lanzamientosSuscritos.forEach((registro) => {
    tbody.innerHTML += `
            <tr>
                <td style="font-size: 0.85rem;" class="fw-bold text-danger">${registro.fullname}</td>
                <td style="font-size: 0.85rem;">${registro.email}</td>
                <td style="font-size: 0.85rem;">@${registro.user}</td>
                <td style="font-size: 0.85rem;">${registro.fecha}</td>
            </tr>
        `;
  });
}

/* carrusel en mis secciones */

function scrollCarrusel(idCarrusel, distancia) {
  const carrusel = document.getElementById(idCarrusel);

  if (carrusel) {
    carrusel.scrollBy({
      left: distancia,
      behavior: "smooth",
    });
  }
}
