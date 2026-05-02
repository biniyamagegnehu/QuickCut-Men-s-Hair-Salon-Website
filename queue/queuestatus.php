<?php
session_start();
require_once '../includes/db.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: ../auth/login.php");
    exit;
}
include '../includes/header.php';
?>
<style>
    .queue-page-wrapper {
        padding-top: 120px;
        padding-bottom: 80px;
        background-color: #f8f9fa;
        min-height: 100vh;
    }
    .status-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        margin-bottom: 40px;
        border: 1px solid #eee;
    }
    .pos-num {
        font-size: 4rem;
        font-weight: 800;
        color: var(--primary-color);
        font-family: 'Playfair Display', serif;
    }
    
    /* Date Selector */
    .date-selector {
        display: flex;
        gap: 15px;
        overflow-x: auto;
        padding: 10px 5px;
        margin-bottom: 30px;
        scrollbar-width: none; /* Firefox */
    }
    .date-selector::-webkit-scrollbar { display: none; }
    
    .date-btn {
        flex: 0 0 100px;
        background: white;
        border: 1px solid #eee;
        padding: 15px 10px;
        border-radius: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .date-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
    }
    .date-btn .day { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .date-btn .num { font-size: 1.5rem; font-weight: 800; display: block; }

    /* Queue List */
    .queue-container {
        background: white;
        border-radius: 20px;
        padding: 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        overflow: hidden;
        border: 1px solid #eee;
    }
    .queue-header {
        background: #1a1a1a;
        color: white;
        display: grid;
        grid-template-columns: 80px 1.5fr 1.5fr 1fr 120px;
        padding: 15px 20px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .queue-item {
        display: grid;
        grid-template-columns: 80px 1.5fr 1.5fr 1fr 120px;
        padding: 20px;
        border-bottom: 1px solid #f5f5f5;
        align-items: center;
        transition: background 0.3s ease;
    }
    .queue-item:hover { background-color: #fafafa; }
    .queue-item.user-row { background-color: #fff9f6; }
    
    .q-pos { font-weight: 800; font-size: 1.2rem; color: #aaa; }
    .q-name { font-weight: 700; color: #333; }
    .q-info { font-size: 0.9rem; color: #666; }
    .q-status { text-align: right; }
    
    .badge-status {
        padding: 6px 12px;
        border-radius: 30px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    .status-serving { background: #e8f5e9; color: #2e7d32; }
    .status-waiting { background: #fff8e1; color: #f57c00; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-pending { background: #f5f5f5; color: #888; }

    .ready-banner {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        padding: 15px;
        border-radius: 12px;
        margin-top: 20px;
        font-weight: 700;
        text-align: center;
        display: none;
        animation: pulse 2s infinite;
    }
</style>

<div class="queue-page-wrapper">
    <div class="container">
        
        <!-- Page Header -->
        <div class="text-center mb-5">
            <h6 class="text-primary text-uppercase fw-bold">Live Status</h6>
            <h2 class="display-5 fw-bold">Appointment Queue</h2>
            <p class="text-muted">Stay updated on your position and wait times</p>
        </div>

        <div class="row">
            <div class="col-lg-12">
                <!-- My Status Card -->
                <div class="status-card text-center" id="my-status-box">
                    <div id="no-booking" style="display:none;">
                        <i class="fas fa-calendar-times fa-3x mb-3 text-muted"></i>
                        <h3 class="fw-bold">No active booking today</h3>
                        <p class="text-muted">Your next appointment will appear here when it's near.</p>
                        <a href="../booking/bookappointment.php" class="btn btn-primary btn-lg mt-3 book-now-btn">Book Now</a>
                    </div>

                    <div id="has-booking">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <div class="pos-num" id="u-pos">--</div>
                                <div class="text-muted small fw-bold uppercase">Position</div>
                            </div>
                            <div class="col-md-6">
                                <h3 class="fw-bold" id="u-msg">Updating status...</h3>
                                <div class="d-flex justify-content-center gap-4 mt-3">
                                    <div>
                                        <div class="text-muted small fw-bold">BARBER</div>
                                        <div class="fw-bold" id="u-barber">--</div>
                                    </div>
                                    <div>
                                        <div class="text-muted small fw-bold">SERVICE</div>
                                        <div class="fw-bold" id="u-service">--</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="display-6 fw-bold text-primary" id="u-time">-- min</div>
                                <div class="text-muted small fw-bold">Est. Wait Time</div>
                            </div>
                        </div>
                        <div id="u-banner" class="ready-banner">
                            <i class="fas fa-bolt me-2"></i>YOU ARE NEXT! PLEASE BE READY
                        </div>
                    </div>
                </div>

                <!-- Date Scroller -->
                <h5 class="fw-bold mb-3"><i class="fas fa-calendar-day me-2 text-primary"></i>Schedule for All Days</h5>
                <div class="date-selector" id="date-picker">
                    <!-- Dates will be injected here -->
                </div>

                <!-- Full Queue List -->
                <div class="queue-container">
                    <div class="queue-header">
                        <div>POS</div>
                        <div>CUSTOMER</div>
                        <div>SERVICE</div>
                        <div>BARBER</div>
                        <div class="text-end">STATUS</div>
                    </div>
                    <div id="q-list">
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="mt-2 text-muted">Loading schedule...</p>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-4 text-muted small" id="last-updated">
                    Last updated: --:--
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let currentSelectedDate = '<?php echo date('Y-m-d'); ?>';

    document.addEventListener('DOMContentLoaded', () => {
        initDatePicker();
        refreshAllData();
        setInterval(refreshAllData, 20000); // Auto refresh every 20s
    });

    function initDatePicker() {
        const picker = document.getElementById('date-picker');
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            
            const btn = document.createElement('div');
            btn.className = `date-btn ${i === 0 ? 'active' : ''}`;
            btn.dataset.date = dateStr;
            btn.innerHTML = `
                <span class="day">${dayName}</span>
                <span class="num">${dayNum}</span>
            `;
            
            btn.onclick = () => {
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSelectedDate = dateStr;
                fetchQueue(dateStr);
            };
            
            picker.appendChild(btn);
        }
    }

    async function refreshAllData() {
        await Promise.all([
            fetchPosition(),
            fetchQueue(currentSelectedDate)
        ]);
        
        const now = new Date();
        document.getElementById('last-updated').textContent = 'Last updated: ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    async function fetchPosition() {
        try {
            const res = await fetch(BASE_URL + 'queue/get_position.php');
            const p = await res.json();
            
            const hasBooking = document.getElementById('has-booking');
            const noBooking = document.getElementById('no-booking');

            if (p.success) {
                hasBooking.style.display = 'block';
                noBooking.style.display = 'none';
                
                document.getElementById('u-barber').textContent = p.barber_name || 'Any';
                document.getElementById('u-service').textContent = p.service_name;

                if (p.type === 'upcoming') {
                    document.getElementById('u-pos').textContent = '...';
                    document.getElementById('u-time').textContent = '--';
                    const dateObj = new Date(p.appointment_date);
                    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    document.getElementById('u-msg').innerHTML = `Next: <span class="text-primary">${dateStr} at ${p.appointment_time}</span>`;
                    document.getElementById('u-banner').style.display = 'none';
                } else {
                    document.getElementById('u-pos').textContent = p.position;
                    document.getElementById('u-time').textContent = p.estimated_wait_time_minutes;
                    
                    let msg = "You're in line. Please wait.";
                    let alert = false;

                    if (p.status === 'in_progress') {
                        msg = "It's your turn! Head to the chair.";
                        document.getElementById('u-time').textContent = '0';
                    } else if (p.position <= 2) {
                        msg = "You're almost there! Be ready.";
                        alert = true;
                    }
                    
                    document.getElementById('u-msg').textContent = msg;
                    document.getElementById('u-banner').style.display = alert ? 'block' : 'none';
                }
            } else {
                hasBooking.style.display = 'none';
                noBooking.style.display = 'block';
            }
        } catch (e) { console.error(e); }
    }

    async function fetchQueue(date) {
        try {
            const res = await fetch(BASE_URL + 'queue/get_queue.php?date=' + date);
            const data = await res.json();
            const list = document.getElementById('q-list');

            if (data.success && data.queue && data.queue.length > 0) {
                let html = '';
                data.queue.forEach((item, i) => {
                    const isUser = item.is_user ? 'user-row' : '';
                    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
                    const statusClass = `status-${item.status}`;
                    const barber = item.barber_fname || 'Any';
                    
                    html += `
                        <div class="queue-item ${isUser}">
                            <div class="q-pos">#${i+1}</div>
                            <div class="q-name">${item.user_name} ${item.is_user ? '<span class="text-primary">(You)</span>' : ''}</div>
                            <div class="q-info">${item.service_name}</div>
                            <div class="q-info">${barber}</div>
                            <div class="q-status">
                                <span class="badge-status ${statusClass}">${statusText}</span>
                            </div>
                        </div>
                    `;
                });
                list.innerHTML = html;
            } else {
                list.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-day fa-3x mb-3 text-muted"></i>
                        <p class="text-muted">No appointments scheduled for this day.</p>
                    </div>
                `;
            }
        } catch (e) { console.error(e); }
    }
</script>

<?php include '../includes/footer.php'; ?>
