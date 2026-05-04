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
    
    fetch('get_services.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;
            const fetchedServices = data.services;
            
            if (fetchedServices.length === 0) {
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
            
            fetchedServices.forEach(service => {
                const row = document.createElement('tr');
                // Backend doesn't have category/description by default, leaving placeholders or empty string if not available
                row.innerHTML = `
                    <td>
                        <strong>${service.name}</strong>
                    </td>
                    <td class="service-description">
                        -
                    </td>
                    <td>
                        <span class="service-duration">${service.duration} min</span>
                    </td>
                    <td>
                        <span class="currency">${service.price}</span>
                    </td>
                    <td>
                        <span class="badge bg-success">Active</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <!-- Backend edit not implemented natively yet without full row re-fetch -->
                            <button class="action-btn edit" onclick="editService(${service.id}, '${service.name}', ${service.duration}, ${service.price})">
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
        })
        .catch(err => console.error(err));
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
        name: document.getElementById('service-name').value,
        duration: parseInt(document.getElementById('service-duration').value),
        price: parseInt(document.getElementById('service-price').value)
    };
    
    fetch('add_service.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
            modal.hide();
            document.getElementById('addServiceForm').reset();
            loadServices();
            showNotification('New service added successfully!', 'success');
        } else {
            showNotification(data.message, 'danger');
        }
    })
    .catch(err => console.error(err));
}

// Edit service
function editService(id, name, duration, price) {
    localStorage.setItem('edit-service-id', id);
    
    document.getElementById('service-name').value = name;
    document.getElementById('service-duration').value = duration;
    document.getElementById('service-price').value = price;
    
    document.querySelector('#addServiceModal .modal-title').textContent = 'Edit Service';
    
    const form = document.getElementById('addServiceForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateServiceDetails(id);
    };
    
    const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
    modal.show();
}

// Update service details
function updateServiceDetails(id) {
    const updatedService = {
        id: id,
        name: document.getElementById('service-name').value,
        duration: parseInt(document.getElementById('service-duration').value),
        price: parseInt(document.getElementById('service-price').value)
    };
    
    fetch('update_service.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedService)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
            modal.hide();
            
            document.getElementById('addServiceForm').reset();
            document.querySelector('#addServiceModal .modal-title').textContent = 'Add New Service';
            document.getElementById('addServiceForm').onsubmit = addNewService;
            
            loadServices();
            showNotification(data.message, 'success');
            localStorage.removeItem('edit-service-id');
        } else {
            showNotification(data.message, 'danger');
        }
    })
    .catch(err => console.error(err));
}

// Delete service
function deleteService(id) {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
        fetch('delete_service.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadServices();
                showNotification(data.message, 'success');
            } else {
                showNotification(data.message, 'danger');
            }
        })
        .catch(err => console.error(err));
    }
}