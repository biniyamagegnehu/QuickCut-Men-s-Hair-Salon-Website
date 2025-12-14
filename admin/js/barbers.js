// barbers.js - Barbers specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initBarbers();
});

// Initialize barbers
function initBarbers() {
    loadBarbers();
    setupBarberEventListeners();
}

// Load barbers
function loadBarbers() {
    const grid = document.getElementById('barbers-grid');
    if (!grid) return;
    
    if (barbers.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="card text-center py-5">
                    <i class="fas fa-user-tie fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No Barbers Found</h4>
                    <p class="text-muted">Add your first barber to get started</p>
                    <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#addBarberModal">
                        <i class="fas fa-user-plus me-2"></i>Add First Barber
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    barbers.forEach(barber => {
        const card = document.createElement('div');
        card.className = 'barber-card';
        card.innerHTML = `
            <div class="barber-header">
                <div class="barber-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="barber-info">
                    <h5>${barber.firstName} ${barber.lastName}</h5>
                    <p>${barber.specialty}</p>
                    <span class="barber-status status-${barber.status}">
                        <i class="fas fa-circle"></i> ${barber.status.charAt(0).toUpperCase() + barber.status.slice(1)}
                    </span>
                </div>
            </div>
            <div class="barber-body">
                <div class="barber-stats">
                    <div class="barber-stat">
                        <span class="number">${barber.appointments}</span>
                        <span class="label">Appointments</span>
                    </div>
                    <div class="barber-stat">
                        <span class="number">${barber.rating}</span>
                        <span class="label">Rating</span>
                    </div>
                    <div class="barber-stat">
                        <span class="number">${formatCurrency(barber.earnings)}</span>
                        <span class="label">Earnings</span>
                    </div>
                    <div class="barber-stat">
                        <span class="number">ETB ${barber.rate}/hr</span>
                        <span class="label">Rate</span>
                    </div>
                </div>
                <div class="barber-actions">
                    <button class="btn btn-sm btn-outline-primary w-100" onclick="editBarber(${barber.id})">
                        <i class="fas fa-edit me-1"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-warning w-100" onclick="manageSchedule(${barber.id})">
                        <i class="fas fa-calendar me-1"></i> Schedule
                    </button>
                    <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteBarber(${barber.id})">
                        <i class="fas fa-trash me-1"></i> Remove
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Setup barber event listeners
function setupBarberEventListeners() {
    // Add barber form
    const addBarberForm = document.getElementById('addBarberForm');
    if (addBarberForm) {
        addBarberForm.addEventListener('submit', addNewBarber);
    }
}

// Add new barber
function addNewBarber(e) {
    e.preventDefault();
    
    const newBarber = {
        id: barbers.length > 0 ? Math.max(...barbers.map(b => b.id)) + 1 : 1,
        firstName: document.getElementById('barber-first-name').value,
        lastName: document.getElementById('barber-last-name').value,
        email: document.getElementById('barber-email').value,
        phone: document.getElementById('barber-phone').value,
        specialty: document.getElementById('barber-specialty').value,
        rate: parseInt(document.getElementById('barber-rate').value),
        status: document.getElementById('barber-status').value,
        appointments: 0,
        earnings: 0,
        rating: 4.5
    };
    
    barbers.push(newBarber);
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBarberModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addBarberForm').reset();
    
    // Reload barbers
    loadBarbers();
    
    showNotification('New barber added successfully!', 'success');
}

// Edit barber
function editBarber(id) {
    const barber = barbers.find(b => b.id === id);
    if (!barber) return;
    
    // Store barber ID for update
    localStorage.setItem('edit-barber-id', id);
    
    // Populate form
    document.getElementById('barber-first-name').value = barber.firstName;
    document.getElementById('barber-last-name').value = barber.lastName;
    document.getElementById('barber-email').value = barber.email;
    document.getElementById('barber-phone').value = barber.phone;
    document.getElementById('barber-specialty').value = barber.specialty;
    document.getElementById('barber-rate').value = barber.rate;
    document.getElementById('barber-status').value = barber.status;
    
    // Change modal title
    document.querySelector('#addBarberModal .modal-title').textContent = 'Edit Barber';
    
    // Update form submit handler
    const form = document.getElementById('addBarberForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateBarberDetails(id);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addBarberModal'));
    modal.show();
}

// Update barber details
function updateBarberDetails(id) {
    const barber = barbers.find(b => b.id === id);
    if (!barber) return;
    
    // Update barber
    barber.firstName = document.getElementById('barber-first-name').value;
    barber.lastName = document.getElementById('barber-last-name').value;
    barber.email = document.getElementById('barber-email').value;
    barber.phone = document.getElementById('barber-phone').value;
    barber.specialty = document.getElementById('barber-specialty').value;
    barber.rate = parseInt(document.getElementById('barber-rate').value);
    barber.status = document.getElementById('barber-status').value;
    
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBarberModal'));
    modal.hide();
    
    // Reset form and title
    document.getElementById('addBarberForm').reset();
    document.querySelector('#addBarberModal .modal-title').textContent = 'Add New Barber';
    
    // Reload barbers
    loadBarbers();
    
    showNotification(`Barber ${barber.firstName} ${barber.lastName} updated successfully`, 'success');
    
    // Clear stored ID
    localStorage.removeItem('edit-barber-id');
}

// Manage schedule
function manageSchedule(id) {
    const barber = barbers.find(b => b.id === id);
    if (barber) {
        alert(`Schedule management for ${barber.firstName} ${barber.lastName}\n\nFeature coming soon!`);
    }
}

// Delete barber
function deleteBarber(id) {
    if (confirm('Are you sure you want to delete this barber? This action cannot be undone.')) {
        const index = barbers.findIndex(b => b.id === id);
        if (index !== -1) {
            const barberName = `${barbers[index].firstName} ${barbers[index].lastName}`;
            barbers.splice(index, 1);
            saveAllData();
            loadBarbers();
            showNotification(`Barber ${barberName} deleted successfully`, 'success');
        }
    }
}