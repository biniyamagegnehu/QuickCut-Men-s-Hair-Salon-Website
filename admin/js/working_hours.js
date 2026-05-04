// working_hours.js
document.addEventListener('DOMContentLoaded', function() {
    setupWorkingHoursHandlers();
});

function setupWorkingHoursHandlers() {
    const form = document.getElementById('working-hours-form');
    const switches = document.querySelectorAll('.closed-switch');
    
    // Handle switch change to enable/disable time inputs
    switches.forEach(sw => {
        sw.addEventListener('change', function() {
            const row = this.closest('.day-row');
            const timeInputs = row.querySelectorAll('input[type="time"]');
            
            if (this.checked) {
                row.classList.add('closed');
                timeInputs.forEach(input => input.disabled = true);
            } else {
                row.classList.remove('closed');
                timeInputs.forEach(input => input.disabled = false);
            }
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const hoursData = [];
        const rows = document.querySelectorAll('.day-row');
        
        rows.forEach(row => {
            const day = row.dataset.day;
            const open = row.querySelector(`input[name="open_${day}"]`).value;
            const close = row.querySelector(`input[name="close_${day}"]`).value;
            const is_closed = row.querySelector(`input[name="closed_${day}"]`).checked ? 1 : 0;
            
            hoursData.push({
                day_of_week: day,
                open_time: open,
                close_time: close,
                is_closed: is_closed
            });
        });
        
        fetch('update_working_hours.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours: hoursData })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
            } else {
                showNotification(data.message, 'danger');
            }
        })
        .catch(err => {
            console.error('Error updating working hours:', err);
            showNotification('An error occurred while saving', 'danger');
        });
    });
}

function showNotification(message, type) {
    // Assuming showNotification exists in common.js or similar, if not implement a simple toast
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}
