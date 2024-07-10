import { lista } from "../../js/fakeAPI/productos.js";

let vendedor = {
    id:1,
    navigatorombre:"Juan", 
    apellido:"Gonzalez", 
    email:"juan@email.com", 
    telefono:"11-1234-5678"
};

let perfil = document.getElementsByClassName("contenedor-de-datos-perfil")[0];

    perfil.innerHTML=`
    <div class="card-pefil-img-container col-3">
        <img src="./assets/img/avatar/avatar1.jpg" width="250" alt="Foto perfil">
    </div>

    <div class="item-card-informacionContacto-container container">
        <h4 class="item_parrafo ">Mi Perfil</h4>
        <p class="item_parrafo ">Nombre: ${vendedor.nombre}</p>
        <p class="item_parrafo ">Apellido: ${vendedor.apellido}</p>
        <p class="item_parrafo ">Email: ${vendedor.email}</p>
        <p class="item_parrafo ">Telefonos: ${vendedor.telefono}</p>
    </div>
    <div class="button-container">
        <a class="content--button--perfil">Modificar</a>
    </div>`;


const productos = lista.find(item => item.produtos.some(producto => producto.infos.vendedor === vendedor.id));

console.log(productos);


  



