// appointments.js - Appointments specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initAppointments();
    
    // Check for edit parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        editAppointment(parseInt(editId));
    }
});

// Initialize appointments
function initAppointments() {
    // Populate barber filter
    populateBarberFilter();
    
    // Load appointments
    loadAppointments();
    
    // Setup event listeners
    setupAppointmentEventListeners();
}

// Populate barber filter
function populateBarberFilter() {
    const barberFilter = document.getElementById('filter-barber');
    if (!barberFilter) return;
    
    barberFilter.innerHTML = '<option value="">All Barbers</option>';
    barbers.forEach(barber => {
        if (barber.status === 'active') {
            barberFilter.innerHTML += `<option value="${barber.id}">${barber.firstName} ${barber.lastName}</option>`;
        }
    });
}

// Load appointments
function loadAppointments(dateFilter = '', statusFilter = '') {
    const tbody = document.getElementById('appointments-list');
    if (!tbody) return;
    
    let url = 'get_appointments.php?';
    if (dateFilter) url += `date=${encodeURIComponent(dateFilter)}&`;
    if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error(data.message);
                return;
            }
            
            const fetchedAppointments = data.appointments;
            
            if (fetchedAppointments.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center py-4">
                            <div class="empty-state">
                                <i class="fas fa-calendar-times"></i>
                                <h4>No Appointments Found</h4>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = '';
            fetchedAppointments.forEach(appointment => {
                const row = document.createElement('tr');
                
                // Format payment status badge
                let payBadgeClass = 'bg-secondary';
                if (appointment.payment_status === 'paid') payBadgeClass = 'bg-success';
                else if (appointment.payment_status === 'pending') payBadgeClass = 'bg-warning text-dark';
                else if (appointment.payment_status === 'failed') payBadgeClass = 'bg-danger';
                
                const paymentBadge = `<span class="badge ${payBadgeClass}">${(appointment.payment_status || 'none').toUpperCase()}</span>`;
                
                row.innerHTML = `
                    <td>${appointment.id}</td>
                    <td><strong>${appointment.customer_name}</strong></td>
                    <td>${appointment.customer_phone || '-'}</td>
                    <td>${appointment.service_name}</td>
                    <td>${appointment.barber_name || '<span class="text-muted">Any</span>'}</td>
                    <td>${appointment.appointment_date}<br><small>${appointment.appointment_time}</small></td>
                    <td>${parseFloat(appointment.service_price).toFixed(2)}</td>
                    <td class="text-primary fw-bold">${parseFloat(appointment.paid_amount || 0).toFixed(2)}</td>
                    <td>${paymentBadge}</td>
                    <td>
                        <select class="form-select form-select-sm status-dropdown ${appointment.status}" 
                                data-id="${appointment.id}"
                                onchange="updateAppointmentStatusAPI(${appointment.id}, this.value)">
                            <option value="pending" ${appointment.status === 'pending' ? 'selected' : ''}>Pending Pay</option>
                            <option value="waiting" ${appointment.status === 'waiting' ? 'selected' : ''}>Waiting</option>
                            <option value="in_progress" ${appointment.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-info me-1" onclick="viewAppointmentDetails(${appointment.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${appointment.id})" title="Delete" disabled>
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

function updateAppointmentStatusAPI(id, newStatus) {
    fetch('update_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: id, status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            loadAppointments(
                document.getElementById('filter-date')?.value || '', 
                document.getElementById('filter-status')?.value || ''
            );
        } else {
            showNotification(data.message, 'danger');
        }
    })
    .catch(err => console.error(err));
}

// Setup appointment event listeners
function setupAppointmentEventListeners() {
    // Appointment filters
    const filterDate = document.getElementById('filter-date');
    const filterStatus = document.getElementById('filter-status');
    const filterBarber = document.getElementById('filter-barber');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (filterDate) filterDate.addEventListener('change', filterAppointments);
    if (filterStatus) filterStatus.addEventListener('change', filterAppointments);
    if (filterBarber) filterBarber.addEventListener('change', filterAppointments);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Export appointments
    const exportBtn = document.getElementById('export-appointments');
    if (exportBtn) exportBtn.addEventListener('click', exportAppointments);
    
    // Add appointment form
    const addAppointmentForm = document.getElementById('addAppointmentForm');
    if (addAppointmentForm) {
        addAppointmentForm.addEventListener('submit', addNewAppointment);
        
        // Populate dropdowns
        populateAppointmentDropdowns();
    }
}

// Filter appointments
function filterAppointments() {
    const dateFilter = document.getElementById('filter-date')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    
    // Barber filter not currently supported natively by API unless we update get_appointments.php, ignoring for now.
    loadAppointments(dateFilter, statusFilter);
}

// Clear filters
function clearFilters() {
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-barber').value = '';
    loadAppointments();
    showNotification('Filters cleared', 'info');
}

// Populate appointment dropdowns
function populateAppointmentDropdowns() {
    // Populate customer dropdown
    const customerSelect = document.getElementById('appointment-customer');
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.id}">${customer.firstName} ${customer.lastName} (${customer.phone})</option>`;
        });
    }
    
    // Populate service dropdown
    const serviceSelect = document.getElementById('appointment-service');
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select Service</option>';
        services.forEach(service => {
            if (service.status === 'active') {
                serviceSelect.innerHTML += `<option value="${service.id}" data-price="${service.price}">${service.name} - ETB ${service.price}</option>`;
            }
        });
    }
    
    // Populate barber dropdown
    const barberSelect = document.getElementById('appointment-barber');
    if (barberSelect) {
        barberSelect.innerHTML = '<option value="">Select Barber</option>';
        barbers.forEach(barber => {
            if (barber.status === 'active') {
                barberSelect.innerHTML += `<option value="${barber.id}">${barber.firstName} ${barber.lastName}</option>`;
            }
        });
    }
    
    // Set default date to today
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }
    
    // Set default time to next hour
    const timeInput = document.getElementById('appointment-time');
    if (timeInput) {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const hours = nextHour.getHours().toString().padStart(2, '0');
        const minutes = '00';
        timeInput.value = `${hours}:${minutes}`;
    }
}

// Add new appointment
function addNewAppointment(e) {
    e.preventDefault();
    
    const customerSelect = document.getElementById('appointment-customer');
    const serviceSelect = document.getElementById('appointment-service');
    const barberSelect = document.getElementById('appointment-barber');
    const dateInput = document.getElementById('appointment-date');
    const timeInput = document.getElementById('appointment-time');
    
    // Get selected values
    const customerId = parseInt(customerSelect.value);
    const serviceId = parseInt(serviceSelect.value);
    const barberId = parseInt(barberSelect.value);
    
    // Find customer, service, and barber
    const customer = customers.find(c => c.id === customerId);
    const service = services.find(s => s.id === serviceId);
    const barber = barbers.find(b => b.id === barberId);
    
    if (!customer || !service || !barber) {
        showNotification('Please select valid customer, service, and barber', 'danger');
        return;
    }
    
    // Format time
    const timeValue = timeInput.value;
    const [hours, minutes] = timeValue.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
    
    // Create new appointment
    const newAppointment = {
        id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1,
        customer: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        service: service.name,
        barber: `${barber.firstName} ${barber.lastName}`,
        date: dateInput.value,
        time: formattedTime,
        amount: service.price,
        status: 'scheduled',
        duration: parseInt(document.getElementById('appointment-duration').value) || service.duration,
        notes: document.getElementById('appointment-notes').value
    };
    
    appointments.push(newAppointment);
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addAppointmentForm').reset();
    
    // Reload appointments
    loadAppointments();
    
    showNotification('New appointment scheduled successfully!', 'success');
}

// Edit appointment
function editAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    
    // Store appointment ID for update
    localStorage.setItem('edit-appointment-id', id);
    
    // Populate modal
    populateAppointmentDropdowns();
    
    // Set values
    const customer = customers.find(c => 
        `${c.firstName} ${c.lastName}` === appointment.customer
    );
    const service = services.find(s => s.name === appointment.service);
    const barber = barbers.find(b => 
        `${b.firstName} ${b.lastName}` === appointment.barber
    );
    
    if (customer) document.getElementById('appointment-customer').value = customer.id;
    if (service) document.getElementById('appointment-service').value = service.id;
    if (barber) document.getElementById('appointment-barber').value = barber.id;
    
    document.getElementById('appointment-date').value = appointment.date;
    
    // Format time back to 24-hour format
    const timeParts = appointment.time.split(' ');
    const [time, ampm] = timeParts;
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    document.getElementById('appointment-time').value = 
        `${hour24.toString().padStart(2, '0')}:${minutes}`;
    
    document.getElementById('appointment-duration').value = appointment.duration;
    document.getElementById('appointment-notes').value = appointment.notes || '';
    
    // Change modal title
    document.querySelector('#addAppointmentModal .modal-title').textContent = 'Edit Appointment';
    
    // Update form submit handler
    const form = document.getElementById('addAppointmentForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateAppointmentDetails(id);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addAppointmentModal'));
    modal.show();
}

// Update appointment details
function updateAppointmentDetails(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    
    // Get form values
    const customerSelect = document.getElementById('appointment-customer');
    const serviceSelect = document.getElementById('appointment-service');
    const barberSelect = document.getElementById('appointment-barber');
    
    const customerId = parseInt(customerSelect.value);
    const serviceId = parseInt(serviceSelect.value);
    const barberId = parseInt(barberSelect.value);
    
    const customer = customers.find(c => c.id === customerId);
    const service = services.find(s => s.id === serviceId);
    const barber = barbers.find(b => b.id === barberId);
    
    if (!customer || !service || !barber) {
        showNotification('Please select valid customer, service, and barber', 'danger');
        return;
    }
    
    // Format time
    const timeValue = document.getElementById('appointment-time').value;
    const [hours, minutes] = timeValue.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
    
    // Update appointment
    appointment.customer = `${customer.firstName} ${customer.lastName}`;
    appointment.phone = customer.phone;
    appointment.service = service.name;
    appointment.barber = `${barber.firstName} ${barber.lastName}`;
    appointment.date = document.getElementById('appointment-date').value;
    appointment.time = formattedTime;
    appointment.amount = service.price;
    appointment.duration = parseInt(document.getElementById('appointment-duration').value) || service.duration;
    appointment.notes = document.getElementById('appointment-notes').value;
    
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal'));
    modal.hide();
    
    // Reset form and title
    document.getElementById('addAppointmentForm').reset();
    document.querySelector('#addAppointmentModal .modal-title').textContent = 'Add New Appointment';
    
    // Reload appointments
    loadAppointments();
    
    showNotification(`Appointment #${id} updated successfully`, 'success');
    
    // Clear stored ID
    localStorage.removeItem('edit-appointment-id');
}

// Delete appointment
function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            appointments.splice(index, 1);
            saveAllData();
            loadAppointments();
            showNotification(`Appointment #${id} deleted successfully`, 'success');
        }
    }
}

// View appointment details
function viewAppointmentDetails(id) {
    fetch(`get_payment_status.php?appointment_id=${id}`)
        .then(res => res.json())
        .then(data => {
            // Find the local appointment data for basic info
            // In a real app, we'd fetch all details from the backend
            // For now, let's just show what we have.
            
            let paymentMsg = "No payment record found.";
            if (data.success && data.payment) {
                const p = data.payment;
                paymentMsg = `
--- PAYMENT INFO ---
Status: ${p.status.toUpperCase()}
Amount Paid: ${p.amount} ETB
Remaining Balance: ${p.remaining_balance} ETB
Transaction Ref: ${p.transaction_ref}
Date Paid: ${p.created_at}
                `;
            }
            
            alert(`Appointment #${id}\n${paymentMsg}`);
        })
        .catch(err => {
            console.error(err);
            alert(`Appointment #${id}\nError loading payment details.`);
        });
}

// Export appointments
function exportAppointments() {
    exportToCSV(appointments, 'appointments');
}