// barbers.js - Professional Version
document.addEventListener('DOMContentLoaded', function() {
    initBarbers();
});

let barbersData = [];
let activeFilters = {
    search: '',
    status: 'all',
    specialty: 'all'
};

function initBarbers() {
    loadBarbers();
    setupEventListeners();
}

function loadBarbers() {
    const grid = document.getElementById('barbers-grid');
    if (!grid) return;
    
    // Show skeleton or loader if needed
    grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Loading barbers...</p></div>';

    fetch('get_barbers.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                barbersData = data.barbers.map(b => ({
                    id: b.id,
                    firstName: b.first_name,
                    lastName: b.last_name,
                    email: b.email,
                    phone: b.phone,
                    specialty: b.specialty,
                    rate: b.rate,
                    status: b.status,
                    appointments: parseInt(b.appointments) || 0,
                    earnings: parseFloat(b.earnings) || 0,
                    rating: parseFloat(b.rating) || 0.0
                }));
                
                updateStats();
                populateSpecialties();
                applyFilters();
            } else {
                showNotification(data.message, 'danger');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            showNotification('Server error while loading barbers', 'danger');
        });
}

function updateStats() {
    const total = barbersData.length;
    const active = barbersData.filter(b => b.status === 'active').length;
    const avgRating = total > 0 ? (barbersData.reduce((acc, b) => acc + b.rating, 0) / total).toFixed(1) : '0.0';
    const totalEarnings = barbersData.reduce((acc, b) => acc + b.earnings, 0).toLocaleString();

    document.getElementById('total-barbers').textContent = total;
    document.getElementById('active-barbers').textContent = active;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-earnings').textContent = totalEarnings + ' ETB';
}

function populateSpecialties() {
    const specialtyFilter = document.getElementById('specialty-filter');
    if (!specialtyFilter) return;

    const specialties = [...new Set(barbersData.map(b => b.specialty))];
    specialtyFilter.innerHTML = '<option value="all">All Specialties</option>';
    specialties.forEach(s => {
        specialtyFilter.innerHTML += `<option value="${s}">${s}</option>`;
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('barber-search');
    const statusFilter = document.getElementById('status-filter');
    const specialtyFilter = document.getElementById('specialty-filter');
    const resetBtn = document.getElementById('reset-filters');
    const form = document.getElementById('addBarberForm');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            activeFilters.status = e.target.value;
            applyFilters();
        });
    }

    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', (e) => {
            activeFilters.specialty = e.target.value;
            applyFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'all';
            if (specialtyFilter) specialtyFilter.value = 'all';
            activeFilters = { search: '', status: 'all', specialty: 'all' };
            applyFilters();
        });
    }

    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const id = form.getAttribute('data-edit-id');
            if (id) {
                saveBarber(id);
            } else {
                saveBarber();
            }
        };
    }
}

function applyFilters() {
    const filtered = barbersData.filter(b => {
        const matchesSearch = (b.firstName + ' ' + b.lastName).toLowerCase().includes(activeFilters.search) || 
                              b.specialty.toLowerCase().includes(activeFilters.search);
        const matchesStatus = activeFilters.status === 'all' || b.status === activeFilters.status;
        const matchesSpecialty = activeFilters.specialty === 'all' || b.specialty === activeFilters.specialty;
        
        return matchesSearch && matchesStatus && matchesSpecialty;
    });

    renderBarbersGrid(filtered);
}

function renderBarbersGrid(data) {
    const grid = document.getElementById('barbers-grid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5 bg-white rounded-4 border border-dashed">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No Barbers Match Your Search</h4>
                    <p class="text-muted">Try adjusting your filters or search terms</p>
                    <button class="btn btn-primary mt-3" onclick="document.getElementById('reset-filters').click()">
                        Clear All Filters
                    </button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    data.forEach(barber => {
        const col = document.createElement('div');
        col.className = 'col-sm-12 col-md-6 col-lg-6 col-xl-4';
        
        const statusClass = `bg-${barber.status}`;
        const statusLabel = barber.status.charAt(0).toUpperCase() + barber.status.slice(1);
        const pillClass = barber.status === 'active' ? 'text-success bg-success-soft' : 
                         (barber.status === 'vacation' ? 'text-warning bg-warning-soft' : 'text-secondary bg-secondary-soft');

        col.innerHTML = `
            <div class="barber-card">
                <div class="barber-header">
                    <div class="barber-avatar-wrapper">
                        <div class="barber-avatar">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="status-indicator ${statusClass}"></div>
                    </div>
                    <div class="barber-info">
                        <h5>${barber.firstName} ${barber.lastName}</h5>
                        <p>${barber.specialty}</p>
                        <span class="barber-status-pill ${pillClass}">${statusLabel}</span>
                    </div>
                </div>
                <div class="barber-body">
                    <div class="barber-meta">
                        <div class="meta-item">
                            <i class="fas fa-envelope"></i>
                            <span>${barber.email}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-phone"></i>
                            <span>${barber.phone}</span>
                        </div>
                    </div>
                    <div class="barber-stats-grid">
                        <div class="stat-item">
                            <span class="val">${barber.appointments}</span>
                            <span class="lbl">Bookings</span>
                        </div>
                        <div class="stat-item">
                            <span class="val">${barber.rating}</span>
                            <span class="lbl">Rating</span>
                        </div>
                        <div class="stat-item">
                            <span class="val">${barber.rate}</span>
                            <span class="lbl">ETB/Hr</span>
                        </div>
                        <div class="stat-item">
                            <span class="val">${barber.earnings.toLocaleString()}</span>
                            <span class="lbl">Earned</span>
                        </div>
                    </div>
                    <div class="barber-actions">
                        <button class="btn btn-light border flex-grow-1" onclick="editBarber(${barber.id})">
                            <i class="fas fa-edit me-2 text-primary"></i> Edit
                        </button>
                        <button class="btn btn-light border text-danger" onclick="deleteBarber(${barber.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

function saveBarber(id = null) {
    const barberData = {
        firstName: document.getElementById('barber-first-name').value,
        lastName: document.getElementById('barber-last-name').value,
        email: document.getElementById('barber-email').value,
        phone: document.getElementById('barber-phone').value,
        specialty: document.getElementById('barber-specialty').value,
        rate: parseInt(document.getElementById('barber-rate').value),
        status: document.getElementById('barber-status').value
    };

    if (id) barberData.id = id;

    const endpoint = id ? 'update_barber.php' : 'add_barber.php';

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barberData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('addBarberModal')).hide();
            document.getElementById('addBarberForm').reset();
            loadBarbers();
        } else {
            showNotification(data.message, 'danger');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        showNotification('Operation failed', 'danger');
    });
}

function editBarber(id) {
    const barber = barbersData.find(b => b.id === id);
    if (!barber) return;

    const form = document.getElementById('addBarberForm');
    form.setAttribute('data-edit-id', id);
    document.getElementById('modalTitle').textContent = 'Edit Barber Details';
    
    document.getElementById('barber-first-name').value = barber.firstName;
    document.getElementById('barber-last-name').value = barber.lastName;
    document.getElementById('barber-email').value = barber.email;
    document.getElementById('barber-phone').value = barber.phone;
    document.getElementById('barber-specialty').value = barber.specialty;
    document.getElementById('barber-rate').value = barber.rate;
    document.getElementById('barber-status').value = barber.status;

    new bootstrap.Modal(document.getElementById('addBarberModal')).show();
}

function deleteBarber(id) {
    if (confirm('Delete this barber? This will remove them from the system permanently.')) {
        fetch('delete_barber.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                loadBarbers();
            } else {
                showNotification(data.message, 'danger');
            }
        });
    }
}