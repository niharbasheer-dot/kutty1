// Global variables
let plantsData = [];
let categoriesData = [];
let currentCategory = 'all';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadPlantsData();
    setupHamburgerMenu();
});

// Load plants data from JSON
async function loadPlantsData() {
    try {
        const response = await fetch('plants-data.json');
        const data = await response.json();
        categoriesData = data.categories;
        plantsData = data.plants;
        
        renderCategories();
        renderPlants('all');
    } catch (error) {
        console.error('Error loading plants data:', error);
    }
}

// Render category filter buttons
function renderCategories() {
    const filterContainer = document.getElementById('category-filter');
    filterContainer.innerHTML = '';
    
    // Add "All Plants" button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = '🌿 എല്ലാ ചെടികൾ';
    allBtn.onclick = () => filterByCategory('all');
    filterContainer.appendChild(allBtn);
    
    // Add category buttons
    categoriesData.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = `${category.emoji} ${category.name}`;
        btn.onclick = () => filterByCategory(category.id);
        filterContainer.appendChild(btn);
    });
}

// Filter plants by category
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Render filtered plants
    renderPlants(categoryId);
}

// Render plants grid
function renderPlants(categoryId) {
    const gridContainer = document.getElementById('plants-grid');
    gridContainer.innerHTML = '';
    
    let filteredPlants = plantsData;
    if (categoryId !== 'all') {
        filteredPlants = plantsData.filter(plant => plant.category === categoryId);
    }
    
    filteredPlants.forEach(plant => {
        const card = createPlantCard(plant);
        gridContainer.appendChild(card);
    });
}

// Create plant card element
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    
    // Get category info
    const category = categoriesData.find(c => c.id === plant.category);
    const categoryEmoji = category ? category.emoji : '🌿';
    
    // Create images grid
    let imagesHTML = '';
    if (plant.images && plant.images.length > 0) {
        plant.images.forEach((img, index) => {
            if (index < 1) { // Show only first image in card
                imagesHTML += `<img src="${img}" alt="${plant.name}" class="plant-image" loading="lazy">`;
            }
        });
    }
    
    card.innerHTML = `
        <div class="plant-images">
            ${imagesHTML || '<div style="background: var(--pale-green); display: flex; align-items: center; justify-content: center; font-size: 3rem;">' + categoryEmoji + '</div>'}
        </div>
        <div class="plant-info">
            <div class="plant-header">
                <span class="plant-emoji">${categoryEmoji}</span>
                <span class="plant-name">${plant.name}</span>
            </div>
            <div class="plant-scientific">${plant.scientificName}</div>
            <p class="plant-description">${plant.description.substring(0, 100)}...</p>
            
            <div class="care-grid">
                <div class="care-item">
                    <span class="care-label">☀️ സൂര്യപ്രകാശം</span>
                    <span class="care-value">${plant.sunlight.substring(0, 20)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">💧 നീരാൾ</span>
                    <span class="care-value">${plant.watering.substring(0, 20)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">🌡️ കാലാവസ്ഥ</span>
                    <span class="care-value">${plant.climate.substring(0, 20)}</span>
                </div>
                <div class="care-item">
                    <span class="care-label">🥔 വളം</span>
                    <span class="care-value">${plant.soil.substring(0, 20)}</span>
                </div>
            </div>
            
            <div class="plant-footer">
                <span class="harvest-time">⏱️ ${plant.harvestTime}</span>
                <button class="read-more" onclick="openModal('${plant.id}')">വായിക്കുക</button>
            </div>
        </div>
    `;
    
    return card;
}

// Open modal with plant details
function openModal(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) return;
    
    const category = categoriesData.find(c => c.id === plant.category);
    const categoryEmoji = category ? category.emoji : '🌿';
    
    // Create images grid
    let imagesHTML = '';
    if (plant.images && plant.images.length > 0) {
        plant.images.forEach(img => {
            imagesHTML += `<img src="${img}" alt="${plant.name}" class="modal-image" loading="lazy">`;
        });
    }
    
    const modal = document.getElementById('plant-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <button class="modal-close" onclick="closeModal()">✕</button>
        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.8rem;">${categoryEmoji}</span>
            <div>
                <h2 class="modal-title">${plant.name}</h2>
                <p class="modal-scientific">${plant.scientificName}</p>
            </div>
        </div>
        
        ${imagesHTML ? `<div class="modal-images">${imagesHTML}</div>` : ''}
        
        <div class="modal-section">
            <h3 class="modal-section-title">📖 വിവരണം</h3>
            <p class="modal-section-content">${plant.description}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div class="modal-section">
                <h3 class="modal-section-title">☀️ സൂര്യപ്രകാശം</h3>
                <p class="modal-section-content">${plant.sunlight}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">💧 നീരാൾ</h3>
                <p class="modal-section-content">${plant.watering}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">🌡️ കാലാവസ്ഥ</h3>
                <p class="modal-section-content">${plant.climate}</p>
            </div>
            <div class="modal-section">
                <h3 class="modal-section-title">🥔 വളം</h3>
                <p class="modal-section-content">${plant.soil}</p>
            </div>
        </div>
        
        <div class="modal-section">
            <h3 class="modal-section-title">⏱️ വളർച്ചി സമയം</h3>
            <p class="modal-section-content">${plant.harvestTime}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('plant-modal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('plant-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Hamburger menu functionality
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuItems = mobileMenu ? mobileMenu.querySelectorAll('.nav-item') : [];
    
    if (!hamburger) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    });
    
    // Close menu when clicking on a link
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header') && !e.target.closest('#mobile-menu')) {
            hamburger.classList.remove('active');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        }
    });
}
