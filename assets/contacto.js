const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const tipo_mensaje = document.getElementById('validationTooltip04').value.trim();
    const calificacion = obtenerCalificacion(); 
    const mensaje = document.getElementById('mensaje').value.trim();

    if (!nombre || !apellido || !email || !telefono || !tipo_mensaje || !mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text:'Debe completar todos los campos',
            showConfirmButton: true,
            customClass: {
                popup: 'custom-swal-popup'
              }
        });
        return;
    }

    const formData = {
        nombre,
        apellido,
        email,
        telefono,
        tipo_mensaje,
        calificacion,
        mensaje
    };

    try {
        const response = await fetch('/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Formulario enviado',
                text: 'Mensaje enviado',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'custom-swal-popup'
                  }
            }).then(() => {
                window.location.href = `/`;

              });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:'Error al enviar el formulario',
                showConfirmButton: true,
                customClass: {
                    popup: 'custom-swal-popup'
                  }
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text:'error',
            showConfirmButton: true,
            customClass: {
                popup: 'custom-swal-popup'
              }
        });
    }
});

const stars = document.querySelectorAll('.star');
stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-rating');
        setRating(rating);
    });
});

function setRating(rating) {
    stars.forEach(star => {
        if (star.getAttribute('data-rating') <= rating) {
            star.classList.add('bi-star-fill');
            star.classList.remove('bi-star');
        } else {
            star.classList.add('bi-star');
            star.classList.remove('bi-star-fill');
        }
    });
}

function obtenerCalificacion() {
    let rating = 0;
    stars.forEach(star => {
        if (star.classList.contains('bi-star-fill')) {
            rating++;
        }
    });
    return rating;
}
