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
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentData = null;
        this.isSearchMode = false;
        this.currentFilters = {};
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
            
            // Event listeners para paginación
            document.getElementById('prevBtn').addEventListener('click', () => this.goToPreviousPage());
            document.getElementById('nextBtn').addEventListener('click', () => this.goToNextPage());
            
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
    async getAllCharacters(page = 1) {
        try {
            this.showLoading();
            this.isSearchMode = false;
            const url = `${this.baseUrl}?page=${page}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentData = data;
            this.currentPage = page;
            this.totalPages = data.info.pages;
            
            this.displayCharacters(
                data.results, 
                `Página ${page} de ${data.info.pages} - Mostrando ${data.results.length} de ${data.info.count} personajes`
            );
            this.updatePaginationControls();
            
        } catch (error) {
            this.showError(`Error al obtener personajes: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Busca personajes con filtros aplicados
     */
    async searchCharacters(page = 1) {
        try {
            this.showLoading();
            const filters = this.getFilters();
            
            if (Object.keys(filters).length === 0) {
                this.showError('Por favor, ingresa al menos un filtro para buscar.');
                this.hideLoading();
                return;
            }
            
            this.isSearchMode = true;
            this.currentFilters = filters;
            
            const queryParams = new URLSearchParams({...filters, page: page.toString()}).toString();
            const url = `${this.baseUrl}?${queryParams}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontraron personajes con los filtros especificados.');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentData = data;
            this.currentPage = page;
            this.totalPages = data.info.pages;
            
            this.displayCharacters(
                data.results, 
                `Página ${page} de ${data.info.pages} - Encontrados ${data.results.length} de ${data.info.count} personajes`
            );
            this.updatePaginationControls();
            
        } catch (error) {
            this.showError(`Error en la búsqueda: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Va a la página anterior
     */
    goToPreviousPage() {
        if (this.currentPage > 1) {
            if (this.isSearchMode) {
                this.searchCharacters(this.currentPage - 1);
            } else {
                this.getAllCharacters(this.currentPage - 1);
            }
        }
    }

    /**
     * Va a la página siguiente
     */
    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            if (this.isSearchMode) {
                this.searchCharacters(this.currentPage + 1);
            } else {
                this.getAllCharacters(this.currentPage + 1);
            }
        }
    }

    /**
     * Actualiza los controles de paginación
     */
    updatePaginationControls() {
        const paginationDiv = document.getElementById('paginationControls');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');
        
        // Mostrar la paginación
        paginationDiv.style.display = 'block';
        
        // Actualizar información de página
        pageInfo.textContent = `Página ${this.currentPage} de ${this.totalPages}`;
        
        // Habilitar/deshabilitar botones
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;
        
        // Agregar/quitar clases CSS para el estado deshabilitado
        if (this.currentPage === 1) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
        
        if (this.currentPage === this.totalPages) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    /**
     * Oculta los controles de paginación
     */
    hidePaginationControls() {
        const paginationDiv = document.getElementById('paginationControls');
        paginationDiv.style.display = 'none';
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
        
        // Resetear estado de paginación
        this.currentPage = 1;
        this.totalPages = 1;
        this.isSearchMode = false;
        this.currentFilters = {};
        this.hidePaginationControls();
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
        this.hidePaginationControls();
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