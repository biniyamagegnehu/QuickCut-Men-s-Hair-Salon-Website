// QuickCut - Book Appointment JavaScript
// Fully re-implemented for professional time selection and robust booking logic

document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZATION & DATA FETCHING ==========
    
    let BUSINESS_HOURS_DATA = [];
    
    // Fetch working hours from backend
    fetch(BASE_URL + 'booking/get_working_hours.php')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                BUSINESS_HOURS_DATA = data.working_hours;
                if (window.dateConfig) {
                    window.dateConfig.initializeDates();
                } else {
                    window.dateConfig = new DateConfig();
                }
            } else {
                console.error('Failed to load working hours:', data.message);
                if (!window.dateConfig) window.dateConfig = new DateConfig();
            }
        })
        .catch(err => {
            console.error('Error fetching working hours:', err);
            if (!window.dateConfig) window.dateConfig = new DateConfig();
        });

    // ========== DATE CONFIGURATION CLASS ==========
    class DateConfig {
        constructor() {
            this.currentDate = new Date();
            this.dates = [];
            this.selectedDate = null;
            this.bookedSlots = {};
            this.selectedTime = null;
            this.selectedTime24 = null;
            this.initializeDates();
            this.startDailyUpdate();
        }
        
        initializeDates() {
            this.dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(this.currentDate);
                date.setDate(this.currentDate.getDate() + i);
                
                const dateInfo = {
                    date: date,
                    dateString: date.toDateString(),
                    displayDate: this.formatDisplayDate(date, i),
                    isToday: i === 0,
                    isTomorrow: i === 1,
                    dayOfWeek: date.getDay(),
                    dayName: this.getDayName(date),
                    isAvailable: this.isDateAvailable(date, i === 0),
                    timeSlots: []
                };
                
                this.dates.push(dateInfo);
            }
            
            // Auto-select first available date
            const firstAvailable = this.dates.find(date => date.isAvailable);
            if (firstAvailable) {
                this.selectedDate = firstAvailable;
                this.loadBookedSlots(firstAvailable, true);
            }
            
            this.renderDateList();
        }
        
        formatDisplayDate(date, offset) {
            if (offset === 0) return 'Today';
            if (offset === 1) return 'Tomorrow';
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
        }

        getDayName(date) {
            return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
        }
        
        getHoursForDay(date) {
            const dayName = this.getDayName(date);
            const hours = BUSINESS_HOURS_DATA.find(h => h.day_of_week === dayName);
            
            if (!hours) return { open_hour: 9, open_minute: 0, close_hour: 20, close_minute: 0, is_closed: 0 };
            
            const [openH, openM] = hours.open_time.split(':').map(Number);
            const [closeH, closeM] = hours.close_time.split(':').map(Number);
            
            return {
                open_hour: openH, open_minute: openM,
                close_hour: closeH, close_minute: closeM,
                open_time: hours.open_time, close_time: hours.close_time,
                is_closed: parseInt(hours.is_closed)
            };
        }

        generateTimeSlots(date, isToday) {
            const slots = [];
            const hours = this.getHoursForDay(date);
            if (hours.is_closed) return [];

            const now = new Date();
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
            const openTimeMinutes = hours.open_hour * 60 + hours.open_minute;
            const closeTimeMinutes = hours.close_hour * 60 + hours.close_minute;
            
            for (let h = 0; h <= 23; h++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotTotalMinutes = h * 60 + minute;
                    const time24 = `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const time12 = this.format24to12(time24);
                    
                    const isWithinWorkingHours = slotTotalMinutes >= openTimeMinutes && slotTotalMinutes < closeTimeMinutes;
                    const isPassed = isToday && slotTotalMinutes < currentTotalMinutes + 30; // 30 min buffer
                    const isBooked = this.isTimeBookedLocally(date, time24);
                    
                    slots.push({
                        time24, time12,
                        isAvailable: isWithinWorkingHours && !isPassed && !isBooked,
                        isBooked, isWithinWorkingHours, isPassed,
                        totalMinutes: slotTotalMinutes
                    });
                }
            }
            return slots;
        }

        isTimeBookedLocally(date, time24) {
            const dateStr = date.toISOString().split('T')[0];
            if (this.bookedSlots[dateStr]) {
                return this.bookedSlots[dateStr].some(t => t.substring(0, 5) === time24);
            }
            return false;
        }

        loadBookedSlots(dateInfo, rerender = true) {
            if (!dateInfo) return Promise.resolve();
            const dateStr = dateInfo.date.toISOString().split('T')[0];

            return fetch(`get_booked_slots.php?date=${dateStr}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        this.bookedSlots[dateStr] = Array.isArray(data.booked_slots) ? data.booked_slots : [];
                        dateInfo.timeSlots = this.generateTimeSlots(dateInfo.date, dateInfo.isToday);
                        if (rerender && this.selectedDate === dateInfo) {
                            this.updateSelectedDateUI();
                            this.renderTimeInput();
                        }
                    }
                })
                .catch(err => console.error('Error fetching booked slots:', err));
        }

        isDateAvailable(date, isToday) {
            const hours = this.getHoursForDay(date);
            if (hours.is_closed) return false;
            
            if (isToday) {
                const now = new Date();
                const closeTimeMinutes = hours.close_hour * 60 + hours.close_minute;
                return (now.getHours() * 60 + now.getMinutes()) < closeTimeMinutes - 30;
            }
            return true;
        }

        format24to12(time24) {
            const [hours, minutes] = time24.split(':').map(Number);
            let period = hours >= 12 ? 'PM' : 'AM';
            let hour12 = hours % 12 || 12;
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }

        getSelectedTime12() {
            return this.selectedTime;
        }

        resetSelectedTime() {
            this.selectedTime   = null;
            this.selectedTime24 = null;
            const input = document.getElementById('time-input');
            if (input) input.value = '';
            const badge = document.getElementById('time-selected-badge');
            if (badge) { badge.innerHTML = ''; badge.style.display = 'none'; }
        }

        renderDateList() {
            const dateList = document.getElementById('date-list');
            if (!dateList) {
                this.createDateListContainer();
                return;
            }
            // Hide skeleton loader on first real render
            const skeleton = document.getElementById('date-skeleton-strip');
            if (skeleton) skeleton.style.display = 'none';

            dateList.innerHTML = '';
            this.dates.forEach((dateInfo, index) => {
                const dateItem = this.createDateListItem(dateInfo, index);
                dateList.appendChild(dateItem);
            });
            if (this.selectedDate) {
                this.updateSelectedDateUI();
                this.renderTimeInput();
            }
        }

        createDateListContainer() {
            // With new HTML structure, the anchors (date-list, date-info) already exist in the DOM.
            // Just hide the skeletons and render into the existing #date-list.
            const skeleton = document.getElementById('date-skeleton-strip');
            if (skeleton) skeleton.style.display = 'none';
            this.renderDateList();
            this.addRealTimeStatus();
        }

        addRealTimeStatus() {
            // Status badge is already in the DOM via #real-time-status
            this.updateRealTimeStatus();
        }

        updateRealTimeStatus() {
            const statusDiv = document.getElementById('real-time-status');
            if (!statusDiv) return;
            const now = new Date();
            const hours = this.getHoursForDay(now);
            const currentTotal = now.getHours() * 60 + now.getMinutes();
            const openTotal = hours.open_hour * 60 + hours.open_minute;
            const closeTotal = hours.close_hour * 60 + hours.close_minute;
            
            let status = '';
            if (hours.is_closed || currentTotal >= closeTotal) {
                status = '<span class="text-danger"><i class="fas fa-times-circle"></i> Closed</span>';
            } else if (currentTotal < openTotal) {
                status = `<span class="text-warning"><i class="fas fa-clock"></i> Opens at ${this.format24to12(hours.open_time)}</span>`;
            } else {
                status = `<span class="text-success"><i class="fas fa-clock"></i> Open now! Closes at ${this.format24to12(hours.close_time)}</span>`;
            }
            statusDiv.innerHTML = `<small>${status}</small>`;
        }

        createDateListItem(dateInfo, index) {
            const div = document.createElement('div');
            const isSelected = this.selectedDate === dateInfo;
            div.className = `date-card ${dateInfo.isAvailable ? '' : 'date-card--closed'} ${isSelected ? 'date-card--selected' : ''}`;
            div.dataset.index = index;
            div.setAttribute('role', 'button');
            if (!dateInfo.isAvailable) div.setAttribute('aria-disabled', 'true');

            const dayNames  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            const monthNames= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const d = dateInfo.date;
            const dayShort  = dayNames[d.getDay()];
            const monthShort= monthNames[d.getMonth()];
            const dayNum    = d.getDate();
            const label     = dateInfo.isToday ? 'Today' : (dateInfo.isTomorrow ? 'Tomorrow' : (dateInfo.isAvailable ? 'Available' : 'Closed'));

            div.innerHTML = `
                <div class="date-card__day">${dayShort}</div>
                <div class="date-card__num">${dayNum}</div>
                <div class="date-card__month">${monthShort}</div>
                <div class="date-card__label">${label}</div>
            `;
            if (dateInfo.isAvailable) {
                div.addEventListener('click', () => this.selectDate(dateInfo));
            }
            return div;
        }

        selectDate(dateInfo) {
            this.selectedDate = dateInfo;
            this.resetSelectedTime();
            this.loadBookedSlots(dateInfo);
            this.updateSelectedDateUI();
            this.renderDateList();
            updateProgress();
            updateBookingSummary();
        }

        updateSelectedDateUI() {
            // Highlight the chosen card in the date strip
            document.querySelectorAll('.date-card').forEach(c => c.classList.remove('date-card--selected'));
            if (!this.selectedDate) return;
            const idx = this.dates.indexOf(this.selectedDate);
            const card = document.querySelector(`.date-card[data-index="${idx}"]`);
            if (card) card.classList.add('date-card--selected');

            // Show working hours chip in #date-info
            const el = document.getElementById('date-info');
            if (!el) return;
            const hours = this.getHoursForDay(this.selectedDate.date);
            el.innerHTML = `
                <div class="date-info-chip">
                    <i class="fas fa-clock me-1"></i>
                    ${hours.is_closed
                        ? '<span class="chip-closed">Closed</span>'
                        : `Working hours: <strong>${this.format24to12(hours.open_time)} – ${this.format24to12(hours.close_time)}</strong>`
                    }
                </div>
            `;
            el.style.display = 'block';
        }

        renderTimeInput() {
            if (!this.selectedDate) return;
            // Hide time skeleton on first use
            const skeleton = document.getElementById('time-skeleton-strip');
            if (skeleton) skeleton.style.display = 'none';

            // Ensure hidden input exists (only once)
            if (!document.getElementById('time-input')) {
                const hidden = document.createElement('input');
                hidden.type = 'hidden'; hidden.id = 'time-input'; hidden.name = 'time'; hidden.required = true;
                document.getElementById('time-container-col').appendChild(hidden);
            }

            this.updateTimeSlots();
        }

        createTimeSelectionContainer() {
            // No-op: container (#time-slots-wrapper) already exists in the DOM.
            this.renderTimeInput();
        }

        updateTimeSlots() {
            const wrapper = document.getElementById('time-slots-wrapper');
            if (!wrapper || !this.selectedDate) return;
            wrapper.innerHTML = '';

            const slots = this.selectedDate.timeSlots.filter(s => s.isWithinWorkingHours);
            if (slots.length === 0) {
                wrapper.innerHTML = `
                    <div class="ts-empty">
                        <i class="fas fa-calendar-times fa-2x mb-2"></i>
                        <div>No available times for this day</div>
                    </div>`;
                return;
            }

            const periods = [
                { id: 'morning',   label: 'Morning',   icon: 'fa-sun',       start: 0,    end: 720  },
                { id: 'afternoon', label: 'Afternoon', icon: 'fa-cloud-sun', start: 720,  end: 1020 },
                { id: 'evening',   label: 'Evening',   icon: 'fa-moon',      start: 1020, end: 1440 }
            ];

            periods.forEach(p => {
                const pSlots = slots.filter(s => s.totalMinutes >= p.start && s.totalMinutes < p.end);
                if (!pSlots.length) return;
                const group = document.createElement('div');
                group.className = 'ts-period';
                group.innerHTML = `
                    <div class="ts-period__label">
                        <i class="fas ${p.icon}"></i>${p.label}
                    </div>
                    <div class="ts-grid"></div>`;
                const grid = group.querySelector('.ts-grid');
                pSlots.forEach(s => grid.appendChild(this.createSlotElement(s)));
                wrapper.appendChild(group);
            });

            // Restore or clear selection
            if (this.selectedTime24) {
                const radio = document.querySelector(`.ts-slot input[value="${this.selectedTime24}"]`);
                if (radio && !radio.disabled) radio.checked = true;
                else this.resetSelectedTime();
            }
        }

        createSlotElement(slot) {
            const div = document.createElement('div');
            const isSelected = this.selectedTime24 === slot.time24;
            div.className = `ts-slot${slot.isAvailable ? '' : (slot.isBooked ? ' ts-slot--booked' : ' ts-slot--closed')}`;
            if (!slot.isAvailable) div.setAttribute('aria-disabled', 'true');

            div.innerHTML = `
                <input type="radio" name="time_slot_radio" id="slot-${slot.time24}" value="${slot.time24}" ${slot.isAvailable ? '' : 'disabled'} ${isSelected ? 'checked' : ''}>
                <label for="slot-${slot.time24}">
                    <span class="ts-slot__time">${slot.time12.split(' ')[0]}</span>
                    <span class="ts-slot__ampm">${slot.isAvailable ? slot.time12.split(' ')[1] : (slot.isBooked ? 'Booked' : 'N/A')}</span>
                </label>
            `;

            if (slot.isAvailable) {
                div.addEventListener('click', () => {
                    div.querySelector('input').checked = true;
                    this.selectTime(slot);
                });
            }
            return div;
        }

        selectTime(slot) {
            this.selectedTime    = slot.time12;
            this.selectedTime24  = slot.time24;
            const input = document.getElementById('time-input');
            if (input) input.value = slot.time24;

            // Update the header badge
            const badge = document.getElementById('time-selected-badge');
            if (badge) {
                badge.innerHTML = `<i class="fas fa-check-circle me-1"></i>${slot.time12}`;
                badge.style.display = '';
            }

            // Re-render slots to reflect new selected state
            this.updateTimeSlots();
            updateProgress();
            updateBookingSummary();
        }

        updateTimeInput() { this.updateTimeSlots(); }

        updateTimeInfo(time12) {
            // Info is now displayed via the header badge (#time-selected-badge).
            // This method is kept for compatibility but is a no-op.
        }

        startDailyUpdate() {
            setInterval(() => {
                const now = new Date();
                if (now.getDate() !== this.currentDate.getDate()) {
                    this.currentDate = now;
                    this.initializeDates();
                } else if (this.selectedDate && this.selectedDate.isToday) {
                    this.selectedDate.timeSlots = this.generateTimeSlots(this.selectedDate.date, true);
                    this.updateTimeSlots();
                    this.updateRealTimeStatus();
                }
            }, 60000);
        }
    }

    // ========== NAVBAR EFFECT ==========
    const navbar = document.querySelector('#booking-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            } else {
                navbar.style.padding = '1rem 0';
                navbar.style.boxShadow = 'none';
                navbar.style.backgroundColor = '';
            }
        });
        window.dispatchEvent(new Event('scroll'));
    }

    // ========== PROGRESS TRACKER ==========
    const progressSteps = document.querySelectorAll('.progress-step');
    const formSections = document.querySelectorAll('.form-section');
    
    function updateProgress() {
        let currentStep = 0;
        formSections.forEach((section, index) => {
            let hasValue = false;
            if (section.id === 'personal-info-section') {
                const name = document.getElementById('booking-full-name').value;
                const phone = document.getElementById('booking-phone').value;
                const email = document.getElementById('booking-email').value;
                if (name && phone && email) hasValue = true;
            }
            else if (section.id === 'service-selection-section') {
                if (document.querySelector('input[name="service"]:checked')) hasValue = true;
            }
            else if (section.id === 'barber-selection-section') {
                const barber = document.querySelector('input[name="barber"]:checked');
                if (barber && barber.value !== 'alex') hasValue = true;
            }
            else if (section.id === 'datetime-section') {
                const ti = document.getElementById('time-input');
                if (window.dateConfig && window.dateConfig.selectedDate && ti && ti.value) {
                    hasValue = true;
                }
            }
            if (hasValue) currentStep = Math.max(currentStep, index + 1);
        });
        
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentStep) step.classList.add('completed');
            if (index === currentStep) step.classList.add('active');
        });
    }

    // ========== FORM VALIDATION ==========
    const bookingForm = document.getElementById('booking-form');
    function validateInput(input) {
        let isValid = true;
        let errorMessage = '';
        const val = input.value.trim();
        
        if (!val) {
            isValid = false;
            errorMessage = 'Required';
        } else {
            if (input.id === 'booking-phone') {
                if (!/^(09|07)\d{8}$/.test(val)) {
                    isValid = false;
                    errorMessage = 'Enter 10 digits (09/07)';
                }
            } else if (input.id === 'booking-email') {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    isValid = false;
                    errorMessage = 'Invalid email';
                }
            }
        }
        
        if (!isValid) {
            input.classList.add('is-invalid');
            let err = input.parentNode.querySelector('.invalid-feedback');
            if (!err) {
                err = document.createElement('div');
                err.className = 'invalid-feedback d-block';
                input.parentNode.appendChild(err);
            }
            err.textContent = errorMessage;
        } else {
            input.classList.remove('is-invalid');
            const err = input.parentNode.querySelector('.invalid-feedback');
            if (err) err.remove();
        }
        return isValid;
    }

    if (bookingForm) {
        bookingForm.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => { validateInput(input); updateProgress(); });
            input.addEventListener('input', () => { input.classList.remove('is-invalid'); updateProgress(); });
        });
    }

    // ========== SUMMARY UPDATER ==========
    function updateBookingSummary() {
        const service = document.querySelector('input[name="service"]:checked');
        const barber  = document.querySelector('input[name="barber"]:checked');

        // Service
        const sEl         = document.getElementById('summary-service');
        const pEl         = document.getElementById('summary-price');
        const depositEl   = document.getElementById('summary-deposit');
        const depositRow  = document.getElementById('summary-deposit-row');

        if (service) {
            sEl.textContent = service.closest('.service-option').querySelector('h4').textContent;
            sEl.className   = 'text-primary fw-bold';

            // Parse numeric price from data-price (e.g. "200 Birr" → 200)
            const rawPrice  = parseFloat((service.dataset.price || '0').replace(/[^\d.]/g, '')) || 0;
            const deposit   = (rawPrice * 0.5).toFixed(2);

            pEl.textContent = rawPrice.toFixed(2) + ' ETB';

            if (depositEl) {
                depositEl.textContent = deposit + ' ETB';
                depositEl.className   = 'fw-bold text-warning';
            }
            const formDepositEl = document.getElementById('payment-deposit-amount');
            if (formDepositEl) formDepositEl.textContent = deposit + ' ETB';
            
            if (depositRow) depositRow.style.display = '';
        } else {
            sEl.textContent = 'Select service';
            sEl.className   = 'text-muted';
            pEl.textContent = '0 ETB';
            if (depositEl)  depositEl.textContent = '0 ETB';
            if (depositRow) depositRow.style.display = 'none';
        }

        // Barber
        const bEl = document.getElementById('summary-barber');
        if (barber && !barber.disabled) {
            bEl.textContent = barber.value;
            bEl.className   = 'text-primary fw-bold';
        } else {
            bEl.textContent = 'Select barber';
            bEl.className   = 'text-muted';
        }

        // Date & Time
        const dEl = document.getElementById('summary-date');
        const tEl = document.getElementById('summary-time');
        if (window.dateConfig && window.dateConfig.selectedDate) {
            dEl.textContent = window.dateConfig.selectedDate.displayDate;
            dEl.className   = 'text-primary fw-bold';
        } else {
            dEl.textContent = 'Select date';
            dEl.className   = 'text-muted';
        }

        const ti   = document.getElementById('time-input');
        const time = ti ? ti.value : '';
        if (time && window.dateConfig) {
            tEl.textContent = window.dateConfig.getSelectedTime12();
            tEl.className   = 'text-primary fw-bold';
        } else {
            tEl.textContent = 'Select time';
            tEl.className   = 'text-muted';
        }
    }

    function updateSelectedBarberInfo() {
        const barber = document.querySelector('input[name="barber"]:checked');
        const card = document.getElementById('selected-barber-info');
        if (barber && !barber.disabled && card) {
            document.getElementById('selected-barber-name').textContent = barber.value;
            document.getElementById('selected-barber-specialty').textContent = barber.dataset.specialty || '';
            document.getElementById('selected-barber-exp').textContent = 'Rating: ' + (barber.dataset.rating || 'N/A');
            card.style.display = 'block';
        } else if (card) {
            card.style.display = 'none';
        }
    }

    document.addEventListener('change', (e) => {
        if (e.target.name === 'service' || e.target.name === 'barber') {
            updateProgress();
            updateBookingSummary();
            if (e.target.name === 'barber') updateSelectedBarberInfo();
        }
    });

    // ========== FORM SUBMISSION – Chapa Payment Flow ==========
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let valid = true;
            bookingForm.querySelectorAll('input[required]').forEach(i => { if (!validateInput(i)) valid = false; });

            if (!document.querySelector('input[name="service"]:checked'))   { showToast('Error', 'Please select a service',  'error'); valid = false; }
            if (!document.querySelector('input[name="barber"]:checked'))    { showToast('Error', 'Please select a barber',   'error'); valid = false; }
            if (!document.getElementById('time-input')?.value)              { showToast('Error', 'Please select a time slot', 'error'); valid = false; }

            if (!valid) return;

            const submitBtn   = document.getElementById('confirm-booking-btn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Initiating Payment…';
            submitBtn.disabled  = true;

            const serviceInput = document.querySelector('input[name="service"]:checked');
            const rawPrice     = parseFloat((serviceInput.dataset.price || '0').replace(/[^\d.]/g, '')) || 0;
            const deposit      = (rawPrice * 0.5).toFixed(2);

            const payload = {
                fullName : document.getElementById('booking-full-name').value.trim(),
                phone    : document.getElementById('booking-phone').value.trim(),
                email    : document.getElementById('booking-email').value.trim(),
                service  : serviceInput.value,
                date     : window.dateConfig.selectedDate.date.toISOString().split('T')[0],
                time     : document.getElementById('time-input').value,
                barber   : document.querySelector('input[name="barber"]:checked').value,
            };

            // Save partial booking info in case user needs it on return
            localStorage.setItem('quickcutPendingBooking', JSON.stringify({
                ...payload,
                deposit,
                initiatedAt: new Date().toISOString()
            }));

            fetch(BASE_URL + 'booking/initiate_payment.php', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.checkout_url) {
                    // Store appointment id for potential future reference
                    localStorage.setItem('quickcutAppointmentId', data.appointment_id);
                    // Redirect to Chapa payment page
                    showToast('Redirecting', 'Taking you to the secure payment page…', 'info');
                    setTimeout(() => { window.location.href = data.checkout_url; }, 800);
                } else {
                    showToast('Booking Failed', data.message || 'Could not initiate payment. Try again.', 'error');
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled  = false;
                }
            })
            .catch(err => {
                console.error('Payment initiation error:', err);
                showToast('Connection Error', 'Failed to reach the server. Please try again.', 'error');
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled  = false;
            });
        });
    }

    // ========== UTILS: TOAST, CLOCK, ETC ==========
    function showToast(title, message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : (type === 'success' ? 'success' : 'info')} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body"><strong>${title}</strong><br>${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        container.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    function addRealTimeClock() {
        const clock = document.createElement('div');
        clock.id = 'real-time-clock';
        clock.style.cssText = 'position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.8); color:#fff; padding:8px 15px; border-radius:30px; font-size:0.8rem; z-index:1000; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(5px);';
        document.body.appendChild(clock);
        setInterval(() => {
            const now = new Date();
            clock.innerHTML = `<i class="fas fa-clock me-2 text-warning"></i>${now.toLocaleDateString()} • ${now.toLocaleTimeString()}`;
        }, 1000);
    }

    // Payment is handled by Chapa — no local payment-method toggles needed.
    // The old telebirr/cbe/bank UI has been replaced by Chapa's hosted checkout.

    addRealTimeClock();
    updateBookingSummary();
    updateProgress();
});
