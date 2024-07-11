const pathSegments = window.location.pathname.split("/");
const idString = pathSegments[pathSegments.length - 1];
const id = parseInt(idString);
const token = localStorage.getItem("authToken");

if (!token) {
  alert("Usuario no autenticado");
  window.location.href = "/";
}

async function verificarUsuarioAutenticado() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No hay token en localStorage perfil.js");
      throw new Error("No esta logueado");
    }
    const response = await fetch(`/api/perfilDeUsuario/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "No se encontro token en local storage"
      );
      throw new Error("Error en la coneccion");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos:", error);
    alert("Error al cargar el perfil");
    window.location.href = "/";
  }
}

verificarUsuarioAutenticado().then((data) => {
  if (data) {
    crearTarjetaPerfil(data);
    publicacionesPerfil(data);
    mensajesPerfil(data);
    recibidosPerfil(data);
  }
});

export function crearTarjetaPerfil(data) {
  console.log(data)
  let datos = document.querySelector(".perfil");
  datos.innerHTML = `
    <div class="perfil--datos">
        <div class="perfil--datos--usuario">
            <div class="item-card-informacionContacto-container container">
                <div>
                    <h4 class="item_parrafo ">Mi Perfil</h4>
                    <p class="item_parrafo ">Nombre: ${
                      data.usuario.usuario_nombre
                    }</p>
                    <p class="item_parrafo ">Apellido: ${
                      data.usuario.apellido
                    }</p>
                    <p class="item_parrafo ">Email: ${data.usuario.email}</p>
                    <p class="item_parrafo ">Telefonos: ${
                      data.usuario.telefono
                    }</p>
                </div>
                <div>
                    <h4 class="item_parrafo ">Domicilio</h4>
                    <p>Calle: ${data.usuario.calle}</p>
                    <p>Nro: ${data.usuario.numero}</p>
                    <p>Piso: ${data.usuario.piso}</p>
                    <p>Departamento: ${data.usuario.departamento}</p>
                    <p>Localidad: ${data.usuario.localidad}</p>
                </div>
                <div class="card-pefil-img-container col-3">
                    <img src='../repoImagenes/${data.usuario.imagen_nombre || "avatar-vacio"}${data.usuario.extension || ".png"}' width="250" alt="Foto perfil">
                    <form id="imageUploadForm" action="/api/perfilDeUsuario/${id}/imagen" method="post" enctype="multipart/form-data">
                        <input type="file" id="imagen" name="imagen" class="perfil--datos--usuario--button">
                        <input type="submit" value="Subir Imagen" class="perfil--datos--usuario--button">
                    </form>
                </div>
                <div class="button-container">
                    <a href="/grilla2.html">
                        <button class="perfil--datos--usuario--button">Lista Figuritas</button>
                    </a>
                    <button class="perfil--datos--usuario--button" id="editBtn">Modificar Datos</button>
                    <button id="btnModificarContrasenia" class="perfil--datos--usuario--button">Modificar Contrasenia</button>
                    <button id="baja" class="perfil--datos--usuario--button">Baja Usuario</button>
                </div>
            </div>
        </div>
    </div>
  `;

  document.getElementById("baja").onclick = function () {
    fetch(`/api/perfilDeUsuario/${id}/baja`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
      })

      .catch((error) => console.error(error));
  };

  document.getElementById("editBtn").onclick = function () {
    const modal = document.getElementById("editModal");
    const span = document.getElementsByClassName("close")[0];

    document.getElementById("nombre").value = data.usuario.usuario_nombre;
    document.getElementById("apellido").value = data.usuario.apellido;
    document.getElementById("email").value = data.usuario.email;
    document.getElementById("telefono").value = data.usuario.telefono;
    document.getElementById("calle").value = data.usuario.calle;
    document.getElementById("numero").value = data.usuario.numero;
    document.getElementById("piso").value = data.usuario.piso;
    document.getElementById("departamento").value = data.usuario.departamento;
    document.getElementById("localidad").value = data.usuario.localidad;

    modal.style.display = "block";

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  };

  document.getElementById("editProfileForm").onsubmit = function (event) {
    event.preventDefault();

    const editedData = {
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      email: document.getElementById("email").value,
      telefono: document.getElementById("telefono").value,
      calle: document.getElementById("calle").value,
      numero: document.getElementById("numero").value,
      piso: document.getElementById("piso").value,
      departamento: document.getElementById("departamento").value,
      localidad: document.getElementById("localidad").value,
    };
    const token = localStorage.getItem("authToken");
    fetch(`/api/perfilDeUsuario/${id}/modificarDatos`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((updatedData) => {
        fetch(`/api/perfilDeUsuario/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            crearTarjetaPerfil(data);
          })
          .catch((error) => console.error("Error fetching data:", error));
        document.getElementById("editModal").style.display = "none";
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  document.getElementById("imageUploadForm").addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      try {
        const response = await fetch(this.action, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          window.location.reload();
          
        } else {
          window.location.reload();
          console.error("Error al subir la imagen");
        }
      } catch (error) {
        console.error("Error en la solicitud de subida de imagen:", error);
      }
    });

  
  const modalContrasenia = document.getElementById("modalModificarContrasenia");
  const spanContrasenia = modalContrasenia.getElementsByClassName("close")[0];

  document.getElementById("btnModificarContrasenia").onclick = function () {
    modalContrasenia.style.display = "block";
  };

  spanContrasenia.onclick = function () {
    modalContrasenia.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modalContrasenia) {
      modalContrasenia.style.display = "none";
    }
  };
  document.getElementById("changePasswordForm").onsubmit = function (event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Las nuevas contrasenias no coinciden");
      return;
    }

    const token = localStorage.getItem("authToken");
    fetch(`/api/perfilDeUsuario/${id}/contrasenia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Contrasenia cambiada exitosamente");
        document.getElementById("modalModificarContrasenia").style.display =
          "none";
      })
      .catch((error) => console.error("Error cambiando la contrasenia:", error));
  };
}

export function publicacionesPerfil(data) {
  let datos = document.querySelector(
    ".perfil--publicaciones--lista--table--body"
  );
  datos.innerHTML = "";
  for (let i = 0; i < data.publicaciones.length; i++) {
    const publicacion = data.publicaciones[i];
    datos.innerHTML += `
      <tr>
        <td class="perfil--publicaciones--lista--imagen">
          <img src="/repoImagenes/${publicacion.nombre}${publicacion.extension}" alt="Imagen de la publicación">
        </td>
        <td>${publicacion.titulo}</td>
        <td>${publicacion.cantidad}</td>
        <td>${publicacion.precio}</td>
        <td>
          <button class="perfil--publicaciones--button" data-publicacion-id="${publicacion.publicacion_id}">Dar de Baja</button>
        </td>
      </tr>`;
  }

  document.querySelectorAll(".perfil--publicaciones--button").forEach(button => {
    button.onclick = function () {
      const publicacionId = this.getAttribute("data-publicacion-id");
      fetch(`/productos/${publicacionId}/baja`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en el servidor");
          } else {
            window.location.reload();
          }
        })
        .catch((error) => console.error(error));
    };
  });
}



export function mensajesPerfil(data) {
  let datos = document.querySelector(
    ".perfil--mensajes--lista-tbody"
  );
  datos.innerHTML = "";
  for (let i = 0; i < data.mensajes.length; i++) {
    const mensaje = data.mensajes[i];
    datos.innerHTML += `
      <tr>
        <td>${mensaje.publicacion_id}</td>
        <td>${mensaje.contenido}</td>
        <td>${mensaje.fecha_envio}</td>
        <td>${mensaje.respuesta}</td>
      </tr>`;
  }
}

export function recibidosPerfil(data) {
  let datos = document.querySelector(
    ".perfil--mensajes--recibidos-tbody"
  );
  datos.innerHTML = "";
  for (let i = 0; i < data.respuestas.length; i++) {
    const respuesta = data.respuestas[i];
    datos.innerHTML += `
      <tr>
        <td>${respuesta.publicacion_id}</td>
        <td>${respuesta.contenido}</td>
        <td>${respuesta.fecha_envio}</td>
        <td>${respuesta.respuesta}</td>
        <td><button class="perfil--publicaciones--button fa-reply" data-mensaje-id="${respuesta.mensaje_id}"><i class="fa-solid fa-reply"></i></button></td>
      </tr>`;
  }
}

// Responder mensaje
document.addEventListener('click', async event => {
  if (event.target && event.target.className.includes('fa-reply')) {
    const icon = event.target;
    const mensajeId = icon.getAttribute("data-mensaje-id");
    const userId = await verificarUsuarioAutenticado();

    // Mostrar modal para responder mensaje
    const modal = document.getElementById("replyModal");
    modal.style.display = "block";

    const sendReplyButton = document.getElementById("sendReplyButton");
    const replyContent = document.getElementById("replyContent");

    sendReplyButton.onclick = async function() {
      const content = replyContent.value;
      const token = localStorage.getItem("authToken");

      const replyData = {
        mensaje_id: mensajeId,
        respuesta: content,
        emisor_id: userId
      };

      try {
        const response = await fetch("/respuesta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(replyData),
        });

        if (response.ok) {
          console.log("Respuesta enviada correctamente");
          modal.style.display = "none";
          window.location.reload();

        } else {
          console.error("Error al enviar la respuesta");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  }
});

// Cerrar modales al hacer clic en el botón de cerrar
document.querySelectorAll(".close").forEach(btn => {
  btn.onclick = function() {
    btn.closest(".modal").style.display = "none";
  };
});

