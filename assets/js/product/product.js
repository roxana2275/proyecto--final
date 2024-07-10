import { lista } from "../../js/fakeAPI/productos.js";
import { addToCart, loadCart } from "../carrito/carrito.js";

let urlParams = new URLSearchParams(document.location.search);
let title = urlParams.get("titulo");

/*TARJETAS PAGINA PRINCIPAL*/
//Creación de tarjetas
export function createCards(data, titulo) {
  //Creo el contenedor
  var cardContainer = "";
  //intero sobre la lista y creo las tarjetas
  data.map((element) => {
    let a = `
    <div class="content--card">
      <img src="${element.infos.img}" alt="${element.infos.alt}">
      <div class="card--info">
        <p class="content--card--title">${element.infos.nombre}</p>
        <p class="content--card--price">$ ${element.infos.precio}</p>
        <p class="content--card--cantidad">Cantidad:${element.infos.cantidad}</p>
        <div class="content--card--icon">
          <i class="fa fa-shopping-cart addToCart" aria-hidden="true" data-titulo="${titulo}" data-product-id="${element.infos.id}" data-quantity="1" data-price="${element.infos.precio}"></i>
          <i class="fa fa-commenting" aria-hidden="true"></i>
        </div>
      </div>
    </div>`;
    //Agrego la tarjeta al contenedor
    cardContainer += a;
  });
  //Retornno el contenedor con las tarjetas
  return cardContainer;
}

// Agregar event listener una vez que se carga el documento
document.addEventListener("click", function (event) {
  //Si se cliquea obtengo el titulo, id de producto, cantidad y precio para mandar al carrito
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
    //Agrego los datos al carrito
    addToCart(product);
  }
});

//Agrego los títulos, contenedores y Slider al HTML
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

//FUNCION PARA VER POR TIPO DE PRODUCTO//
//CONTENEDOR DEL HTML PARA SECCIONES Y TARJETAS//
export function containerCards(paths) {
  //Selección del contenedor de tarjetas
  var cardEspecifico = document.querySelector(".contenido--especifico");
  //Limpia el contenido del contenedor
  cardEspecifico.innerHTML = "";

  //Creo datos para pasar a la función createCards()
  let data = paths.productList.produtos;
  //Creo las tarjetas (cardContainer) utilizando createCards()
  let cardContainer = createCards(data, paths.productList.titulo);
  //Creo un objeto info con los datos de las tarjetas
  let info = { title: paths.productList.titulo, cards: cardContainer, path: paths };
  //Añado las tarjetas al contenedor (cardEspecifico) utilizando HTML()
  cardEspecifico.innerHTML += HTML(info);
}

/* CARRITO DE COMPRA */
// No se necesita redeclarar 'addToCart' aquí ya que está importado de 'carrito.js'

//Barra de búsqueda
function buscar(texto) {
  const productosBuscados = paths.productList.produtos.filter(item => 
    item.nombre.includes(texto) || item.descripcion.includes(texto)
  );
  console.log(productosBuscados);
  return productosBuscados;
}

window.onload = function () {
  loadCart(); // Asegurarse de cargar el carrito al inicio

  const productos = lista.find(item => item.titulo === title);
  const paths = {
    productList: productos,
    productAmount: productos.produtos.length, // Verifica que esto sea correcto
  };
  containerCards(paths);
};
