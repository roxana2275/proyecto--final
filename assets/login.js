document.addEventListener('DOMContentLoaded', () => {
    const regIngreso = document.getElementById('regIngreso');

    regIngreso.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = new FormData(regIngreso);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorText,
                    showConfirmButton: true
                });
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('authToken', result.token); 
                const token = localStorage.getItem('authToken');
                const decodedToken = jwt_decode(token);
                window.location.href = `/perfilDeUsuario/${decodedToken.userId}`;
            } else {
                alert(result.error);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al ingresar',
                showConfirmButton: true
            });
            console.error('Error:', error);
        }
    });
});
