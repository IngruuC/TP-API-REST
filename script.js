// ===== NAVEGACIÓN ENTRE PÁGINAS =====

// Función para ir a la página de personajes
function goToCharacters() {
    window.location.href = 'characters.html';
}

// Función para ir a la página de búsqueda (characters.html con scroll a filtros)
function goToSearch() {
    window.location.href = 'characters.html#search';
}

// Función para volver al inicio
function goHome() {
    window.location.href = 'index.html';
}

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====

class RickMortyApp {
    constructor() {
        this.baseUrl = 'https://rickandmortyapi.com/api/character';
        this.initializeEventListeners();
    }

    /**
     * Inicializa los event listeners para los botones
     */
    initializeEventListeners() {
        // Verificar si estamos en la página de personajes
        if (document.getElementById('getAllBtn')) {
            document.getElementById('getAllBtn').addEventListener('click', () => this.getAllCharacters());
            document.getElementById('searchBtn').addEventListener('click', () => this.searchCharacters());
            document.getElementById('clearBtn').addEventListener('click', () => this.clearFilters());
            
            // Permitir búsqueda con Enter
            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.tagName === 'INPUT') {
                        this.searchCharacters();
                    }
                }
            });
        }
    }

    /**
     * Obtiene todos los personajes de la API
     */
    async getAllCharacters() {
        try {
            this.showLoading();
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCharacters(data.results, `Mostrando ${data.results.length} de ${data.info.count} personajes`);
            
        } catch (error) {
            this.showError(`Error al obtener personajes: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Busca personajes con filtros aplicados
     */
    async searchCharacters() {
        try {
            this.showLoading();
            const filters = this.getFilters();
            
            if (Object.keys(filters).length === 0) {
                this.showError('Por favor, ingresa al menos un filtro para buscar.');
                this.hideLoading();
                return;
            }
            
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${this.baseUrl}?${queryParams}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontraron personajes con los filtros especificados.');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCharacters(data.results, `Encontrados ${data.results.length} personajes`);
            
        } catch (error) {
            this.showError(`Error en la búsqueda: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Obtiene los filtros ingresados por el usuario
     * @returns {Object} Objeto con los filtros aplicados
     */
    getFilters() {
        const filters = {};
        
        const name = document.getElementById('nameFilter').value.trim();
        const status = document.getElementById('statusFilter').value.trim();
        const species = document.getElementById('speciesFilter').value.trim();
        const type = document.getElementById('typeFilter').value.trim();
        const gender = document.getElementById('genderFilter').value.trim();
        
        if (name) filters.name = name;
        if (status) filters.status = status;
        if (species) filters.species = species;
        if (type) filters.type = type;
        if (gender) filters.gender = gender;
        
        return filters;
    }

    /**
     * Limpia todos los filtros y resetea la vista
     */
    clearFilters() {
        document.getElementById('nameFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('speciesFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('genderFilter').value = '';
        
        document.getElementById('charactersContainer').innerHTML = '';
        document.getElementById('resultsCount').textContent = 'Filtros limpiados. Presiona un botón para comenzar.';
        this.hideError();
    }

    /**
     * Muestra los personajes en la interfaz
     * @param {Array} characters - Array de personajes
     * @param {string} countMessage - Mensaje con el conteo de resultados
     */
    displayCharacters(characters, countMessage) {
        const container = document.getElementById('charactersContainer');
        const resultsCount = document.getElementById('resultsCount');
        
        container.innerHTML = '';
        resultsCount.textContent = countMessage;
        
        characters.forEach(character => {
            const characterCard = this.createCharacterCard(character);
            container.appendChild(characterCard);
        });
        
        this.hideError();
    }

    /**
     * Crea una tarjeta HTML para un personaje
     * @param {Object} character - Objeto del personaje
     * @returns {HTMLElement} Elemento HTML de la tarjeta
     */
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const statusClass = `status-${character.status.toLowerCase()}`;
        
        card.innerHTML = `
            <img src="${character.image}" alt="${character.name}" loading="lazy">
            <h3>${character.name}</h3>
            <div class="character-info">
                <span class="${statusClass}">Estado: ${character.status}</span>
                <span>Especie: ${character.species}</span>
                <span>Género: ${character.gender}</span>
                <span>Origen: ${character.origin.name}</span>
                <span>Ubicación: ${character.location.name}</span>
                ${character.type ? `<span>Tipo: ${character.type}</span>` : ''}
            </div>
        `;
        
        return card;
    }

    /**
     * Muestra el mensaje de carga
     */
    showLoading() {
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('charactersContainer').innerHTML = '';
        this.hideError();
    }

    /**
     * Oculta el mensaje de carga
     */
    hideLoading() {
        document.getElementById('loadingMessage').style.display = 'none';
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error a mostrar
     */
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        document.getElementById('charactersContainer').innerHTML = '';
        document.getElementById('resultsCount').textContent = 'Error en la búsqueda';
    }

    /**
     * Oculta el mensaje de error
     */
    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// ===== INICIALIZACIÓN =====

/**
 * Inicializa la aplicación cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar la app si estamos en la página de personajes
    if (document.getElementById('getAllBtn')) {
        new RickMortyApp();
    }
    
    // Verificar si se debe hacer scroll al área de búsqueda
    if (window.location.hash === '#search') {
        setTimeout(() => {
            const searchElement = document.getElementById('search');
            if (searchElement) {
                searchElement.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        }, 100);
    }
});