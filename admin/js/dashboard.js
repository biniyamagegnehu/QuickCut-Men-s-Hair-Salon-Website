// dashboard.js - Dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

// Initialize dashboard
function initDashboard() {
    // Update stats cards from API
    fetch('dashboard_stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStatsCards(data.stats);
            } else {
                if (data.message && data.message.includes('Unauthorized')) {
                    window.location.href = '../auth/login.php';
                }
            }
        })
        .catch(err => console.error(err));
        
    // Load today's appointments
    loadTodayAppointments();
    
    // Initialize charts
    initCharts();
}

// Update stats cards
function updateStatsCards(stats) {
    const statsCards = document.getElementById('stats-cards');
    statsCards.innerHTML = `
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-primary">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stats-info">
                    <h3 id="today-appointments">${stats.total_appointments}</h3>
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
                    <h3 id="current-queue">${stats.waiting_customers}</h3>
                    <p>Waiting Customers</p>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-warning">
                    <i class="fas fa-check-double"></i>
                </div>
                <div class="stats-info">
                    <h3 id="today-completed">${stats.completed_appointments}</h3>
                    <p>Completed Today</p>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-icon bg-info">
                    <i class="fas fa-cut"></i>
                </div>
                <div class="stats-info">
                    <h3 id="active-customer" style="font-size: 1.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${stats.active_customer || 'None'}">${stats.active_customer || 'None'}</h3>
                    <p>Active Customer</p>
                </div>
            </div>
        </div>
    `;
}

// Load today's appointments from database
function loadTodayAppointments() {
    const tbody = document.getElementById('today-appointments-list');
    if (!tbody) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    fetch(`get_appointments.php?date=${today}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderTodayAppointments(data.appointments);
            } else {
                console.error('Error loading appointments:', data.message);
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data</td></tr>';
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Server error</td></tr>';
        });
}

function renderTodayAppointments(appointments) {
    const tbody = document.getElementById('today-appointments-list');
    
    if (appointments.length === 0) {
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
    
    appointments.forEach(app => {
        const row = document.createElement('tr');
        // Format time to 12h if needed, or use as is
        const timeStr = app.appointment_time;
        
        row.innerHTML = `
            <td><strong>${timeStr}</strong></td>
            <td>${app.customer_name}</td>
            <td><span class="phone-display">${app.customer_phone}</span></td>
            <td>${app.service_name}</td>
            <td>${app.barber_name || 'Unassigned'}</td>
            <td>
                <select class="status-dropdown ${app.status}" 
                        onchange="updateAppointmentStatus(${app.id}, this.value)">
                    <option value="scheduled" ${app.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="confirmed" ${app.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="in-progress" ${app.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${app.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${app.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="window.location.href='appointments.php?id=${app.id}'">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteAppointment(${app.id})">
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
    window.location.href = `appointments.php?edit=${id}`;
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