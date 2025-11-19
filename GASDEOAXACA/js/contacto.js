/* JavaScript específico para la página de contacto */

// Variables globales para el mapa
let map;
let clickMarker;
let locationPopup;

// Función para obtener el nombre de una ubicación usando Nominatim (OpenStreetMap)
async function getLocationName(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`);
        const data = await response.json();

        if (data && data.display_name) {
            return {
                displayName: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village || 'Desconocido',
                state: data.address?.state || 'Desconocido',
                country: data.address?.country || 'Desconocido',
                postcode: data.address?.postcode || '',
                road: data.address?.road || '',
                house_number: data.address?.house_number || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        return null;
    }
}

// Función para crear un popup de ubicación
function createLocationPopup(locationData, x, y) {
    // Eliminar popup existente si hay uno
    if (locationPopup) {
        locationPopup.remove();
    }

    // Crear el popup
    const popupDiv = document.createElement('div');
    popupDiv.className = 'location-popup';
    popupDiv.innerHTML = `
        <button class="close-btn" onclick="closeLocationPopup()">×</button>
        <h4>📍 Ubicación Seleccionada</h4>
        <p><strong>País:</strong> ${locationData.country}</p>
        <p><strong>Estado:</strong> ${locationData.state}</p>
        <p><strong>Ciudad:</strong> ${locationData.city}</p>
        ${locationData.road ? `<p><strong>Calle:</strong> ${locationData.road}</p>` : ''}
        ${locationData.house_number ? `<p><strong>Número:</strong> ${locationData.house_number}</p>` : ''}
        ${locationData.postcode ? `<p><strong>C.P.:</strong> ${locationData.postcode}</p>` : ''}
        <p><strong>Coordenadas:</strong> ${locationData.lat.toFixed(6)}, ${locationData.lng.toFixed(6)}</p>
    `;

    // Posicionar el popup
    popupDiv.style.left = Math.min(x + 10, window.innerWidth - 270) + 'px';
    popupDiv.style.top = Math.min(y - 100, window.innerHeight - 200) + 'px';

    document.getElementById('mexico-map').appendChild(popupDiv);
    locationPopup = popupDiv;
}

// Función para cerrar el popup
function closeLocationPopup() {
    if (locationPopup) {
        locationPopup.remove();
        locationPopup = null;
    }
    if (clickMarker) {
        map.removeLayer(clickMarker);
        clickMarker = null;
    }
}

// Función para crear un indicador de clic
function createClickIndicator(x, y) {
    const indicator = document.createElement('div');
    indicator.className = 'click-indicator';
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';

    document.getElementById('mexico-map').appendChild(indicator);

    // Eliminar el indicador después de la animación
    setTimeout(() => {
        indicator.remove();
    }, 1500);
}

// Función para centrar en Oaxaca
function centerOnOaxaca() {
    if (map) {
        map.setView([17.0749, -96.7262], 12, {
            animate: true,
            duration: 1
        });

        // Añadir marcador especial para Oaxaca
        if (clickMarker) {
            map.removeLayer(clickMarker);
        }

        clickMarker = L.marker([17.0749, -96.7262], {
            icon: L.divIcon({
                html: '<div style="background: linear-gradient(135deg, #5ec9f5, #4db8e8); border: 3px solid white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">🔥</div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                className: 'oaxaca-marker'
            })
        }).addTo(map);

        // Mostrar información de Oaxaca
        const oaxacaData = {
            lat: 17.0749,
            lng: -96.7262,
            country: 'México',
            state: 'Oaxaca',
            city: 'Oaxaca de Juárez',
            road: 'Calle Principal',
            house_number: '123'
        };

        setTimeout(() => {
            const rect = document.getElementById('mexico-map').getBoundingClientRect();
            createLocationPopup(oaxacaData, rect.width / 2, rect.height / 2);
        }, 1000);
    }
}

// Función para inicializar el mapa
function initMap() {
    try {
        // Ocultar overlay de carga
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        // Crear el mapa centrado en México
        map = L.map('mexico-map').setView([23.6345, -102.5528], 5);

        // Añadir capa de tiles de OpenStreetMap (no requiere API key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 3
        }).addTo(map);

        // Evento de clic en el mapa
        map.on('click', async function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Verificar que las coordenadas estén en México
            if (lat < 14 || lat > 33 || lng > -86 || lng < -118) {
                alert('🗺️ Por favor, haz clic dentro del territorio de México');
                return;
            }

            // Crear indicador visual de clic
            const point = map.latLngToContainerPoint(e.latlng);
            createClickIndicator(point.x, point.y);

            // Eliminar marcador anterior si existe
            if (clickMarker) {
                map.removeLayer(clickMarker);
            }

            // Añadir nuevo marcador
            clickMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: '<div style="background: #4db8e8; border: 2px solid white; border-radius: 50%; width: 12px; height: 12px;"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                    className: 'click-marker'
                })
            }).addTo(map);

            // Obtener información de la ubicación
            const locationData = await getLocationName(lat, lng);

            if (locationData) {
                // Añadir coordenadas al objeto
                locationData.lat = lat;
                locationData.lng = lng;

                // Crear popup con la información
                const rect = document.getElementById('mexico-map').getBoundingClientRect();
                createLocationPopup(locationData, point.x, point.y);
            } else {
                alert('📍 No se pudo obtener información de esta ubicación. Intenta hacer clic en otro lugar.');
            }
        });

        // Evento de movimiento del mouse para mostrar coordenadas
        map.on('mousemove', function(e) {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);
            map.getContainer().title = `Coordenadas: ${lat}, ${lng}`;
        });

        // Añadir algunos marcadores de ciudades importantes de México
        const cities = [
            {name: 'Ciudad de México', coords: [19.4326, -99.1332], icon: '🏛️'},
            {name: 'Guadalajara', coords: [20.6597, -103.3496], icon: '🌶️'},
            {name: 'Monterrey', coords: [25.6866, -100.3161], icon: '🏭'},
            {name: 'Puebla', coords: [19.0414, -98.2063], icon: '⛪'},
            {name: 'León', coords: [21.1167, -101.6333], icon: '👞'},
            {name: 'Tijuana', coords: [32.5149, -117.0382], icon: '🌮'}
        ];

        cities.forEach(city => {
            const cityMarker = L.marker(city.coords, {
                icon: L.divIcon({
                    html: `<div style="background: white; border: 2px solid #4db8e8; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;">${city.icon}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    className: 'city-marker'
                })
            }).addTo(map);

            cityMarker.bindPopup(`<strong>${city.icon} ${city.name}</strong>`);
        });

        console.log('✅ Mapa de México inicializado correctamente');

    } catch (error) {
        console.error('❌ Error inicializando el mapa:', error);
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.innerHTML = '❌ Error cargando el mapa. Por favor, recarga la página.';
        }
    }
}

// Función para obtener direcciones (sin Google Maps)
function getDirections() {
    alert('🗺️ Para obtener direcciones, puedes usar cualquier aplicación de mapas como Waze, Mapas de Apple, o descargar OpenStreetMap.\n\nNuestras coordenadas: 17.0749, -96.7262');
}

// Inicialización del mapa cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño retraso para asegurar que el DOM esté completamente cargado
    setTimeout(initMap, 100);
});

// Cerrar popup al hacer clic fuera de él
document.addEventListener('click', function(e) {
    if (locationPopup && !locationPopup.contains(e.target)) {
        closeLocationPopup();
    }
});

// Manejo del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Recopilar datos del formulario
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Simular envío del formulario
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = '🔄 Enviando...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = '✅ Mensaje Enviado';
                submitBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';

                // Mostrar confirmación
                alert(`✅ ¡Mensaje enviado con éxito!\n\nNos comunicaremos contigo a la brevedad posible al correo: ${data.email}\n\nNúmero de referencia: #${Date.now().toString(36).toUpperCase()}`);

                // Resetear formulario
                this.reset();

                // Restaurar botón
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 2000);
            }, 2000);
        });
    }

    // Animación de entrada para las secciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 200);
            }
        });
    }, observerOptions);

    // Observar todas las secciones principales
    document.querySelectorAll('.contact-form-section, .info-section, .map-section, .social-section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Validación en tiempo real del teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            // Formatear teléfono a formato mexicano
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);

            if (value.length > 6) {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
            } else if (value.length > 3) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            }

            this.value = value;
        });
    }
});