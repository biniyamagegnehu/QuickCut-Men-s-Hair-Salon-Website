// customers.js - Customers specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initCustomers();
});

// Initialize customers
function initCustomers() {
    loadCustomers();
    setupCustomerEventListeners();
}

// Load customers
function loadCustomers() {
    const tbody = document.getElementById('customers-list');
    if (!tbody) return;
    
    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h4>No Customers Found</h4>
                        <p>Add your first customer to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        let statusClass = '';
        let statusText = '';
        
        switch(customer.status) {
            case 'active': statusClass = 'status-active'; statusText = 'Active'; break;
            case 'new': statusClass = 'status-new'; statusText = 'New'; break;
            case 'vip': statusClass = 'status-vip'; statusText = 'VIP'; break;
            case 'inactive': statusClass = 'status-inactive'; statusText = 'Inactive'; break;
            default: statusClass = 'status-inactive'; statusText = 'Inactive';
        }
        
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>
                <strong>${customer.firstName} ${customer.lastName}</strong>
                <br>
                <small class="text-muted">${customer.address || 'No address'}</small>
            </td>
            <td><span class="phone-display">${customer.phone}</span></td>
            <td>${customer.email || '-'}</td>
            <td><span class="appointments-count">${customer.appointments}</span></td>
            <td><span class="total-spent">${formatCurrency(customer.totalSpent)}</span></td>
            <td>
                <span class="customer-status ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewCustomer(${customer.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup customer event listeners
function setupCustomerEventListeners() {
    // Add customer form
    const addCustomerForm = document.getElementById('addCustomerForm');
    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', addNewCustomer);
    }
    
    // Export customers
    const exportBtn = document.getElementById('export-customers');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCustomers);
    }
}

// Add new customer
function addNewCustomer(e) {
    e.preventDefault();
    
    const newCustomer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1001,
        firstName: document.getElementById('customer-first-name').value,
        lastName: document.getElementById('customer-last-name').value,
        email: document.getElementById('customer-email').value || '',
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value || '',
        appointments: 0,
        totalSpent: 0,
        status: 'new',
        notes: document.getElementById('customer-notes').value || ''
    };
    
    customers.push(newCustomer);
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addCustomerForm').reset();
    
    // Reload customers
    loadCustomers();
    
    showNotification('New customer added successfully!', 'success');
}

// View customer details
function viewCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (customer) {
        const details = `
            Customer Details:
            
            ID: ${customer.id}
            Name: ${customer.firstName} ${customer.lastName}
            Email: ${customer.email || 'Not provided'}
            Phone: ${customer.phone}
            Address: ${customer.address || 'Not provided'}
            Appointments: ${customer.appointments}
            Total Spent: ${formatCurrency(customer.totalSpent)}
            Status: ${customer.status}
            Notes: ${customer.notes || 'None'}
        `;
        alert(details);
    }
}

// Edit customer
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    // Store customer ID for update
    localStorage.setItem('edit-customer-id', id);
    
    // Populate form
    document.getElementById('customer-first-name').value = customer.firstName;
    document.getElementById('customer-last-name').value = customer.lastName;
    document.getElementById('customer-email').value = customer.email || '';
    document.getElementById('customer-phone').value = customer.phone;
    document.getElementById('customer-address').value = customer.address || '';
    document.getElementById('customer-notes').value = customer.notes || '';
    
    // Change modal title
    document.querySelector('#addCustomerModal .modal-title').textContent = 'Edit Customer';
    
    // Update form submit handler
    const form = document.getElementById('addCustomerForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateCustomerDetails(id);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
}

// Update customer details
function updateCustomerDetails(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    // Update customer
    customer.firstName = document.getElementById('customer-first-name').value;
    customer.lastName = document.getElementById('customer-last-name').value;
    customer.email = document.getElementById('customer-email').value || '';
    customer.phone = document.getElementById('customer-phone').value;
    customer.address = document.getElementById('customer-address').value || '';
    customer.notes = document.getElementById('customer-notes').value || '';
    
    // Auto-update status based on appointments
    if (customer.appointments >= 10) {
        customer.status = 'vip';
    } else if (customer.appointments > 0) {
        customer.status = 'active';
    }
    
    saveAllData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    modal.hide();
    
    // Reset form and title
    document.getElementById('addCustomerForm').reset();
    document.querySelector('#addCustomerModal .modal-title').textContent = 'Add New Customer';
    
    // Reload customers
    loadCustomers();
    
    showNotification(`Customer ${customer.firstName} ${customer.lastName} updated successfully`, 'success');
    
    // Clear stored ID
    localStorage.removeItem('edit-customer-id');
}

// Delete customer
function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            const customerName = `${customers[index].firstName} ${customers[index].lastName}`;
            customers.splice(index, 1);
            saveAllData();
            loadCustomers();
            showNotification(`Customer ${customerName} deleted successfully`, 'success');
        }
    }
}

// Export customers
function exportCustomers() {
    exportToCSV(customers, 'customers');
}