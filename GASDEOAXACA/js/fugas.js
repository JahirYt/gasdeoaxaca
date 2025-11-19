/* JavaScript específico para la página de detección de fugas */

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad de selección de urgencia
    document.querySelectorAll('.urgency-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover clase selected de todos
            document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
            // Agregar clase selected al clickeado
            this.classList.add('selected');
            // Actualizar valor hidden
            document.getElementById('urgency').value = this.dataset.level;
        });
    });

    // Manejo del formulario
    document.getElementById('leakReportForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Validar urgencia seleccionada
        const urgency = document.getElementById('urgency').value;
        if (!urgency) {
            alert('Por favor, selecciona el nivel de urgencia');
            return;
        }

        // Recopilar datos del formulario
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Mostrar confirmación
        alert(`✅ Reporte enviado con éxito\n\nNivel de urgencia: ${urgency === 'high' ? 'ALTA' : urgency === 'medium' ? 'MEDIA' : 'BAJA'}\n\nSi la urgencia es ALTA, hemos enviado notificación inmediata a nuestro equipo de emergencia.`);

        // Para alta urgencia, simular llamada automática
        if (urgency === 'high') {
            console.log('🚨 EMERGENCIA ALTA - Notificación inmediata enviada al equipo de respuesta');
            setTimeout(() => {
                alert('🚨 EQUIPO DE EMERGENCIA EN CAMINO\n\nUn técnico ha sido despachado a la dirección:\n' + data.address + '\n\nTiempo estimado de llegada: 15-30 minutos');
            }, 2000);
        }

        // Resetear formulario
        this.reset();
        document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
    });

    // Animación de entrada para las secciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, observerOptions);

    // Observar todas las secciones principales
    document.querySelectorAll('.detection-section, .safety-steps, .prevention-tips, .report-form').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        sectionObserver.observe(section);
    });

    // Efecto hover en las tarjetas de método
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Contador regresivo para emergencia (simulación)
    let emergencyCounter = 0;
    setInterval(() => {
        emergencyCounter++;
        if (emergencyCounter % 30 === 0) { // Cada 30 segundos
            console.log('🔔 Verificación de seguridad automática realizada');
        }
    }, 1000);
});