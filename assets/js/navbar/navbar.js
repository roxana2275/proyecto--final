document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("encabezado");
    nav.innerHTML = `
        <nav class="menu">
            <ul class="menu__lista">
                <li class="menu__item">
                    <a class="menu__link activo" href="/">
                        <i class="fas fa-home">  Inicio</i>
                        
                    </a>
                    <a class="menu__link" href="/productos">
                        <i class="fas fa-book">  Productos</i>
                        
                    </a>
                    <a class="menu__link" href="/contacto">
                        <i class="fa fa-comments">  Contacto</i>
                        
                    </a>
                    <div class="menu__item--dropdown">
                        <a class="menu__link" href="/login" id="login-link-principal">
                            <i class="fa fa-sign-in" aria-hidden="true">  Login</i>
                            
                        </a>
                        <div class="dropdown-content">
                            <a href="/login" id="login-link">Ingresar</a>
                            <a href="/registro" id="register-link">Registrarse</a>
                            <a href="/" id="logout-link" style="display:none;">Salir</a>
                            <a href="#" id="profile-link" style="display:none;">Ver Perfil</a>
                        </div>
                    </div>
                    <a class="menu__link" href="/checkout">
                        <i class="fa fa-shopping-basket" aria-hidden="true">
                        <span id="cart-count">  0</span>
                        <span id="cart-total">  $0</span>
                        </i>
                    </a>
                </li>
            </ul>
        </nav>
        <div class="logo">
            <img class="logo--img" src="/assets/img/logo/logo5.png">
        </div>
    `;

    const token = localStorage.getItem('authToken');
    const loginLink = document.querySelector('#login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');

    if (token) {
        try {
            const decodedToken = jwt_decode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                console.log('Token expirado');
                localStorage.removeItem('authToken');
            } else {
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                logoutLink.style.display = 'block';
                profileLink.style.display = 'block';
                profileLink.href = `/perfilDeUsuario/${decodedToken.userId}`;

                // Obtener y mostrar el carrito del usuario autenticado
                fetch(`/api/carrito/usuario/${decodedToken.userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(carrito => {
                    const cartCount = carrito.length;
                    const cartTotal = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

                    cartCountElement.textContent = cartCount;
                    cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
                })
                .catch(error => {
                    console.error('Error al obtener el carrito:', error);
                });
            }
        } catch (error) {
            console.error('Error decodificando el token:', error);
            localStorage.removeItem('authToken');
        }
    } else {
        console.log('No se encontró token en localStorage'); 
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
        profileLink.style.display = 'none';
    }

    function logout() {
        localStorage.removeItem('authToken');
        console.log('Token eliminado de localStorage'); 
        window.location.href = '/';
    }

    logoutLink.addEventListener('click', logout);
});

