const pathSegments = window.location.pathname.split("/");
const tipo = pathSegments[pathSegments.length - 1];

async function verificarUsuarioAutenticado() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No hay token en localStorage perfil.js");
      window.location.href = "/login";
      return null;
    } else {
      const decodedToken = window.jwt_decode(token);
      return decodedToken.userId;
    }
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}

export function createCards(data, titulo) {
  return data.map(element => `
    <div class="content--card">
      <img src="${element.infos.img}" alt="${element.infos.alt}">
      <div class="card--info">
        <p class="content--card--title">${element.infos.nombre}</p>
        <p class="content--card--price">$ ${element.infos.precio}</p>
        <p class="content--card--cantidad">Cantidad: ${element.infos.cantidad}</p>
        <div class="content--card--icon">
          <i class="fa fa-shopping-cart addToCart" aria-hidden="true" data-titulo="${titulo}" data-product-id="${element.infos.id}" data-quantity="1" data-price="${element.infos.precio}"></i>
          <i class="fa fa-commenting sendMessage" aria-hidden="true" data-message-id="${element.infos.id}" data-message-usuario="${element.infos.usuario_id}"></i>
        </div>
      </div>
    </div>
  `).join("");
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("addToCart")) {
    const cartIcon = event.target;
    const product = {
      titulo: cartIcon.getAttribute("data-titulo"),
      id: cartIcon.getAttribute("data-product-id"),
      quantity: parseInt(cartIcon.getAttribute("data-quantity")),
      price: parseFloat(cartIcon.getAttribute("data-price"))
    };
    addToCart(product);
  }

  if (event.target.classList.contains("sendMessage")) {
    const cartIcon = event.target;
    const message = {
      infosId: cartIcon.getAttribute("data-message-id")
    };
    enviarMensaje(message);
  }
});

document.addEventListener('click', async event => {
  if (event.target.classList.contains('fa-commenting')) {
    const icon = event.target;
    const publicacionId = icon.getAttribute("data-message-id");
    const receptorId = icon.getAttribute("data-message-usuario");
    const userId = await verificarUsuarioAutenticado();

    if (!userId) return; 

    const modal = document.getElementById("messageModal");
    modal.style.display = "block";

    const sendMessageButton = document.getElementById("sendMessageButton");
    const messageContent = document.getElementById("messageContent");

    sendMessageButton.onclick = async function() {
      const content = messageContent.value;
      const token = localStorage.getItem("authToken");

      const messageData = {
        contenido: content,
        emisor_id: userId,
        receptor_id: receptorId,
        publicacion_id: publicacionId
      };

      try {
        const response = await fetch("/mensajes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(messageData)
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Mensajes',
            text: 'Mensaje enviado',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'custom-swal-popup'
            }
        }).then(() => {
          modal.style.display = "none";
        });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al enviar le mensaje',
            showConfirmButton: true,
            customClass: {
              popup: 'custom-swal-popup'
            }
        })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error,
          showConfirmButton: true,
          customClass: {
            popup: 'custom-swal-popup'
          }
      })
      }
    };
  }
});

document.querySelector(".close").onclick = function() {
  const modal = document.getElementById("messageModal");
  modal.style.display = "none";
};

function HTML(data) {
  return `
    <div class="content--container--especifico">
      <div class="content--title--especifico">
        <h2 class="content-title">${data.title}</h2>
      </div>
      <div class="cards--especifico">
        ${data.cards}
      </div>
    </div>`;
}

export function containerCards(paths) {
  const cardEspecifico = document.querySelector(".contenido--especifico");
  cardEspecifico.innerHTML = "";

  const data = paths.productList.productos;
  const cardContainer = createCards(data, paths.productList.titulo);
  const info = {
    title: paths.productList.titulo,
    cards: cardContainer,
    path: paths
  };
  cardEspecifico.innerHTML += HTML(info);
}

async function addToCartClicked(event) {
  const icon = event.target;
  const productId = icon.getAttribute("data-product-id");
  const userId = await verificarUsuarioAutenticado();

  if (!userId) return; 

  const token = localStorage.getItem("authToken");

  const cartData = {
    usuario: userId
  };

  const cartItemsData = {
    publicacion_id: productId
  };

  try {
    const cartResponse = await fetch("/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(cartData)
    });

    if (cartResponse.ok) {
      const cart = await cartResponse.json();
      cartItemsData.carrito_id = cart.carrito_id;

      const cartItemsResponse = await fetch("/api/carrito/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(cartItemsData)
      });

      if (cartItemsResponse.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Carrito',
          text: 'Producto agregado',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'custom-swal-popup'
          }
      }).then(() => {
        window.location.reload();
      });
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al agregar el producto',
          showConfirmButton: true,
          customClass: {
            popup: 'custom-swal-popup'
          }
      }).then(() => {
        window.location.reload();
      });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el carrito',
        showConfirmButton: true,
        customClass: {
          popup: 'custom-swal-popup'
        }
    }).then(() => {
      window.location.reload();
    });
    }
  } catch (error) {
    Swal.fire({
      icon: 'success',
      title: 'Mensajes',
      text: error,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'custom-swal-popup'
      }
  }).then(() => {
    window.location.reload();
  });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("addToCart")) {
      addToCartClicked(event);
    }
  });
});

fetch(`/api/productos/${tipo}`)
  .then(response => response.json())
  .then(productos => {
    const transformData = productos => {
      return productos.reduce((acc, entry) => {
        const {
          tipo,
          publicacion_id,
          titulo,
          precio,
          cantidad,
          nombre,
          extension,
          usuario_id
        } = entry;

        const producto = {
          infos: {
            id: publicacion_id,
            nombre: titulo,
            img: `../repoImagenes/${nombre}${extension}`,
            precio,
            alt: `Descripción de ${titulo}`,
            cantidad,
            usuario_id
          }
        };

        if (!acc[tipo]) {
          acc[tipo] = {
            titulo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            productos: []
          };
        }

        acc[tipo].productos.push(producto);
        return acc;
      }, {});
    };

    const transformedData = transformData(productos);
    const lista = Object.values(transformedData);

    const paths = {
      productList: lista.find(item => item.titulo.toLowerCase() === tipo),
      productAmount: lista.length
    };
    containerCards(paths);
  })
  .catch(error => console.error("Error fetching data:", error));
