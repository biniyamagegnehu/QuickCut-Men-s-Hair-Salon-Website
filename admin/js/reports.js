// reports.js - Reports specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initReports();
});

// Initialize reports
function initReports() {
    setupReportEventListeners();
    updateReportPeriod();
    generateReport();
}

// Setup report event listeners
function setupReportEventListeners() {
    // Report period change
    const reportPeriod = document.getElementById('report-period');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', updateReportPeriod);
    }
    
    // Report type change
    const reportType = document.getElementById('report-type');
    if (reportType) {
        reportType.addEventListener('change', updateReportType);
    }
    
    // Generate report button
    const generateBtn = document.getElementById('generate-report');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
    
    // Export report button
    const exportBtn = document.getElementById('export-report');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }
}

// Update report period
function updateReportPeriod() {
    const period = document.getElementById('report-period')?.value || 'month';
    const today = new Date();
    let startDate = new Date();
    
    switch(period) {
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }
    
    const startInput = document.getElementById('report-start');
    const endInput = document.getElementById('report-end');
    
    if (startInput) startInput.value = startDate.toISOString().split('T')[0];
    if (endInput) endInput.value = today.toISOString().split('T')[0];
}

// Update report type
function updateReportType() {
    const reportType = document.getElementById('report-type')?.value || 'revenue';
    const reportTitle = document.getElementById('report-title');
    
    if (reportTitle) {
        const titles = {
            'revenue': 'Revenue Report',
            'appointments': 'Appointments Report',
            'services': 'Services Report',
            'barbers': 'Barbers Performance Report'
        };
        reportTitle.textContent = titles[reportType] || 'Report';
    }
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('report-type')?.value || 'revenue';
    const period = document.getElementById('report-period')?.value || 'month';
    
    // Update summary
    updateReportSummary(reportType, period);
    
    // Update chart
    updateReportChart(reportType, period);
    
    showNotification(`${reportType} report generated for ${period}`, 'success');
}

// Update report summary
function updateReportSummary(reportType, period) {
    const summary = document.getElementById('report-summary');
    if (!summary) return;
    
    let summaryItems = [];
    
    switch(reportType) {
        case 'revenue':
            const totalRevenue = appointments.reduce((sum, a) => sum + a.amount, 0);
            const avgRevenue = totalRevenue / appointments.length || 0;
            const todayRevenue = appointments
                .filter(a => a.date === new Date().toISOString().split('T')[0])
                .reduce((sum, a) => sum + a.amount, 0);
            
            summaryItems = [
                { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
                { label: 'Average per Appointment', value: formatCurrency(avgRevenue) },
                { label: "Today's Revenue", value: formatCurrency(todayRevenue) },
                { label: 'Total Appointments', value: appointments.length },
                { label: 'Completed Appointments', value: appointments.filter(a => a.status === 'completed').length }
            ];
            break;
            
        case 'appointments':
            const completedApps = appointments.filter(a => a.status === 'completed').length;
            const cancelledApps = appointments.filter(a => a.status === 'cancelled').length;
            const completionRate = appointments.length > 0 ? 
                Math.round((completedApps / appointments.length) * 100) : 0;
            
            summaryItems = [
                { label: 'Total Appointments', value: appointments.length },
                { label: 'Completed', value: completedApps },
                { label: 'Cancelled', value: cancelledApps },
                { label: 'Completion Rate', value: `${completionRate}%` },
                { label: 'Average Duration', value: '30 min' }
            ];
            break;
            
        case 'services':
            const popularService = services.reduce((prev, current) => 
                (prev.price > current.price) ? prev : current
            );
            const totalServices = services.length;
            const activeServices = services.filter(s => s.status === 'active').length;
            
            summaryItems = [
                { label: 'Total Services', value: totalServices },
                { label: 'Active Services', value: activeServices },
                { label: 'Most Popular Service', value: popularService.name },
                { label: 'Highest Price', value: formatCurrency(popularService.price) },
                { label: 'Average Duration', value: '35 min' }
            ];
            break;
            
        case 'barbers':
            const activeBarbers = barbers.filter(b => b.status === 'active').length;
            const topBarber = barbers.reduce((prev, current) => 
                (prev.appointments > current.appointments) ? prev : current
            );
            const totalBarberEarnings = barbers.reduce((sum, b) => sum + b.earnings, 0);
            
            summaryItems = [
                { label: 'Total Barbers', value: barbers.length },
                { label: 'Active Barbers', value: activeBarbers },
                { label: 'Top Barber', value: `${topBarber.firstName} ${topBarber.lastName}` },
                { label: 'Total Barber Earnings', value: formatCurrency(totalBarberEarnings) },
                { label: 'Average Rating', value: '4.8' }
            ];
            break;
            
        default:
            summaryItems = [
                { label: 'Loading...', value: '...' }
            ];
    }
    
    summary.innerHTML = summaryItems.map(item => `
        <div class="summary-item">
            <span class="label">${item.label}</span>
            <span class="value">${item.value}</span>
        </div>
    `).join('');
}

// Update report chart
function updateReportChart(reportType, period) {
    const ctx = document.getElementById('detailedRevenueChart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.reportChart) {
        window.reportChart.destroy();
    }
    
    let chartData = {};
    let chartType = 'bar';
    let chartOptions = {};
    
    switch(reportType) {
        case 'revenue':
            chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue (ETB)',
                    data: [85000, 92000, 105000, 98000, 112000, 125000, 135000, 128000, 142000, 138000, 152000, 165000],
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: '#ff6b35',
                    borderWidth: 2
                }]
            };
            chartType = 'bar';
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { drawBorder: false },
                        ticks: { 
                            callback: value => 'ETB ' + (value / 1000).toFixed(0) + 'K'
                        }
                    },
                    x: { grid: { display: false } }
                }
            };
            break;
            
        case 'appointments':
            chartData = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Scheduled',
                        data: [12, 15, 18, 14, 20, 25, 16],
                        backgroundColor: 'rgba(23, 162, 184, 0.8)',
                        borderColor: '#17a2b8',
                        borderWidth: 2
                    },
                    {
                        label: 'Completed',
                        data: [10, 13, 16, 12, 18, 22, 14],
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: '#28a745',
                        borderWidth: 2
                    }
                ]
            };
            chartType = 'bar';
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { drawBorder: false },
                        ticks: { precision: 0 }
                    },
                    x: { grid: { display: false } }
                }
            };
            break;
            
        case 'services':
            chartData = {
                labels: services.map(s => s.name),
                datasets: [{
                    label: 'Bookings',
                    data: [45, 25, 20, 10, 5],
                    backgroundColor: [
                        '#ff6b35',
                        '#28a745',
                        '#ffc107',
                        '#17a2b8',
                        '#6c757d'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };
            chartType = 'pie';
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 20, usePointStyle: true }
                    }
                }
            };
            break;
            
        case 'barbers':
            chartData = {
                labels: barbers.map(b => `${b.firstName} ${b.lastName}`),
                datasets: [
                    {
                        label: 'Appointments',
                        data: barbers.map(b => b.appointments),
                        backgroundColor: 'rgba(255, 107, 53, 0.8)',
                        borderColor: '#ff6b35',
                        borderWidth: 2
                    },
                    {
                        label: 'Earnings (ETB)',
                        data: barbers.map(b => b.earnings / 100),
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: '#28a745',
                        borderWidth: 2,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            };
            chartType = 'bar';
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Appointments' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Earnings (ETB)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            };
            break;
    }
    
    window.reportChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });
}

// Export report
function exportReport() {
    const reportType = document.getElementById('report-type')?.value || 'revenue';
    const period = document.getElementById('report-period')?.value || 'month';
    
    let exportData = [];
    let filename = '';
    
    switch(reportType) {
        case 'revenue':
            exportData = appointments.map(app => ({
                ID: app.id,
                Customer: app.customer,
                Service: app.service,
                Barber: app.barber,
                Date: app.date,
                Time: app.time,
                Amount: app.amount,
                Status: app.status
            }));
            filename = `revenue-report-${period}`;
            break;
            
        case 'appointments':
            exportData = appointments.map(app => ({
                ID: app.id,
                Customer: app.customer,
                Phone: app.phone,
                Service: app.service,
                Barber: app.barber,
                Date: app.date,
                Time: app.time,
                Status: app.status,
                Notes: app.notes || ''
            }));
            filename = `appointments-report-${period}`;
            break;
            
        case 'services':
            exportData = services.map(service => ({
                Service: service.name,
                Description: service.description,
                Duration: `${service.duration} min`,
                Price: service.price,
                Category: service.category,
                Status: service.status
            }));
            filename = `services-report-${period}`;
            break;
            
        case 'barbers':
            exportData = barbers.map(barber => ({
                Name: `${barber.firstName} ${barber.lastName}`,
                Email: barber.email,
                Phone: barber.phone,
                Specialty: barber.specialty,
                Rate: barber.rate,
                Appointments: barber.appointments,
                Earnings: barber.earnings,
                Rating: barber.rating,
                Status: barber.status
            }));
            filename = `barbers-report-${period}`;
            break;
    }
    
    exportToCSV(exportData, filename);
}