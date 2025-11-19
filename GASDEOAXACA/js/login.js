/* JavaScript específico para la página de login */

// Validación de correo electrónico
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validación de contraseña
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$%^&*]/.test(password);

    return {
        isValid: minLength && hasUpperCase && hasNumber && hasSpecialChar,
        minLength,
        hasUpperCase,
        hasNumber,
        hasSpecialChar
    };
}

// Actualizar reglas de validación de correo
function updateEmailRules(email) {
    const hasAt = email.includes('@');
    const hasDomain = email.includes('.') && email.indexOf('.') > email.indexOf('@');
    const noSpaces = !email.includes(' ');

    document.getElementById('emailRule1').className = hasAt ? 'valid' : '';
    document.getElementById('emailRule2').className = hasDomain ? 'valid' : '';
    document.getElementById('emailRule3').className = noSpaces ? 'valid' : '';
}

// Actualizar reglas de validación de contraseña
function updatePasswordRules(password) {
    const validation = validatePassword(password);

    document.getElementById('passwordRule1').className = validation.minLength ? 'valid' : '';
    document.getElementById('passwordRule2').className = validation.hasUpperCase ? 'valid' : '';
    document.getElementById('passwordRule3').className = validation.hasNumber ? 'valid' : '';
    document.getElementById('passwordRule4').className = validation.hasSpecialChar ? 'valid' : '';
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const emailRules = document.getElementById('emailRules');
    const passwordRules = document.getElementById('passwordRules');

    // Toggle de contraseña
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // Validación en tiempo real del correo
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const isValid = validateEmail(email);

        updateEmailRules(email);

        if (email.length > 0) {
            emailRules.style.display = 'block';

            if (isValid) {
                this.classList.remove('error');
                this.classList.add('success');
                emailError.classList.remove('show');
            } else {
                this.classList.remove('success');
                this.classList.add('error');
                emailError.classList.add('show');
            }
        } else {
            emailRules.style.display = 'none';
            this.classList.remove('error', 'success');
            emailError.classList.remove('show');
        }
    });

    // Validación en tiempo real de la contraseña
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = validatePassword(password);

        updatePasswordRules(password);

        if (password.length > 0) {
            passwordRules.style.display = 'block';

            if (validation.isValid) {
                this.classList.remove('error');
                this.classList.add('success');
                passwordError.classList.remove('show');
            } else {
                this.classList.remove('success');
                this.classList.add('error');
                passwordError.classList.add('show');
            }
        } else {
            passwordRules.style.display = 'none';
            this.classList.remove('error', 'success');
            passwordError.classList.remove('show');
        }
    });

    // Ocultar reglas cuando el input pierde el foco y es válido
    emailInput.addEventListener('blur', function() {
        if (validateEmail(this.value)) {
            emailRules.style.display = 'none';
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (validatePassword(this.value).isValid) {
            passwordRules.style.display = 'none';
        }
    });

    // Manejo del envío del formulario
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        let hasError = false;

        // Validar correo
        if (!validateEmail(email)) {
            emailInput.classList.add('error');
            emailError.classList.add('show');
            hasError = true;
        }

        // Validar contraseña
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            passwordInput.classList.add('error');
            passwordError.classList.add('show');
            hasError = true;
        }

        if (hasError) {
            // Animación de shake para el formulario
            this.style.animation = 'shake 0.5s';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
            return;
        }

        // Simular proceso de inicio de sesión
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Inicio Exitoso';
            submitBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';

            // Mostrar mensaje de éxito
            setTimeout(() => {
                alert(`✅ ¡Bienvenido!\n\nHas iniciado sesión como: ${email}\n\nRedirigiendo a tu panel...`);

                // Resetear formulario
                loginForm.reset();
                emailInput.classList.remove('success');
                passwordInput.classList.remove('success');
                submitBtn.textContent = 'Iniciar Sesión';
                submitBtn.style.background = '';
            }, 1000);
        }, 2000);
    });

    // Efecto de entrada para el formulario
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateY(30px)';
        loginContainer.style.transition = 'all 0.6s ease-out';

        setTimeout(() => {
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateY(0)';
        }, 100);
    }

    // Prevenir envío del formulario con Enter en campos inválidos
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (this.classList.contains('error')) {
                    e.preventDefault();
                    this.focus();
                }
            }
        });
    });
});