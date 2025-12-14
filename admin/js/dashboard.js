// dashboard.js - Dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

// Initialize dashboard
function initDashboard() {
    // Update stats cards
    updateStatsCards();
    
    // Load today's appointments
    loadTodayAppointments();
    
    // Initialize charts
    initCharts();
}

// Update stats cards
function updateStatsCards() {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date === today);
    const todayRevenue = todayApps.reduce((sum, a) => sum + a.amount, 0);
    const activeBarbersCount = barbers.filter(b => b.status === 'active').length;
    const currentQueue = appointments.filter(a => 
        (a.status === 'scheduled' || a.status === 'confirmed') && 
        a.date === today
    ).length;
    
    const statsCards = document.getElementById('stats-cards');
    statsCards.innerHTML = `
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-primary">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stats-info">
                    <h3 id="today-appointments">${todayApps.length}</h3>
                    <p>Today's Appointments</p>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-success">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div class="stats-info">
                    <h3 id="current-queue">${currentQueue}</h3>
                    <p>Current Queue</p>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-warning">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stats-info">
                    <h3 id="today-revenue">${formatCurrency(todayRevenue)}</h3>
                    <p>Today's Revenue</p>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-info">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stats-info">
                    <h3 id="active-barbers">${activeBarbersCount}</h3>
                    <p>Active Barbers</p>
                </div>
            </div>
        </div>
    `;
}

// Load today's appointments
function loadTodayAppointments() {
    const todayApps = getTodayAppointments();
    const tbody = document.getElementById('today-appointments-list');
    
    if (todayApps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No appointments scheduled for today</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    todayApps.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${appointment.time}</strong></td>
            <td>${appointment.customer}</td>
            <td><span class="phone-display">${appointment.phone}</span></td>
            <td>${appointment.service}</td>
            <td>${appointment.barber}</td>
            <td>
                <select class="status-dropdown ${appointment.status}" 
                        data-id="${appointment.id}"
                        onchange="updateAppointmentStatus(${appointment.id}, this.value)">
                    <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="confirmed" ${appointment.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="in-progress" ${appointment.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editAppointment(${appointment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteAppointment(${appointment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize charts
function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    window.revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue (ETB)',
                data: [6500, 7200, 8000, 8500, 9000, 12000, 9500],
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { drawBorder: false },
                    ticks: { 
                        callback: value => 'ETB ' + value.toLocaleString()
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // Service Distribution Chart
    const serviceCtx = document.getElementById('serviceChart').getContext('2d');
    window.serviceChart = new Chart(serviceCtx, {
        type: 'doughnut',
        data: {
            labels: ['Haircut', 'Beard Trim', 'Premium Package', 'Other'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: ['#ff6b35', '#28a745', '#ffc107', '#17a2b8'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true }
                }
            }
        }
    });
    
    // Chart period change
    document.getElementById('chart-period').addEventListener('change', function() {
        updateCharts();
    });
}

// Update charts
function updateCharts() {
    const period = document.getElementById('chart-period').value;
    showNotification(`Charts updated for ${period}`, 'info');
}

// Edit appointment
function editAppointment(id) {
    window.location.href = `appointments.html?edit=${id}`;
}

// Delete appointment
function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            appointments.splice(index, 1);
            saveAllData();
            loadTodayAppointments();
            updateStatsCards();
            showNotification(`Appointment #${id} deleted successfully`, 'success');
        }
    }
}