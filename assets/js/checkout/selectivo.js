const token = localStorage.getItem("authToken");

if (!token) {
    alert("Usuario no autenticado");
    window.location.href = "/";
} else {
    const decodedToken = jwt_decode(token);
    cargarCarrito(decodedToken.userId, token);
}

async function cargarCarrito(userId, token) {
    try {
        const response = await fetch(`/checkout/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorText,
                showConfirmButton: true,
                customClass: {
                    popup: 'custom-swal-popup'
                  }
            });
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        carrito(result);

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error,
            showConfirmButton: true,
            customClass: {
                popup: 'custom-swal-popup'
              }
        });
        console.log(error);
    }
}

function carrito(data) {
    let datos = document.querySelector(".subtotal-body");
    datos.innerHTML = "";

    data.forEach(item => {
        datos.innerHTML += `
            <tr>
                <td>${item.titulo}</td>
                <td>${item.precio}</td>
                <td>
                    <button class="delete-button" data-carrito-items-id="${item.carrito_items_id}"><i class="fa-regular fa-trash-can"></i></button>
                </td>
            </tr>`;
    });

    // Agregar event listeners a los botones después de que se han cargado
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const carrito_items_id = event.currentTarget.getAttribute('data-carrito-items-id');
            borrarProducto(carrito_items_id);
        });
    });
}

async function borrarProducto(carrito_items_id) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Usuario no autenticado",
            showConfirmButton: true,
            customClass: {
                popup: 'custom-swal-popup'
              }
        });
        window.location.href = "/";
        return;
    }

    try {
        const response = await fetch(`/checkout/${carrito_items_id}`, {
            method: "DELETE", // Asegúrate de que el método es DELETE
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorText,
                showConfirmButton: true,
                customClass: {
                    popup: 'custom-swal-popup'
                  }
            });
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        // Recargar el carrito después de eliminar el ítem
        const decodedToken = jwt_decode(token);
        cargarCarrito(decodedToken.userId, token);

    } catch (error) {
        console.log(error);
    }
    console.log(`Producto eliminado.`);
}








/*muestra oculta metodo seleccionado de pago*/

function mostrar(dato) {
    if (dato == "1") {
        document.getElementById("efectivo").style.display = "block";
        document.getElementById("tarjeta").style.display = "none";
        document.getElementById("mercadopago").style.display = "none";
        document.getElementById("transf").style.display = "none";
        document.getElementById("cardnumber").value = " ";
        document.getElementById("name").value = " ";
        document.getElementById("fechavenc").value = " ";
        document.getElementById("codigo").value = " ";
        document.getElementById("dni").value = " ";
        
    }
    if (dato == "2") {
        document.getElementById("efectivo").style.display = "none";
        document.getElementById("tarjeta").style.display = "block";
        document.getElementById("mercadopago").style.display = "none";
        document.getElementById("transf").style.display = "none";
    }

    if (dato == "3") {
        document.getElementById("efectivo").style.display = "none";
        document.getElementById("tarjeta").style.display = "none";
        document.getElementById("mercadopago").style.display = "block";
        document.getElementById("transf").style.display = "none";
        document.getElementById("cardnumber").value = " ";        
        document.getElementById("name").value = " ";       
        document.getElementById("fechavenc").value = " ";      
        document.getElementById("codigo").value = " ";       
        document.getElementById("dni").value = " ";
    }    

    if (dato == "4") {
        document.getElementById("efectivo").style.display = "none";
        document.getElementById("tarjeta").style.display = "none";
        document.getElementById("mercadopago").style.display = "none";
        document.getElementById("transf").style.display = "block";
        document.getElementById("cardnumber").value = " ";        
        document.getElementById("name").value = " ";       
        document.getElementById("fechavenc").value = " ";      
        document.getElementById("codigo").value = " ";       
        document.getElementById("dni").value = " ";
    }    
}

/*oculta desde boton borrar*/

function ocultar(){
    document.getElementById("efectivo").style.display = "none";
    document.getElementById("tarjeta").style.display = "none";
    document.getElementById("mercadopago").style.display = "none";
    document.getElementById("transf").style.display = "none";
}


/*validaciones*/

(function(){

    let formulario = document.getElementsByName('formulario')[0];
        elementos = formulario.elements;
        boton = document.getElementsByName('btn');
        letras = /^[A-Za-z\_\-\.\s\xF1\xD1]+$/;


/*no deja enviar formulario si no selecciono metodo de pago*/

    let validarradio = function(e){
        if (formulario.opc[0].checked == true ||
            formulario.opc[1].checked == true || 
            formulario.opc[2].checked == true ||
            formulario.opc[3].checked == true){
        } else{
            alert("Debe elegir forma de pago");
            e.preventDefault();
            /*https://www.w3schools.com/jsref/event_preventdefault.asp
              Evita que un enlace abra la URL*/
        }
    };

/*valida datos de tarjeta*/

    let validardatostar = function(e){
        if (formulario.opc[1].checked == true &(
            formulario.tarjeta.value == "" || 
            (isNaN(formulario.tarjeta.value)) || 
            formulario.nombre.value ==  "" ||
            (!letras.test(formulario.nombre.value)) ||
            formulario.fecha.value == "" ||
            formulario.codigo.value == "" ||
            (isNaN(formulario.codigo.value)) ||
            formulario.dni.value == "" ||
            (isNaN(formulario.dni.value)) )){ 

            alert("datos de tarjeta incompletos o dato erroneo");
            e.preventDefault();
        }
    };

    let validar = function(e){
        
        validarradio(e);
        validardatostar(e);
       /* validarletras(e);
       /* validarnombre(e);
        validarfecha(e);*/
    };
    formulario.addEventListener("submit", validar);
}())




