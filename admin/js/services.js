// services.js - Services specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initServices();
});

// Initialize services
function initServices() {
    loadServices();
    setupServiceEventListeners();
}

// Load services
function loadServices() {
    const tbody = document.getElementById('services-list');
    if (!tbody) return;
    
    if (services.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-cut"></i>
                        <h4>No Services Found</h4>
                        <p>Add your first service to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${service.name}</strong>
                <br>
                <small class="text-muted">${service.category}</small>
            </td>
            <td class="service-description" title="${service.description}">
                ${service.description}
            </td>
            <td>
                <span class="service-duration">${service.duration} min</span>
            </td>
            <td>
                <span class="currency">${service.price}</span>
            </td>
            <td>
                <span class="badge ${service.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                    ${service.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editService(${service.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteService(${service.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup service event listeners
function setupServiceEventListeners() {
    // Add service form
    const addServiceForm = document.getElementById('addServiceForm');
    if (addServiceForm) {
        addServiceForm.addEventListener('submit', addNewService);
    }
}

// Add new service
function addNewService(e) {
    e.preventDefault();
    
    const newService = {
        id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
        name: document.getElementById('service-name').value,
        description: document.getElementById('service-description').value,
        duration: parseInt(document.getElementById('service-duration').value),
        price: parseInt(document.getElementById('service-price').value),
        category: document.getElementById('service-category').value,
        status: document.getElementById('service-status').value
    };
    
    services.push(newService);
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addServiceForm').reset();
    
    // Reload services
    loadServices();
    
    showNotification('New service added successfully!', 'success');
}

// Edit service
function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    // Store service ID for update
    localStorage.setItem('edit-service-id', id);
    
    // Populate form
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-description').value = service.description;
    document.getElementById('service-duration').value = service.duration;
    document.getElementById('service-price').value = service.price;
    document.getElementById('service-category').value = service.category;
    document.getElementById('service-status').value = service.status;
    
    // Change modal title
    document.querySelector('#addServiceModal .modal-title').textContent = 'Edit Service';
    
    // Update form submit handler
    const form = document.getElementById('addServiceForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateServiceDetails(id);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
    modal.show();
}

// Update service details
function updateServiceDetails(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    // Update service
    service.name = document.getElementById('service-name').value;
    service.description = document.getElementById('service-description').value;
    service.duration = parseInt(document.getElementById('service-duration').value);
    service.price = parseInt(document.getElementById('service-price').value);
    service.category = document.getElementById('service-category').value;
    service.status = document.getElementById('service-status').value;
    
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
    modal.hide();
    
    // Reset form and title
    document.getElementById('addServiceForm').reset();
    document.querySelector('#addServiceModal .modal-title').textContent = 'Add New Service';
    
    // Reload services
    loadServices();
    
    showNotification(`Service "${service.name}" updated successfully`, 'success');
    
    // Clear stored ID
    localStorage.removeItem('edit-service-id');
}

// Delete service
function deleteService(id) {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            const serviceName = services[index].name;
            services.splice(index, 1);
            saveAllData();
            loadServices();
            showNotification(`Service "${serviceName}" deleted successfully`, 'success');
        }
    }
}