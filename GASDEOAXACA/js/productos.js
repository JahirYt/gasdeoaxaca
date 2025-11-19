/* JavaScript específico para la página de productos */

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad de los filtros
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover clase active de todos
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');

            // Aquí podrías agregar lógica para filtrar productos
            console.log('Filtro seleccionado:', this.textContent);
        });
    });

    // Funcionalidad del buscador
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Buscando:', searchTerm);
            // Aquí podrías agregar lógica de búsqueda
        });
    }

    // Quantity controls
    function updateQuantity(button, change) {
        const qtyInput = button.parentElement.querySelector('.qty-input');
        let currentValue = parseInt(qtyInput.value) || 1;
        let newValue = currentValue + change;

        // Mantener dentro de límites
        if (newValue < 1) newValue = 1;
        if (newValue > 10) newValue = 10;

        qtyInput.value = newValue;
    }

    // Agregar animación a las tarjetas al hacer scroll
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card-expanded').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        productObserver.observe(card);
    });

    // Efecto en botones de compra
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card-expanded');
            const productTitle = card.querySelector('.product-title').textContent;
            const productWeight = card.querySelector('.product-weight').textContent;
            const quantity = card.querySelector('.qty-input').value;

            // Animación de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            // Aquí puedes agregar la lógica para agregar al carrito
            console.log(`Producto agregado: ${productTitle} ${productWeight} - Cantidad: ${quantity}`);
            alert(`✅ ${quantity} ${productTitle} ${productWeight} agregado(s) al carrito`);
        });
    });

    // Función global para actualizar cantidad
    window.updateQuantity = updateQuantity;
});