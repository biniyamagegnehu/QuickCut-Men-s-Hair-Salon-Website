// QuickCut - Book Appointment JavaScript
// Enhanced with proper 24-hour closure logic and auto-updating dates

document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZATION ==========
    console.log('Booking page initialized');
    
    // ========== BUSINESS HOURS CONFIG ==========
    const BUSINESS_HOURS = {
        OPEN_HOUR: 6,    // 6:00 AM
        CLOSE_HOUR: 18,  // 6:00 PM (18:00 in 24-hour format)
        OPEN_MINUTE: 0,
        CLOSE_MINUTE: 0
    };
    
    // ========== DATE CONFIGURATION ==========
    class DateConfig {
        constructor() {
            this.currentDate = new Date();
            this.dates = [];
            this.selectedDate = null;
            this.initializeDates();
            this.startDailyUpdate();
        }
        
        initializeDates() {
            // Generate dates for next 7 days
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
                    timeSlots: this.generateTimeSlots(date, i === 0)
                };
                
                this.dates.push(dateInfo);
            }
            
            // Auto-select first available date
            const firstAvailable = this.dates.find(date => date.isAvailable);
            if (firstAvailable) {
                this.selectedDate = firstAvailable;
            }
            
            this.renderDateList();
        }
        
        formatDisplayDate(date, offset) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            if (offset === 0) return 'Today';
            if (offset === 1) return 'Tomorrow';
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
        }
        
        getDayName(date) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        }
        
        isDateAvailable(date, isToday) {
            const now = new Date();
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Check if date is in the past (before today)
            if (dateOnly < todayOnly) {
                return false;
            }
            
            // For today: Check if current time is within working hours
            if (isToday) {
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTotalMinutes = currentHour * 60 + currentMinute;
                
                const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
                const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                
                // Check if current time is before closing time and after/at opening time
                return currentTotalMinutes >= openTimeMinutes && currentTotalMinutes < closeTimeMinutes;
            }
            
            // For future dates: Always available (they're not in the past)
            return true;
        }
        
        generateTimeSlots(date, isToday) {
            const slots = [];
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTotalMinutes = currentHour * 60 + currentMinute;
            
            const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
            const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
            
            // Generate slots from OPEN_HOUR to CLOSE_HOUR (6:00 AM to 6:00 PM)
            for (let hour = BUSINESS_HOURS.OPEN_HOUR; hour < BUSINESS_HOURS.CLOSE_HOUR; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotTotalMinutes = hour * 60 + minute;
                    
                    // Skip slots before opening time or after closing time
                    if (slotTotalMinutes < openTimeMinutes || slotTotalMinutes >= closeTimeMinutes) {
                        continue;
                    }
                    
                    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    
                    // Check if slot is available
                    let isAvailable = true;
                    
                    // For today, check if time has passed
                    if (isToday) {
                        if (slotTotalMinutes < currentTotalMinutes) {
                            isAvailable = false;
                        }
                    }
                    
                    // Check if slot is booked (simulated)
                    const isBooked = this.isTimeBooked(date, time24);
                    
                    slots.push({
                        time24: time24,
                        time12: this.format24to12(time24),
                        isAvailable: isAvailable && !isBooked,
                        isBooked: isBooked,
                        isPassed: isToday && slotTotalMinutes < currentTotalMinutes,
                        hour: hour,
                        minute: minute,
                        totalMinutes: slotTotalMinutes
                    });
                }
            }
            
            // Sort slots by time
            slots.sort((a, b) => a.totalMinutes - b.totalMinutes);
            
            return slots;
        }
        
        isTimeBooked(date, time24) {
            // Simulate booked slots (25% chance)
            const dateStr = date.toDateString();
            const slotKey = `${dateStr}-${time24}`;
            const hash = this.hashString(slotKey);
            return hash % 4 === 0;
        }
        
        hashString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        }
        
        format24to12(time24) {
            const [hours, minutes] = time24.split(':').map(Number);
            let period = 'AM';
            let hour12 = hours;
            
            if (hours === 0) {
                hour12 = 12; // 12:00 AM
                period = 'AM';
            } else if (hours < 12) {
                hour12 = hours;
                period = 'AM';
            } else if (hours === 12) {
                hour12 = 12;
                period = 'PM';
            } else if (hours > 12) {
                hour12 = hours - 12;
                period = 'PM';
            }
            
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
        
        renderDateList() {
            const dateContainer = document.querySelector('.date-list-container');
            if (!dateContainer) {
                this.createDateListContainer();
            }
            
            const dateList = document.getElementById('date-list');
            if (!dateList) return;
            
            dateList.innerHTML = '';
            
            this.dates.forEach((dateInfo, index) => {
                const dateItem = this.createDateListItem(dateInfo, index);
                dateList.appendChild(dateItem);
            });
            
            // Update selected date UI
            if (this.selectedDate) {
                this.updateSelectedDateUI();
                this.renderTimeInput();
            }
        }
        
        createDateListContainer() {
            const datetimeSection = document.querySelector('#datetime-section');
            if (!datetimeSection) return;
            
            // Remove existing date picker if present
            const oldDatePicker = datetimeSection.querySelector('.date-picker');
            if (oldDatePicker) {
                oldDatePicker.remove();
            }
            
            // Create date list container
            const dateListContainer = document.createElement('div');
            dateListContainer.className = 'date-list-container mb-4';
            dateListContainer.innerHTML = `
                <div class="date-list-header mb-3">
                    <h5 class="mb-2"><i class="fas fa-calendar-alt me-2"></i>Select Date</h5>
                    <p class="text-muted mb-0"><small>Click on a date to select. Today is closed after 6:00 PM.</small></p>
                </div>
                <div class="date-list" id="date-list"></div>
                <div class="date-info mt-3" id="date-info" style="display: none;"></div>
            `;
            
            datetimeSection.insertBefore(dateListContainer, datetimeSection.firstChild);
            
            // Add real-time status indicator
            this.addRealTimeStatus();
        }
        
        addRealTimeStatus() {
            const header = document.querySelector('.date-list-header');
            if (!header) return;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'real-time-status mt-2';
            statusDiv.id = 'real-time-status';
            header.appendChild(statusDiv);
            
            this.updateRealTimeStatus();
        }
        
        updateRealTimeStatus() {
            const statusDiv = document.getElementById('real-time-status');
            if (!statusDiv) return;
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTotalMinutes = currentHour * 60 + currentMinute;
            
            const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
            const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
            
            let statusText = '';
            let statusClass = '';
            
            if (currentTotalMinutes < openTimeMinutes) {
                // Before opening time (before 6:00 AM)
                const minutesUntilOpen = openTimeMinutes - currentTotalMinutes;
                const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
                const minutesLeft = minutesUntilOpen % 60;
                
                let timeUntilText = '';
                if (hoursUntilOpen > 0) {
                    timeUntilText = `${hoursUntilOpen}h ${minutesLeft}m`;
                } else {
                    timeUntilText = `${minutesLeft}m`;
                }
                
                statusText = `<span class="text-warning"><i class="fas fa-clock"></i> Opens at 6:00 AM (in ${timeUntilText})</span>`;
                statusClass = 'status-closed';
            } else if (currentTotalMinutes >= closeTimeMinutes) {
                // After closing time (after 6:00 PM)
                const nextDay = new Date(now);
                nextDay.setDate(nextDay.getDate() + 1);
                nextDay.setHours(BUSINESS_HOURS.OPEN_HOUR, BUSINESS_HOURS.OPEN_MINUTE, 0, 0);
                
                const timeUntilTomorrow = nextDay.getTime() - now.getTime();
                const hoursUntilTomorrow = Math.floor(timeUntilTomorrow / (1000 * 60 * 60));
                const minutesUntilTomorrow = Math.floor((timeUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60));
                
                let timeUntilText = '';
                if (hoursUntilTomorrow > 0) {
                    timeUntilText = `${hoursUntilTomorrow}h ${minutesUntilTomorrow}m`;
                } else {
                    timeUntilText = `${minutesUntilTomorrow}m`;
                }
                
                statusText = `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> Closed for today. Opens tomorrow at 6:00 AM (in ${timeUntilText})</span>`;
                statusClass = 'status-closed';
            } else {
                // Within working hours (6:00 AM to 6:00 PM)
                const minutesUntilClose = closeTimeMinutes - currentTotalMinutes;
                const hoursLeft = Math.floor(minutesUntilClose / 60);
                const minutesLeft = minutesUntilClose % 60;
                
                let timeLeftText = '';
                if (hoursLeft > 0) {
                    timeLeftText = `${hoursLeft}h ${minutesLeft}m left`;
                } else {
                    timeLeftText = `${minutesLeft}m left`;
                }
                
                statusText = `<span class="text-success"><i class="fas fa-clock"></i> Open now! Closes at 6:00 PM (${timeLeftText})</span>`;
                statusClass = 'status-open';
            }
            
            statusDiv.innerHTML = `<small>${statusText}</small>`;
            statusDiv.className = `real-time-status mt-2 ${statusClass}`;
        }
        
        createDateListItem(dateInfo, index) {
            const dateItem = document.createElement('div');
            dateItem.className = `date-list-item ${dateInfo.isAvailable ? '' : 'date-unavailable'} ${this.selectedDate === dateInfo ? 'date-selected' : ''}`;
            dateItem.dataset.index = index;
            
            // Create availability indicator
            let availabilityBadge = '';
            if (!dateInfo.isAvailable) {
                if (dateInfo.isToday) {
                    const now = new Date();
                    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                    const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
                    const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                    
                    if (currentTotalMinutes < openTimeMinutes) {
                        availabilityBadge = '<span class="date-badge closed"><i class="fas fa-clock"></i> Opens at 6:00 AM</span>';
                    } else if (currentTotalMinutes >= closeTimeMinutes) {
                        availabilityBadge = '<span class="date-badge closed"><i class="fas fa-times-circle"></i> Closed</span>';
                    } else {
                        availabilityBadge = '<span class="date-badge closed"><i class="fas fa-times-circle"></i> Past Date</span>';
                    }
                } else {
                    availabilityBadge = '<span class="date-badge closed">Closed</span>';
                }
            } else if (dateInfo.isToday) {
                const now = new Date();
                const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                const minutesLeft = closeTimeMinutes - currentTotalMinutes;
                const hoursLeft = Math.floor(minutesLeft / 60);
                
                if (hoursLeft > 0) {
                    availabilityBadge = `<span class="date-badge today"><i class="fas fa-calendar-day"></i> Today (${hoursLeft}h left)</span>`;
                } else {
                    availabilityBadge = `<span class="date-badge today"><i class="fas fa-calendar-day"></i> Today (${minutesLeft % 60}m left)</span>`;
                }
            } else if (dateInfo.isTomorrow) {
                availabilityBadge = '<span class="date-badge tomorrow"><i class="fas fa-calendar-plus"></i> Tomorrow</span>';
            } else {
                const availableSlots = dateInfo.timeSlots.filter(slot => slot.isAvailable).length;
                availabilityBadge = `<span class="date-badge available"><i class="fas fa-check-circle"></i> ${availableSlots} slots</span>`;
            }
            
            dateItem.innerHTML = `
                <div class="date-item-content">
                    <div class="date-display">${dateInfo.displayDate}</div>
                    <div class="date-full">${dateInfo.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div class="date-meta">
                        ${availabilityBadge}
                    </div>
                </div>
            `;
            
            // Add click event if available
            if (dateInfo.isAvailable) {
                dateItem.addEventListener('click', () => {
                    this.selectDate(dateInfo);
                });
            } else {
                dateItem.style.cursor = 'not-allowed';
            }
            
            return dateItem;
        }
        
        selectDate(dateInfo) {
            this.selectedDate = dateInfo;
            this.updateSelectedDateUI();
            this.renderTimeInput();
            updateProgress();
            updateBookingSummary();
            
            // Show selection animation
            const dateItems = document.querySelectorAll('.date-list-item');
            dateItems.forEach(item => item.classList.remove('date-selected'));
            const selectedItem = document.querySelector(`.date-list-item[data-index="${this.dates.indexOf(dateInfo)}"]`);
            if (selectedItem) {
                selectedItem.classList.add('date-selected');
                
                // Add animation
                selectedItem.style.animation = 'selectPulse 0.5s ease';
                setTimeout(() => {
                    selectedItem.style.animation = '';
                }, 500);
            }
        }
        
        updateSelectedDateUI() {
            const dateInfoElement = document.getElementById('date-info');
            if (!dateInfoElement || !this.selectedDate) return;
            
            const date = this.selectedDate.date;
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            const availableSlots = this.selectedDate.timeSlots.filter(slot => slot.isAvailable).length;
            const totalSlots = this.selectedDate.timeSlots.length;
            
            let availabilityText = '';
            if (this.selectedDate.isToday) {
                const now = new Date();
                const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                
                if (currentTotalMinutes >= closeTimeMinutes) {
                    availabilityText = '<div class="text-danger mt-2"><small><i class="fas fa-exclamation-circle"></i> Today is closed after 6:00 PM</small></div>';
                } else if (currentTotalMinutes < BUSINESS_HOURS.OPEN_HOUR * 60) {
                    availabilityText = '<div class="text-warning mt-2"><small><i class="fas fa-clock"></i> Opens at 6:00 AM</small></div>';
                } else {
                    const minutesLeft = closeTimeMinutes - currentTotalMinutes;
                    const hoursLeft = Math.floor(minutesLeft / 60);
                    const minutesRemaining = minutesLeft % 60;
                    
                    if (hoursLeft > 0) {
                        availabilityText = `<div class="text-warning mt-2"><small><i class="fas fa-clock"></i> Today closes at 6:00 PM (${hoursLeft}h ${minutesRemaining}m left)</small></div>`;
                    } else {
                        availabilityText = `<div class="text-warning mt-2"><small><i class="fas fa-clock"></i> Today closes at 6:00 PM (${minutesRemaining}m left)</small></div>`;
                    }
                }
            }
            
            dateInfoElement.innerHTML = `
                <div class="selected-date-info">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <strong><i class="fas fa-calendar-check me-2"></i>Selected Date</strong><br>
                            <span class="text-primary">${formattedDate}</span>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">Available slots:</small><br>
                            <span class="badge ${availableSlots > 0 ? 'bg-success' : 'bg-danger'}">${availableSlots}/${totalSlots}</span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted"><i class="fas fa-clock me-1"></i> Working hours: 6:00 AM - 6:00 PM</small>
                    </div>
                    ${availabilityText}
                </div>
            `;
            dateInfoElement.style.display = 'block';
        }
        
        renderTimeInput() {
            if (!this.selectedDate) return;
            
            const timeContainer = document.querySelector('.time-input-container');
            if (!timeContainer) {
                this.createTimeInputContainer();
            } else {
                this.updateTimeInput();
            }
        }
        
        createTimeInputContainer() {
            const datetimeSection = document.querySelector('#datetime-section');
            if (!datetimeSection) return;
            
            // Remove existing time slots if any
            const timeSlotsContainer = datetimeSection.querySelector('.time-slots');
            if (timeSlotsContainer) {
                timeSlotsContainer.remove();
            }
            
            // Create time input container
            const timeInputContainer = document.createElement('div');
            timeInputContainer.className = 'time-input-container mt-4';
            timeInputContainer.innerHTML = `
                <div class="time-input-header mb-3">
                    <h5><i class="fas fa-clock me-2"></i>Select Time</h5>
                    <p class="text-muted mb-0"><small>Choose your preferred time between 6:00 AM and 6:00 PM</small></p>
                </div>
                <div class="time-input-group">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="time-hour" class="form-label">Hour</label>
                                <select id="time-hour" class="form-select time-select" required>
                                    <option value="">Hour</option>
                                    ${this.generateHourOptions()}
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="time-minute" class="form-label">Minute</label>
                                <select id="time-minute" class="form-select time-select" required>
                                    <option value="">Minute</option>
                                    <option value="00">00</option>
                                    <option value="30">30</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="time-period" class="form-label">AM/PM</label>
                                <select id="time-period" class="form-select time-select" required>
                                    <option value="">--</option>
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="time-validation mt-3" id="time-validation">
                        <div class="text-muted"><small>Select hour, minute, and AM/PM</small></div>
                    </div>
                    <div class="time-suggestions mt-3">
                        <div class="mb-2"><small><strong>Quick Select:</strong></small></div>
                        <div class="suggested-times d-flex flex-wrap gap-2" id="suggested-times"></div>
                    </div>
                </div>
                <div class="time-info mt-3" id="time-info" style="display: none;"></div>
            `;
            
            datetimeSection.appendChild(timeInputContainer);
            
            // Add event listeners
            this.addTimeInputEventListeners();
            this.updateTimeInput();
        }
        
        generateHourOptions() {
            let options = '';
            
            // Generate hours from 6 AM to 6 PM
            const hours = [
                { value: 1, display: '1' },
                { value: 2, display: '2' },
                { value: 3, display: '3' },
                { value: 4, display: '4' },
                { value: 5, display: '5' },
                { value: 6, display: '6' },
                { value: 7, display: '7' },
                { value: 8, display: '8' },
                { value: 9, display: '9' },
                { value: 10, display: '10' },
                { value: 11, display: '11' },
                { value: 12, display: '12' }
               
            ];
            
            hours.forEach(hour => {
                options += `<option value="${hour.value}">${hour.display}</option>`;
            });
            
            return options;
        }
        
        updateTimeInput() {
            if (!this.selectedDate) return;
            
            const timeHour = document.getElementById('time-hour');
            const timeMinute = document.getElementById('time-minute');
            const timePeriod = document.getElementById('time-period');
            const timeValidation = document.getElementById('time-validation');
            const suggestedTimes = document.getElementById('suggested-times');
            
            if (!timeHour || !timeMinute || !timePeriod || !timeValidation || !suggestedTimes) return;
            
            // Reset inputs
            timeHour.value = '';
            timeMinute.value = '';
            timePeriod.value = '';
            
            // Clear validation
            timeValidation.innerHTML = '<div class="text-muted"><small>Select hour, minute, and AM/PM</small></div>';
            timeValidation.className = 'time-validation';
            
            // Generate suggested times
            this.generateTimeSuggestions();
            
            // Add real-time validation
            const validateTime = () => {
                const hour = timeHour.value;
                const minute = timeMinute.value;
                const period = timePeriod.value;
                
                if (!hour || !minute || !period) {
                    timeValidation.innerHTML = '<div class="text-muted"><small>Select hour, minute, and AM/PM</small></div>';
                    return false;
                }
                
                // Convert to 24-hour format
                let hour24 = parseInt(hour);
                if (period === 'PM' && hour24 !== 12) hour24 += 12;
                if (period === 'AM' && hour24 === 12) hour24 = 0;
                
                // Validate time range (must be between 6:00 AM and 6:00 PM)
                const slotTotalMinutes = hour24 * 60 + parseInt(minute);
                const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
                const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                
                if (slotTotalMinutes < openTimeMinutes || slotTotalMinutes >= closeTimeMinutes) {
                    timeValidation.innerHTML = '<div class="text-danger"><small><i class="fas fa-times-circle"></i> Time must be between 6:00 AM and 6:00 PM</small></div>';
                    return false;
                }
                
                const time24 = `${hour24.toString().padStart(2, '0')}:${minute}`;
                
                // Check if time is available in the selected date's slots
                const timeSlot = this.selectedDate.timeSlots.find(slot => slot.time24 === time24);
                if (!timeSlot) {
                    timeValidation.innerHTML = '<div class="text-danger"><small><i class="fas fa-times-circle"></i> Invalid time format</small></div>';
                    return false;
                }
                
                if (timeSlot.isPassed) {
                    timeValidation.innerHTML = '<div class="text-danger"><small><i class="fas fa-times-circle"></i> This time has already passed</small></div>';
                    return false;
                }
                
                if (timeSlot.isBooked) {
                    timeValidation.innerHTML = '<div class="text-danger"><small><i class="fas fa-times-circle"></i> This time slot is already booked</small></div>';
                    return false;
                }
                
                if (!timeSlot.isAvailable) {
                    timeValidation.innerHTML = '<div class="text-danger"><small><i class="fas fa-times-circle"></i> This time slot is not available</small></div>';
                    return false;
                }
                
                // Valid time
                const time12 = timeSlot.time12;
                timeValidation.innerHTML = `<div class="text-success"><small><i class="fas fa-check-circle"></i> ${time12} is available</small></div>`;
                
                // Update time info
                this.updateTimeInfo(time12);
                
                return true;
            };
            
            // Add event listeners for real-time validation
            timeHour.addEventListener('change', validateTime);
            timeMinute.addEventListener('change', validateTime);
            timePeriod.addEventListener('change', validateTime);
            
            // Initial validation
            setTimeout(validateTime, 100);
        }
        
        generateTimeSuggestions() {
            const suggestedTimes = document.getElementById('suggested-times');
            if (!suggestedTimes || !this.selectedDate) return;
            
            suggestedTimes.innerHTML = '';
            
            // Get available time slots for the selected date
            const availableSlots = this.selectedDate.timeSlots
                .filter(slot => slot.isAvailable)
                .slice(0, 6); // Take first 6 available slots
            
            if (availableSlots.length === 0) {
                suggestedTimes.innerHTML = '<div class="text-muted w-100"><small><i class="fas fa-info-circle"></i> No available time slots for this date</small></div>';
                return;
            }
            
            availableSlots.forEach(slot => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-outline-primary btn-sm time-suggestion';
                button.textContent = slot.time12;
                button.dataset.time24 = slot.time24;
                
                button.addEventListener('click', () => {
                    // Parse time24 to set dropdowns
                    const [hour24, minute] = slot.time24.split(':');
                    const hour24Num = parseInt(hour24);
                    
                    let hour12 = hour24Num;
                    let period = 'AM';
                    
                    if (hour24Num === 0) {
                        hour12 = 12;
                        period = 'AM';
                    } else if (hour24Num < 12) {
                        hour12 = hour24Num;
                        period = 'AM';
                    } else if (hour24Num === 12) {
                        hour12 = 12;
                        period = 'PM';
                    } else {
                        hour12 = hour24Num - 12;
                        period = 'PM';
                    }
                    
                    document.getElementById('time-hour').value = hour12;
                    document.getElementById('time-minute').value = minute;
                    document.getElementById('time-period').value = period;
                    
                    // Trigger validation
                    const event = new Event('change');
                    document.getElementById('time-hour').dispatchEvent(event);
                    
                    // Update time info
                    this.updateTimeInfo(slot.time12);
                    
                    // Add visual feedback
                    button.classList.add('active');
                    setTimeout(() => {
                        button.classList.remove('active');
                    }, 500);
                });
                
                suggestedTimes.appendChild(button);
            });
        }
        
        updateTimeInfo(time12) {
            const timeInfo = document.getElementById('time-info');
            if (!timeInfo) return;
            
            timeInfo.innerHTML = `
                <div class="selected-time-info alert alert-success">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-check-circle me-2"></i>
                        <div>
                            <strong>Selected Time:</strong> ${time12}<br>
                            <small class="text-muted">Date: ${this.selectedDate.displayDate}</small>
                        </div>
                    </div>
                </div>
            `;
            timeInfo.style.display = 'block';
        }
        
        addTimeInputEventListeners() {
            const timeSelects = document.querySelectorAll('.time-select');
            timeSelects.forEach(select => {
                select.addEventListener('change', () => {
                    updateProgress();
                    updateBookingSummary();
                });
            });
        }
        
        startDailyUpdate() {
            // Update every minute
            setInterval(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTotalMinutes = currentHour * 60 + currentMinute;
                const currentDate = now.getDate();
                const lastUpdateDate = this.currentDate.getDate();
                
                const openTimeMinutes = BUSINESS_HOURS.OPEN_HOUR * 60 + BUSINESS_HOURS.OPEN_MINUTE;
                const closeTimeMinutes = BUSINESS_HOURS.CLOSE_HOUR * 60 + BUSINESS_HOURS.CLOSE_MINUTE;
                
                // Check if we need to update today's availability
                const today = this.dates[0];
                if (today) {
                    const shouldBeAvailable = currentTotalMinutes >= openTimeMinutes && currentTotalMinutes < closeTimeMinutes;
                    
                    // If availability changed, update the date list
                    if (today.isAvailable !== shouldBeAvailable) {
                        today.isAvailable = shouldBeAvailable;
                        today.timeSlots = this.generateTimeSlots(today.date, true);
                        
                        // Re-render date list
                        this.renderDateList();
                        
                        // Update real-time status
                        this.updateRealTimeStatus();
                        
                        // If today was selected and became unavailable, auto-select next available date
                        if (this.selectedDate === today && !shouldBeAvailable) {
                            const nextAvailable = this.dates.find(date => date.isAvailable);
                            if (nextAvailable) {
                                this.selectDate(nextAvailable);
                            }
                        }
                        
                        // If today became available and no date is selected, select it
                        if (shouldBeAvailable && !this.selectedDate) {
                            this.selectDate(today);
                        }
                    }
                }
                
                // Check if we need to roll over to next day (after midnight)
                if (currentDate !== lastUpdateDate) {
                    // New day! Shift dates
                    this.currentDate = now;
                    this.initializeDates();
                }
                
                // Update time suggestions for selected date if it's today
                if (this.selectedDate && this.selectedDate.isToday) {
                    this.selectedDate.timeSlots = this.generateTimeSlots(this.selectedDate.date, true);
                    this.generateTimeSuggestions();
                }
            }, 60000); // Check every minute
        }
        
        getSelectedTime() {
            const timeHour = document.getElementById('time-hour');
            const timeMinute = document.getElementById('time-minute');
            const timePeriod = document.getElementById('time-period');
            
            if (!timeHour || !timeMinute || !timePeriod || 
                !timeHour.value || !timeMinute.value || !timePeriod.value) {
                return null;
            }
            
            let hour24 = parseInt(timeHour.value);
            if (timePeriod.value === 'PM' && hour24 !== 12) hour24 += 12;
            if (timePeriod.value === 'AM' && hour24 === 12) hour24 = 0;
            
            return `${hour24.toString().padStart(2, '0')}:${timeMinute.value}`;
        }
        
        getSelectedTime12() {
            const time24 = this.getSelectedTime();
            if (!time24) return null;
            
            const [hours, minutes] = time24.split(':').map(Number);
            let period = 'AM';
            let hour12 = hours;
            
            if (hours === 0) {
                hour12 = 12; // 12:00 AM
            } else if (hours < 12) {
                hour12 = hours;
                period = 'AM';
            } else if (hours === 12) {
                hour12 = 12;
                period = 'PM';
            } else if (hours > 12) {
                hour12 = hours - 12;
                period = 'PM';
            }
            
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
    }
    
    // Initialize Date Config
    const dateConfig = new DateConfig();
    
    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.querySelector('#booking-nav');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
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

    // ========== ACTIVE NAV LINK ==========
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('#booking-nav-menu .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href');
            
            if (linkPage === currentPage || 
                (currentPage === 'bookappointment.html' && linkPage === 'bookappointment.html')) {
                link.classList.add('active');
            }
        });
    }
    
    setActiveNavLink();

    // ========== BOOKING PROGRESS TRACKER ==========
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
                const serviceSelected = document.querySelector('input[name="service"]:checked');
                if (serviceSelected) hasValue = true;
            }
            else if (section.id === 'barber-selection-section') {
                const barberSelected = document.querySelector('input[name="barber"]:checked');
                if (barberSelected && barberSelected.value !== 'alex') hasValue = true;
            }
            else if (section.id === 'datetime-section') {
                const dateSelected = dateConfig.selectedDate;
                const timeHour = document.getElementById('time-hour');
                const timeMinute = document.getElementById('time-minute');
                const timePeriod = document.getElementById('time-period');
                
                if (dateSelected && timeHour && timeMinute && timePeriod &&
                    timeHour.value && timeMinute.value && timePeriod.value) {
                    hasValue = true;
                }
            }
            
            if (hasValue) {
                currentStep = Math.max(currentStep, index + 1);
            }
        });
        
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentStep) {
                step.classList.add('completed');
            }
            if (index === currentStep) {
                step.classList.add('active');
            }
        });
    }

    // ========== FORM VALIDATION ==========
    const bookingForm = document.getElementById('booking-form');
    
    // Real-time validation
    const formInputs = bookingForm ? bookingForm.querySelectorAll('input[required], select[required], textarea') : [];
    
    formInputs.forEach(input => {
        if (input.type !== 'radio' && !input.classList.contains('time-select')) {
            input.addEventListener('blur', function() {
                validateInput(this);
                updateProgress();
            });
            
            input.addEventListener('input', function() {
                clearError(this);
                updateProgress();
            });
        }
    });

    // Radio button change handlers
    document.addEventListener('change', function(e) {
        if (e.target.name === 'service' || e.target.name === 'barber') {
            updateProgress();
            updateBookingSummary();
            updateSelectedBarberInfo();
        }
    });

    function validateInput(input) {
        let isValid = true;
        let errorMessage = '';
        
        if (!input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } else {
            switch(input.id) {
                case 'booking-full-name':
                    if (input.value.length < 2) {
                        isValid = false;
                        errorMessage = 'Name must be at least 2 characters';
                    }
                    break;
                    
                case 'booking-phone':
                    const phoneRegex = /^(09|07)\d{8}$/; // Accept 10-digit Ethiopian numbers (09xxxxxxx or 07xxxxxxx)
                    if (!phoneRegex.test(input.value)) {
                        isValid = false;
                        errorMessage = 'Enter valid Ethiopian phone number (10 digits, e.g. 09xxxxxxxx)';
                    }
                    break;
                    
                case 'booking-email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        errorMessage = 'Enter valid email address';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            showError(input, errorMessage);
        } else {
            clearError(input);
        }
        
        return isValid;
    }
    
    function showError(input, message) {
        clearError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('is-invalid');
    }

    // ========== BOOKING SUMMARY UPDATER ==========
    const servicePrices = {
        'haircut': '250 Birr',
        'beard': '150 Birr',
        'premium': '350 Birr'
    };
    
    const barberInfo = {
        'john': {
            name: 'John Master',
            specialty: 'Haircut Specialist',
            experience: '12+ years experience',
            rating: '4.9 (120 reviews)'
        },
        'mike': {
            name: 'Mike Style',
            specialty: 'Beard Specialist',
            experience: '8+ years experience',
            rating: '4.7 (95 reviews)'
        },
        'alex': {
            name: 'Alex Cut',
            specialty: 'Modern Styles',
            experience: '10+ years experience',
            rating: '5.0 (150 reviews)'
        }
    };
    
    function updateBookingSummary() {
        const service = document.querySelector('input[name="service"]:checked');
        const barber = document.querySelector('input[name="barber"]:checked');
        
        // Service
        if (service) {
            const serviceLabel = service.closest('.service-option').querySelector('h4').textContent;
            document.getElementById('summary-service').textContent = serviceLabel;
            document.getElementById('summary-service').className = '';
            
            const price = servicePrices[service.value] || '0 Birr';
            document.getElementById('summary-price').textContent = price;
        } else {
            document.getElementById('summary-service').textContent = 'Select service';
            document.getElementById('summary-service').className = 'text-muted';
            document.getElementById('summary-price').textContent = '0 Birr';
        }
        
        // Barber
        if (barber && barber.value !== 'alex' && !barber.disabled) {
            const barberLabel = barber.closest('.barber-option').querySelector('h5').textContent;
            document.getElementById('summary-barber').textContent = barberLabel;
            document.getElementById('summary-barber').className = '';
        } else {
            document.getElementById('summary-barber').textContent = 'Select barber';
            document.getElementById('summary-barber').className = 'text-muted';
        }
        
        // Date
        if (dateConfig.selectedDate && dateConfig.selectedDate.isAvailable) {
            document.getElementById('summary-date').textContent = dateConfig.selectedDate.displayDate;
            document.getElementById('summary-date').className = '';
        } else {
            document.getElementById('summary-date').textContent = 'Select date';
            document.getElementById('summary-date').className = 'text-muted';
        }
        
        // Time
        const selectedTime12 = dateConfig.getSelectedTime12();
        if (selectedTime12) {
            document.getElementById('summary-time').textContent = selectedTime12;
            document.getElementById('summary-time').className = '';
        } else {
            document.getElementById('summary-time').textContent = 'Enter time';
            document.getElementById('summary-time').className = 'text-muted';
        }
    }
    
    function updateSelectedBarberInfo() {
        const barber = document.querySelector('input[name="barber"]:checked');
        const infoCard = document.getElementById('selected-barber-info');
        
        if (barber && barber.value !== 'alex' && !barber.disabled) {
            const info = barberInfo[barber.value];
            if (info && infoCard) {
                document.getElementById('selected-barber-name').textContent = info.name;
                document.getElementById('selected-barber-specialty').textContent = info.specialty;
                document.getElementById('selected-barber-exp').textContent = info.experience;
                infoCard.style.display = 'block';
            }
        } else if (infoCard) {
            infoCard.style.display = 'none';
        }
    }

    // ========== FORM SUBMISSION ==========
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            let errorMessages = [];
            
            // Validate personal info
            const name = document.getElementById('booking-full-name');
            const phone = document.getElementById('booking-phone');
            const email = document.getElementById('booking-email');
            
            if (!validateInput(name)) {
                isValid = false;
                errorMessages.push('Valid full name is required');
            }
            if (!validateInput(phone)) {
                isValid = false;
                errorMessages.push('Valid phone number is required');
            }
            if (!validateInput(email)) {
                isValid = false;
                errorMessages.push('Valid email is required');
            }
            
            // Validate service
            const serviceSelected = document.querySelector('input[name="service"]:checked');
            if (!serviceSelected) {
                isValid = false;
                errorMessages.push('Please select a service');
            }
            
            // Validate barber
            const barberSelected = document.querySelector('input[name="barber"]:checked');
            if (!barberSelected || barberSelected.value === 'alex' || barberSelected.disabled) {
                isValid = false;
                errorMessages.push('Please select an available barber');
            }
            
            // Validate date
            if (!dateConfig.selectedDate || !dateConfig.selectedDate.isAvailable) {
                isValid = false;
                errorMessages.push('Please select an available date');
            }
            
            // Validate time
            const timeValidation = document.getElementById('time-validation');
            const selectedTime = dateConfig.getSelectedTime12();
            
            if (!selectedTime) {
                isValid = false;
                errorMessages.push('Please select a time');
            } else if (timeValidation && timeValidation.querySelector('.text-danger')) {
                isValid = false;
                errorMessages.push('Please select a valid time');
            }
            
            if (isValid) {
                // Validate payment selection with inline errors
                const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || null;
                let paymentValid = true;
                let paymentInfo = null;

                const teleInput = document.getElementById('telebirr-phone');
                const cbeInput = document.getElementById('cbe-ref');
                const bankInput = document.getElementById('bank-ref');
                const teleErr = document.getElementById('telebirr-error');
                const cbeErr = document.getElementById('cbe-error');
                const bankErr = document.getElementById('bank-error');

                // clear previous payment errors
                [teleInput, cbeInput, bankInput].forEach(inp => { if (inp) inp.classList.remove('is-invalid'); });
                [teleErr, cbeErr, bankErr].forEach(el => { if (el) { el.classList.add('d-none'); el.textContent = ''; } });

                if (!paymentMethod) {
                    paymentValid = false;
                    errorMessages.push('Please select a payment method');
                } else if (paymentMethod === 'telebirr') {
                    const tel = teleInput ? teleInput.value.trim() : '';
                    const phoneRegex = /^(09|07)\d{8}$/; // EthioTelecom or Safaricom-style 10 digits
                    if (!phoneRegex.test(tel)) {
                        paymentValid = false;
                        if (teleErr) { teleErr.textContent = 'Enter a valid Ethiopian phone (10 digits, e.g. 09xxxxxxxx and 07xxxxxxxx)'; teleErr.classList.remove('d-none'); }
                        if (teleInput) teleInput.classList.add('is-invalid');
                    } else {
                        paymentInfo = { method: 'Telebirr', phone: tel };
                    }
                } else if (paymentMethod === 'cbe') {
                    const ref = cbeInput ? cbeInput.value.trim() : '';
                    const phoneRegex = /^(09|07)\d{8}$/;
                    if (!phoneRegex.test(ref)) {
                        paymentValid = false;
                        if (cbeErr) { cbeErr.textContent = 'Enter a valid Ethiopian phone for CBE (10 digits e.g. 09xxxxxxxx and 07xxxxxxxx)'; cbeErr.classList.remove('d-none'); }
                        if (cbeInput) cbeInput.classList.add('is-invalid');
                    } else {
                        paymentInfo = { method: 'CBE', phone: ref };
                    }
                } else if (paymentMethod === 'bank') {
                    const bank = document.getElementById('bank-select').value;
                    const bankRef = bankInput ? bankInput.value.trim() : '';
                    const digitsOnly = /^\d+$/;
                    if (!bankRef || !digitsOnly.test(bankRef)) {
                        paymentValid = false;
                        if (bankErr) { bankErr.textContent = 'Enter a numeric account number or transaction reference'; bankErr.classList.remove('d-none'); }
                        if (bankInput) bankInput.classList.add('is-invalid');
                    } else {
                        // validate length by bank
                        const len = bankRef.length;
                        let validLen = false;
                        if (bank === 'cbe') validLen = (len === 13);
                        if (bank === 'dashen') validLen = (len >=13 && len <=16);
                        if (bank === 'awash') validLen = (len >=10 && len <=12);
                        if (bank === 'abyssinia') validLen = (len >=8 && len <=12);

                        if (!validLen) {
                            paymentValid = false;
                            if (bankErr) { bankErr.textContent = 'Account/reference length is invalid for selected bank'; bankErr.classList.remove('d-none'); }
                            if (bankInput) bankInput.classList.add('is-invalid');
                        } else {
                            paymentInfo = { method: 'Bank Transfer', bank: bank, reference: bankRef };
                        }
                    }
                }

                if (!paymentValid) {
                    const errorMessage = errorMessages[0] || 'Please correct payment details';
                    showToast('Payment Error', errorMessage, 'error');
                    const firstError = document.querySelector('.is-invalid') || document.getElementById('telebirr-phone') || document.getElementById('cbe-ref') || document.getElementById('bank-ref');
                    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                const submitBtn = document.getElementById('confirm-booking-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    saveBookingData();
                    // Attach payment info to last booking
                    try {
                        const last = JSON.parse(localStorage.getItem('quickcutLastBooking') || '{}');
                        if (last && paymentInfo) {
                            last.payment = paymentInfo;
                            localStorage.setItem('quickcutLastBooking', JSON.stringify(last));
                        }
                    } catch (e) {}

                    // Mark that user just booked so queue page can show confirmation,
                    // then navigate to the queue page (no local confirmation toast here).
                    try {
                        sessionStorage.setItem('justBooked', '1');
                    } catch (e) {}

                    // Redirect to queue status immediately after saving booking
                    window.location.href = 'queuestatus.html';

                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            } else {
                const errorMessage = errorMessages[0] || 'Please complete all required fields';
                showToast('Booking Failed', errorMessage, 'error');
                
                const firstError = document.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    function saveBookingData() {
        const selectedTime12 = dateConfig.getSelectedTime12();
        
        const bookingData = {
            fullName: document.getElementById('booking-full-name').value,
            phone: document.getElementById('booking-phone').value,
            email: document.getElementById('booking-email').value,
            service: document.querySelector('input[name="service"]:checked')?.value,
            serviceName: document.querySelector('input[name="service"]:checked')?.closest('.service-option').querySelector('h4')?.textContent,
            barber: document.querySelector('input[name="barber"]:checked')?.value,
            barberName: document.querySelector('input[name="barber"]:checked')?.closest('.barber-option').querySelector('h5')?.textContent,
            date: dateConfig.selectedDate.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            time: selectedTime12,
            specialRequests: document.getElementById('special-requests').value,
            bookingTime: new Date().toISOString(),
            bookingId: 'BK-' + Date.now(),
            status: 'confirmed',
            queuePosition: Math.floor(Math.random() * 5) + 1,
            totalAmount: document.getElementById('summary-price').textContent
        };
        
        localStorage.setItem('quickcutLastBooking', JSON.stringify(bookingData));
        let bookingHistory = JSON.parse(localStorage.getItem('quickcutBookingHistory') || '[]');
        bookingHistory.push(bookingData);
        localStorage.setItem('quickcutBookingHistory', JSON.stringify(bookingHistory));
        sessionStorage.setItem('currentBooking', JSON.stringify(bookingData));
    }

    // ========== TOAST NOTIFICATIONS ==========
    function showToast(title, message, type = 'info') {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    <small>${message}</small>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }

    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========== ADD CUSTOM CSS STYLES ==========
    const customStyles = document.createElement('style');
    customStyles.textContent = `
        /* Animations */
        @keyframes selectPulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
            70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Date List Styling */
        .date-list-container {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: fadeIn 0.5s ease;
        }
        
        .date-list-header {
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 15px;
        }
        
        .real-time-status {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            animation: fadeIn 0.3s ease;
        }
        
        .real-time-status.status-open {
            background: rgba(40, 167, 69, 0.1);
            border-left: 3px solid #28a745;
        }
        
        .real-time-status.status-closed {
            background: rgba(220, 53, 69, 0.1);
            border-left: 3px solid #dc3545;
        }
        
        .real-time-status.status-warning {
            background: rgba(255, 193, 7, 0.1);
            border-left: 3px solid #ffc107;
        }
        
        .date-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            max-height: 320px;
            overflow-y: auto;
            padding: 10px;
            margin-top: 10px;
        }
        
        .date-list-item {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            animation: fadeIn 0.5s ease;
        }
        
        .date-list-item:hover:not(.date-unavailable) {
            border-color: #0d6efd;
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
        }
        
        .date-list-item.date-selected {
            border-color: #0d6efd;
            background: rgba(13, 110, 253, 0.08);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
        }
        
        .date-list-item.date-unavailable {
            opacity: 0.6;
            cursor: not-allowed;
            background: #f8f9fa;
        }
        
        .date-list-item.date-unavailable:hover {
            transform: none;
            box-shadow: none;
            border-color: #e9ecef;
        }
        
        .date-item-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .date-display {
            font-weight: 600;
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 5px;
        }
        
        .date-full {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 10px;
            flex-grow: 1;
        }
        
        .date-meta {
            display: flex;
            justify-content: flex-end;
        }
        
        .date-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .date-badge.available {
            background: #28a745;
            color: white;
        }
        
        .date-badge.today {
            background: #ffc107;
            color: #000;
        }
        
        .date-badge.tomorrow {
            background: #17a2b8;
            color: white;
        }
        
        .date-badge.closed {
            background: #dc3545;
            color: white;
        }
        
        /* Selected Date Info */
        .selected-date-info {
            background: rgba(13, 110, 253, 0.08);
            border: 1px solid rgba(13, 110, 253, 0.2);
            border-radius: 8px;
            padding: 15px;
            animation: fadeIn 0.3s ease;
        }
        
        /* Time Input Styling */
        .time-input-container {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 20px;
            animation: fadeIn 0.5s ease;
        }
        
        .time-input-header {
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 15px;
        }
        
        .time-select {
            height: 50px;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .time-select:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .time-validation {
            min-height: 40px;
            display: flex;
            align-items: center;
            animation: fadeIn 0.3s ease;
        }
        
        .time-validation .text-success {
            color: #198754;
            font-weight: 500;
        }
        
        .time-validation .text-danger {
            color: #dc3545;
            font-weight: 500;
        }
        
        .time-validation .text-muted {
            color: #6c757d;
        }
        
        /* Time Suggestions */
        .time-suggestions {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #e9ecef;
            animation: fadeIn 0.3s ease;
        }
        
        .time-suggestion {
            min-width: 85px;
            padding: 8px 12px;
            transition: all 0.2s ease;
            border: 2px solid #dee2e6;
            position: relative;
            overflow: hidden;
        }
        
        .time-suggestion:hover {
            background: #0d6efd;
            color: white;
            border-color: #0d6efd;
            transform: translateY(-2px);
        }
        
        .time-suggestion.active {
            background: #0d6efd !important;
            color: white !important;
            border-color: #0d6efd !important;
            animation: selectPulse 0.5s ease;
        }
        
        /* Selected Time Info */
        .selected-time-info {
            border: none;
            background: rgba(25, 135, 84, 0.1);
            border-left: 4px solid #198754;
            animation: fadeIn 0.3s ease;
        }
        
        /* Progress Steps */
        .progress-step.active span {
            background: #0d6efd !important;
            color: white !important;
            transform: scale(1.1);
            box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
            animation: selectPulse 2s infinite;
        }
        
        .progress-step.completed span {
            background: #28a745 !important;
            color: white !important;
        }
        
        /* Scrollbar Styling */
        .date-list::-webkit-scrollbar {
            width: 6px;
        }
        
        .date-list::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        .date-list::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
        }
        
        .date-list::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .date-list {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .date-list-item {
                padding: 12px;
            }
            
            .date-display {
                font-size: 1rem;
            }
            
            .time-select {
                height: 45px;
                font-size: 0.95rem;
            }
            
            .time-suggestion {
                min-width: 70px;
                padding: 6px 10px;
                font-size: 0.85rem;
            }
            
            .real-time-status {
                font-size: 0.8rem;
                padding: 6px 10px;
            }
        }
        
        @media (max-width: 480px) {
            .date-list {
                grid-template-columns: 1fr;
            }
            
            .date-list-container,
            .time-input-container {
                padding: 15px;
            }
            
            .time-input-group .row.g-3 {
                margin: 0 -5px;
            }
            
            .time-input-group .col-md-4 {
                padding: 0 5px;
            }
        }
    `;
    document.head.appendChild(customStyles);
    
    // ========== ADD REAL-TIME CLOCK ==========
    function addRealTimeClock() {
        const clock = document.createElement('div');
        clock.className = 'real-time-clock';
        clock.id = 'real-time-clock';
        document.body.appendChild(clock);
        
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            clock.textContent = `${dateString} • ${timeString}`;
            
            // Update booking summary and progress
            updateBookingSummary();
            updateProgress();
        }
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    // ========== INITIALIZE EVERYTHING ==========
    function initializePage() {
        // Add real-time clock
        addRealTimeClock();
        
        // Initialize booking summary
        updateBookingSummary();
        updateProgress();

        // Payment method toggles
        const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
        const telebirrDetails = document.getElementById('telebirr-details');
        const cbeDetails = document.getElementById('cbe-details');
        const bankDetails = document.getElementById('bank-details');

        function updatePaymentUI() {
            const method = document.querySelector('input[name="payment_method"]:checked')?.value;
            if (method === 'telebirr') {
                telebirrDetails.style.display = '';
                cbeDetails.style.display = 'none';
                bankDetails.style.display = 'none';
            } else if (method === 'cbe') {
                telebirrDetails.style.display = 'none';
                cbeDetails.style.display = '';
                bankDetails.style.display = 'none';
            } else if (method === 'bank') {
                telebirrDetails.style.display = 'none';
                cbeDetails.style.display = 'none';
                bankDetails.style.display = '';
            }
        }

        paymentRadios.forEach(r => r.addEventListener('change', updatePaymentUI));
        updatePaymentUI();
        
        // Show page with fade-in effect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }

    // ========== START INITIALIZATION ==========
    initializePage();
});