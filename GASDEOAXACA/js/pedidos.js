/* JavaScript específico para la página de pedidos */

// Variables globales
let pasoActual = 1;
let carrito = {};
let datosPedido = {
    productos: [],
    cliente: {},
    entrega: {
        tipo: 'standard',
        costo: 0,
        fecha: '',
        hora: 'cualquiera'
    },
    pago: {
        metodo: 'efectivo',
        datosTarjeta: {}
    }
};

// Productos disponibles
const productosDisponibles = {
    '10kg': { nombre: 'Tanque 10kg', precio: 350, max: 10 },
    '20kg': { nombre: 'Tanque 20kg', precio: 550, max: 10 },
    '30kg': { nombre: 'Tanque 30kg', precio: 750, max: 10 },
    'estufa': { nombre: 'Estufa de Gas', precio: 3500, max: 5 },
    'calentador': { nombre: 'Calentador de Agua', precio: 4200, max: 5 },
    'kit': { nombre: 'Kit de Seguridad', precio: 850, max: 10 }
};

// Función para toggle de productos
function toggleProducto(card, productoId, precio) {
    const cantidad = parseInt(document.getElementById(`cantidad-${productoId}`).value);

    if (cantidad === 0) {
        // Agregar producto con cantidad 1
        cambiarCantidad(productoId, 1);
        card.classList.add('selected');
    } else {
        // Quitar producto
        cambiarCantidad(productoId, -cantidad);
        card.classList.remove('selected');
    }
}

// Función para cambiar cantidad
function cambiarCantidad(productoId, cambio) {
    const input = document.getElementById(`cantidad-${productoId}`);
    let cantidadActual = parseInt(input.value) || 0;
    let nuevaCantidad = cantidadActual + cambio;

    const maxCantidad = productosDisponibles[productoId].max;

    if (nuevaCantidad < 0) nuevaCantidad = 0;
    if (nuevaCantidad > maxCantidad) nuevaCantidad = maxCantidad;

    input.value = nuevaCantidad;

    // Actualizar carrito
    if (nuevaCantidad === 0) {
        delete carrito[productoId];
        document.querySelector(`.producto-card:has(#cantidad-${productoId})`)?.classList.remove('selected');
    } else {
        carrito[productoId] = {
            ...productosDisponibles[productoId],
            cantidad: nuevaCantidad
        };
        document.querySelector(`.producto-card:has(#cantidad-${productoId})`)?.classList.add('selected');
    }

    actualizarCarrito();
}

// Función para actualizar el carrito
function actualizarCarrito() {
    const carritoItems = document.getElementById('carrito-items');
    const carritoCount = document.getElementById('carrito-count');
    const carritoResumen = document.getElementById('carrito-resumen');

    let totalProductos = 0;
    let subtotal = 0;

    // Limpiar carrito visual
    carritoItems.innerHTML = '';

    if (Object.keys(carrito).length === 0) {
        carritoItems.innerHTML = `
            <div class="carrito-vacio">
                Tu carrito está vacío<br>
                <small>Agrega productos para continuar</small>
            </div>
        `;
        carritoResumen.style.display = 'none';
        document.getElementById('btn-finalizar').disabled = true;
    } else {
        carritoResumen.style.display = 'block';
        document.getElementById('btn-finalizar').disabled = false;

        // Agregar productos al carrito
        for (const [id, producto] of Object.entries(carrito)) {
            totalProductos += producto.cantidad;
            subtotal += producto.precio * producto.cantidad;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'carrito-item';
            itemDiv.innerHTML = `
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${producto.nombre}</div>
                    <div class="carrito-item-detalle">${producto.cantidad} × $${producto.precio}</div>
                </div>
                <div class="carrito-item-precio">$${(producto.precio * producto.cantidad).toLocaleString()}</div>
                <button class="carrito-item-eliminar" onclick="eliminarProducto('${id}')">×</button>
            `;
            carritoItems.appendChild(itemDiv);
        }
    }

    // Actualizar contadores y totales
    carritoCount.textContent = `${totalProductos} producto${totalProductos !== 1 ? 's' : ''}`;

    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('envio').textContent = datosPedido.entrega.costo > 0 ? `$${datosPedido.entrega.costo}` : 'Gratis';

    const total = subtotal + datosPedido.entrega.costo;
    document.getElementById('total').textContent = `$${total.toLocaleString()}`;

    // Actualizar datos del pedido
    datosPedido.productos = Object.entries(carrito).map(([id, producto]) => ({
        id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: producto.cantidad,
        subtotal: producto.precio * producto.cantidad
    }));
}

// Función para eliminar producto del carrito
function eliminarProducto(productoId) {
    delete carrito[productoId];
    document.getElementById(`cantidad-${productoId}`).value = 0;
    document.querySelector(`.producto-card:has(#cantidad-${productoId})`)?.classList.remove('selected');
    actualizarCarrito();
}

// Función para seleccionar tipo de entrega
function selectEntrega(element, tipo) {
    document.querySelectorAll('.entrega-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    datosPedido.entrega.tipo = tipo;
    datosPedido.entrega.costo = tipo === 'express' ? 100 : 0;

    actualizarCarrito();
}

// Función para seleccionar método de pago
function selectPago(element, metodo) {
    document.querySelectorAll('.pago-method').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    datosPedido.pago.metodo = metodo;

    // Mostrar/ocultar formulario de tarjeta
    const datosTarjeta = document.getElementById('datos-tarjeta');
    if (metodo === 'tarjeta') {
        datosTarjeta.style.display = 'block';
    } else {
        datosTarjeta.style.display = 'none';
    }
}

// Función para cambiar de paso
function cambiarPaso(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('.paso-content').forEach(paso => paso.style.display = 'none');

    // Mostrar paso actual
    document.getElementById(`paso${paso}`).style.display = 'block';

    // Actualizar indicadores de paso
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < paso) {
            step.classList.add('completed');
        } else if (index + 1 === paso) {
            step.classList.add('active');
        }
    });

    // Actualizar botones
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');

    btnAnterior.style.display = paso > 1 ? 'block' : 'none';

    if (paso === 4) {
        btnSiguiente.textContent = 'Confirmar Pedido →';
        btnSiguiente.onclick = finalizarPedido;
    } else {
        btnSiguiente.textContent = 'Siguiente →';
        btnSiguiente.onclick = pasoSiguiente;
    }

    pasoActual = paso;
}

// Función para paso anterior
function pasoAnterior() {
    if (pasoActual > 1) {
        cambiarPaso(pasoActual - 1);
    }
}

// Función para paso siguiente
function pasoSiguiente() {
    if (!validarPasoActual()) {
        return;
    }

    if (pasoActual < 4) {
        cambiarPaso(pasoActual + 1);
    }
}

// Función para validar paso actual
function validarPasoActual() {
    const statusMessage = document.getElementById('statusMessage');

    switch(pasoActual) {
        case 1:
            if (Object.keys(carrito).length === 0) {
                mostrarStatus('error', 'Debes agregar al menos un producto al carrito');
                return false;
            }
            break;

        case 2:
            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const direccion = document.getElementById('direccion').value.trim();

            if (!nombre || !telefono || !direccion) {
                mostrarStatus('error', 'Por favor completa todos los campos obligatorios');
                return false;
            }

            // Guardar datos del cliente
            datosPedido.cliente = {
                nombre,
                telefono,
                email: document.getElementById('email').value.trim(),
                tipo_cliente: document.getElementById('tipo_cliente').value,
                direccion,
                ciudad: document.getElementById('ciudad').value.trim(),
                cp: document.getElementById('cp').value.trim(),
                referencias: document.getElementById('referencias').value.trim()
            };
            break;

        case 3:
            const fechaEntrega = document.getElementById('fecha_entrega').value;
            const horaEntrega = document.getElementById('hora_entrega').value;

            datosPedido.entrega.fecha = fechaEntrega;
            datosPedido.entrega.hora = horaEntrega;

            if (!fechaEntrega) {
                mostrarStatus('info', 'Puedes programar tu entrega o elegir entrega inmediata');
            }
            break;

        case 4:
            if (datosPedido.pago.metodo === 'tarjeta') {
                const titular = document.getElementById('titular_tarjeta').value.trim();
                const numero = document.getElementById('numero_tarjeta').value.trim();
                const vencimiento = document.getElementById('vencimiento').value.trim();
                const cvv = document.getElementById('cvv').value.trim();

                if (!titular || !numero || !vencimiento || !cvv) {
                    mostrarStatus('error', 'Por favor completa todos los datos de la tarjeta');
                    return false;
                }

                datosPedido.pago.datosTarjeta = {
                    titular,
                    numero: numero.replace(/\s/g, ''),
                    vencimiento,
                    cvv
                };
            }
            break;
    }

    return true;
}

// Función para mostrar mensajes de estado
function mostrarStatus(tipo, mensaje) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.className = `status-message ${tipo} show`;
    statusMessage.textContent = mensaje;

    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

// Función para finalizar pedido
function finalizarPedido() {
    if (!validarPasoActual()) {
        return;
    }

    // Mostrar loading
    document.getElementById('loadingOverlay').style.display = 'flex';

    // Simular proceso de pedido
    setTimeout(() => {
        // Generar número de pedido
        const numeroPedido = 'GAS-' + Date.now().toString(36).toUpperCase();

        // Calcular total
        const subtotal = Object.values(carrito).reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const total = subtotal + datosPedido.entrega.costo;

        // Ocultar loading
        document.getElementById('loadingOverlay').style.display = 'none';

        // Mostrar confirmación
        const confirmacion = `
✅ ¡PEDIDO CREADO EXITOSAMENTE!

📋 Número de Pedido: ${numeroPedido}
👤 Cliente: ${datosPedido.cliente.nombre}
📍 Dirección: ${datosPedido.cliente.direccion}
📦 ${Object.keys(carrito).length} productos
💰 Total: $${total.toLocaleString()} MXN
🚚 Entrega: ${datosPedido.entrega.tipo === 'express' ? 'Express (2-4 horas)' : 'Estándar (24-48 horas)'}
💳 Pago: ${datosPedido.pago.metodo}

📞 Te contactaremos pronto para confirmar tu entrega.

¡Gracias por tu confianza en Gas de Oaxaca! 🔥
        `;

        alert(confirmacion);

        // Resetear todo
        carrito = {};
        Object.keys(productosDisponibles).forEach(id => {
            document.getElementById(`cantidad-${id}`).value = 0;
        });
        document.querySelectorAll('.producto-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('telefono').value = '';
        document.getElementById('email').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('referencias').value = '';

        // Resetear datos del pedido
        datosPedido = {
            productos: [],
            cliente: {},
            entrega: {
                tipo: 'standard',
                costo: 0,
                fecha: '',
                hora: 'cualquiera'
            },
            pago: {
                metodo: 'efectivo',
                datosTarjeta: {}
            }
        };

        // Volver al paso 1
        cambiarPaso(1);
        actualizarCarrito();

        // Mostrar mensaje de éxito
        mostrarStatus('success', `Pedido ${numeroPedido} creado correctamente`);

        // Opcional: Redirigir a página de seguimiento
        // window.location.href = `seguimiento.html?pedido=${numeroPedido}`;
    }, 3000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cambiarPaso(1);
    actualizarCarrito();

    // Establecer fecha mínima
    const fechaEntrega = document.getElementById('fecha_entrega');
    if (fechaEntrega) {
        const today = new Date().toISOString().split('T')[0];
        fechaEntrega.min = today;
    }

    // Animaciones de entrada
    document.querySelectorAll('.producto-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Formateo automático del teléfono
document.getElementById('telefono')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length > 6) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
    } else if (value.length > 3) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    }

    e.target.value = value;
});

// Formateo automático de tarjeta
document.getElementById('numero_tarjeta')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = '';

    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }

    e.target.value = formattedValue;
});

// Formateo automático de vencimiento
document.getElementById('vencimiento')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    e.target.value = value;
});