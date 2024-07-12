document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Formulario enviado',
                    text: 'Usuario dado de alta',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'custom-swal-popup'
                      }
                });
                window.location.href = `/`;

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text:'Error al registrarse',
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
                text:error,
                showConfirmButton: true,
                customClass: {
                    popup: 'custom-swal-popup'
                  }
            });
        }
    });
});
