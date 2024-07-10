
const pathSegments = window.location.pathname.split('/');
const tipo = pathSegments[pathSegments.length - 1];

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

    data.map((element) => {
        let a = `
        <div class="content--card">
            <img src="${element.infos.img}" alt="${element.infos.alt}">
            <div class="card--info">
                <p class="content--card--title">${element.infos.nombre}</p>
                <p class="content--card--price">$ ${element.infos.precio}</p>
                <p class="content--card--cantidad">Cantidad:${element.infos.cantidad}</p>
                <div class="content--card--icon">
                    <i class="fa fa-shopping-cart addToCart" aria-hidden="true" data-titulo=${titulo} data-product-id="${element.infos.id}" data-quantity="1" data-price="${element.infos.precio}"></i>
                    <i class="fa fa-commenting sendMessage" aria-hidden="true" data-message-id="${element.infos.id}"></i>
                </div>
            </div>
        </div>`;
        cardContainer += a;
    });
    return cardContainer;
}

document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("addToCart")) {
        const cartIcon = event.target;
        const title = cartIcon.getAttribute("data-titulo");
        const productId = cartIcon.getAttribute("data-product-id");
        const quantity = parseInt(cartIcon.getAttribute("data-quantity"));
        const price = parseFloat(cartIcon.getAttribute("data-price"));
        const product = {
            titulo: title,
            id: productId,
            quantity: quantity,
            price: price,
        };
        addToCart(product);
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("sendMessage")) {
        const cartIcon = event.target;
        const infosId = cartIcon.getAttribute("data-message-id");
        const message = {
            infosId: infosId,
        };
        enviarMensaje(message);
    }
});

function HTML(data) {
    let innerHTML = `
    <div class="content--container--especifico">
        <div class="content--title--especifico">
            <h2 class="content-title">${data.title}</h2>
        </div>
        <div class="cards--especifico">
            ${data.cards}
        </div>
    </div>`;
    return innerHTML;
}

export function containerCards(paths) {
    var cardEspecifico = document.querySelector(".contenido--especifico");
    cardEspecifico.innerHTML = "";

    let data = paths.productList.productos;
    let cardContainer = createCards(data, paths.productList.titulo);
    let info = { title: paths.productList.titulo, cards: cardContainer, path: paths };
    cardEspecifico.innerHTML += HTML(info);
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
fetch(`/api/productos/${tipo}`)
    .then(response => response.json())
    .then(productos => {
        const transformData = (productos) => {
            return productos.reduce((acc, entry) => {
                const { tipo, publicacion_id, titulo, precio, cantidad, nombre, extension } = entry;
                const producto = {
                    infos: {
                        id: publicacion_id,
                        nombre: titulo,
                        img: `../repoImagenes/${nombre}${extension}`,
                        precio,
                        alt: `Descripción de ${titulo}`,
                        cantidad,
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
            productList: lista.find(item => item.titulo.toLowerCase() === tipo),
            productAmount: lista.length,
        };
        containerCards(paths);
    })
    .catch(error => console.error('Error fetching data:', error));

