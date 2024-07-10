import { slider } from "./js/slider/slider.js";


async function verificarUsuarioAutenticado() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No hay token en localStorage perfil.js");
      window.location.href = "/login";
      return null; 
    }else{
        const decodedToken = window.jwt_decode(token);
        return decodedToken.userId;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
export function createCards(data, titulo) {
  var cardContainer = "";
  data.product.productos.map((element) => {
    let a = `
        <div class="content--card">
            <img src="${element.infos.img}" alt="${element.infos.titulo}">
            <div class="card--info">
                <p class="content--card--title">${element.infos.nombre}</p>
                <p class="content--card--price">$ ${element.infos.precio}</p>
                <p class="content--card--cantidad">Cantidad: ${element.infos.cantidad}</p>
                <div class="content--card--icon">
                    <i class="fa fa-shopping-cart addToCart" aria-hidden="true" data-titulo=${titulo} data-product-id="${element.infos.id}" data-quantity="1" data-price="${element.infos.precio}"></i>
                    <i class="fa fa-commenting" aria-hidden="true" data-message-id="${element.infos.id}" data-message-usuario="${element.infos.usuario_id}"></i>
                </div>
            </div>
        </div>`;
    cardContainer += a;
  });
  return cardContainer;
}

async function addToCartClicked(event) {
  const icon = event.target;
  const productId = icon.getAttribute("data-product-id");

  const userId = await verificarUsuarioAutenticado();
  const token = localStorage.getItem("authToken");

  const cartData = {
    usuario: userId,
  };

  const cartItemsData = {
    publicacion_id: productId,
  };

  try {
    const cartResponse = await fetch("/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(cartData),
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
        body: JSON.stringify(cartItemsData),
      });

      if (cartItemsResponse.ok) {
        window.location.reload();
      } else {
        console.error("Error al agregar el producto");
      }
    } else {
      console.error("Error al crear el carrito");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener('click', event => {
    if (event.target && event.target.className.includes('addToCart')) {
      addToCartClicked(event);
    }
  });
});


document.addEventListener('click', async event => {
  if (event.target && event.target.className.includes('fa-commenting')) {
    const icon = event.target;
    const publicacionId = icon.getAttribute("data-message-id");
    const receptorId = icon.getAttribute("data-message-usuario");
    const userId = await verificarUsuarioAutenticado();

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
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          modal.style.display = "none";
        } else {
          console.error("Error al enviar el mensaje");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  }
});

document.querySelector(".close").onclick = function() {
  const modal = document.getElementById("messageModal");
  modal.style.display = "none";
};




function HTML(data) {
  let innerHTML = `
    <div class="content--container">
        <div class="content--title">
            <h2 class="content-title">${data.title}</h2>
            <input type="button" class="content--button" onclick="verTodo('${data.title}')" value="Ver Todo">
        </div>
        <div class="card--container">
            <span class="span voltar"><img src="${data.path.imgSlider}" alt="" class="img"></span>
            <div class="cards">
                ${data.cards}
            </div>
            <span class="span avancar"><img src="${data.path.imgSlider}" alt=""></span>
        </div>
    </div>`;
  return innerHTML;
}

window.verTodo = function (titulo) {
  window.location.href = `./productos/${titulo.toLowerCase()}`;
};

export function containerCards(paths) {
  var cardSection = document.querySelector(".content");
  cardSection.innerHTML = "";

  if (paths.productAmount > 1) {
    paths.productList.forEach((item, index) => {
      let data = { product: item, index: index };
      let cardContainer = createCards(data, item.titulo);
      let info = { title: item.titulo, cards: cardContainer, path: paths };
      cardSection.innerHTML += HTML(info);
    });
    slider();
  } else {
    let data = {
      product: paths.productList,
      index: paths.listIndex,
      url: paths.url,
    };
    let cardContainer = createCards(data, paths.productList.titulo);
    let info = {
      title: paths.productList.titulo,
      cards: cardContainer,
      path: paths,
    };
    cardSection.innerHTML += HTML(info);
  }
  slider();
}



window.onload = function () {

  fetch("/api/productos")
    .then((response) => response.json())
    .then((productos) => {
      const transformData = (productos) => {
        return productos.reduce((acc, entry) => {
          const {
            tipo,
            publicacion_id,
            titulo,
            precio,
            cantidad,
            nombre,
            extension,
            usuario_id,
          } = entry;
          const producto = {
            infos: {
              id: publicacion_id,
              nombre: titulo,
              img: `repoImagenes/${nombre}${extension}`,
              precio,
              alt: `Descripción de ${titulo}`,
              cantidad,
              usuario_id,
            },
          };

          if (!acc[tipo]) {
            acc[tipo] = {
              titulo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
              productos: [],
            };
          }

          acc[tipo].productos.push(producto);
          return acc;
        }, {});
      };

      const transformedData = transformData(productos);

      const lista = Object.values(transformedData);

      const paths = {
        productList: lista,
        productAmount: lista.length,
        imgSlider: "./assets/img/flecha/setaSlider.png",
      };

      containerCards(paths);
    })
    .catch((error) => console.error("Error al obtener datos:", error));
};


