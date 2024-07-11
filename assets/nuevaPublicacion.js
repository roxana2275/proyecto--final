const token = localStorage.getItem("authToken");

if (!token) {
  alert("Usuario no autenticado");
  window.location.href = "/";
}

const contactForm = document.querySelector('.form--nuevaPublicacion');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    
    const tipo_producto = document.getElementById('validationTooltip04').value.trim().toLowerCase();
    const titulo = document.getElementById('titulo').value.trim();
    const cantidad = document.getElementById('cantidad').value.trim();
    const precio = document.getElementById('precio').value.trim();
    const imagen = document.getElementById('imagen').files[0]; 
    const decodedToken = window.jwt_decode(token);
    const usuario_id = decodedToken.userId;

    if (!tipo_producto || !titulo || !cantidad || !precio || !imagen) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text:'Por favor complete todos los campos',
            showConfirmButton: true
        });
        return;
    }

    const formData = new FormData();
    formData.append('tipo_producto', tipo_producto);
    formData.append('titulo', titulo);
    formData.append('cantidad', cantidad);
    formData.append('precio', precio);
    formData.append('imagen', imagen); 
    formData.append('usuario_id', usuario_id);

    try {
        const response = await fetch('/nuevaPublicacion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Formulario enviado',
                text: 'Publicacion exitosa',
                showConfirmButton: false,
                timer: 1500
            });
            window.location.href = `/perfilDeUsuario/${usuario_id}`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:'Error al subir la publicacion',
                showConfirmButton: true
            });;
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text:'error',
            showConfirmButton: true
        });
    }
});




  