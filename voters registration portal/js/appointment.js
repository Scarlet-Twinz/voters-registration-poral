/* ============================================
   APPOINTMENT.JS - Appointment CRUD Operations
   ============================================ */

// ----- BOOK APPOINTMENT -----
function bookAppointment(voterId, lga, date, time) {
    // Validate
    if (!voterId || !lga || !date || !time) {
        return { success: false, message: 'All fields are required!' };
    }

    // Check if voter exists
    const voter = findVoterByID(voterId);
    if (!voter) {
        return { success: false, message: 'Voter not found!' };
    }

    // Check for existing appointment
    const existing = getVoterAppointments(voterId);
    const scheduled = existing.filter(a => a.status === 'Scheduled');

    if (scheduled.length > 0) {
        return {
            success: false,
            message: 'You already have a scheduled appointment!',
            existing: scheduled[0]
        };
    }

    // Check availability
    const available = checkAvailability(lga, date, time);
    if (!available) {
        return { success: false, message: 'This time slot is not available!' };
    }

    // Create appointment
    const appointment = {
        id: 'app_' + Date.now(),
        voterId: voterId,
        fullName: voter.fullName,
        lga: lga,
        date: date,
        time: time,
        status: 'Scheduled',
        createdAt: getCurrentDateTime()
    };

    addAppointment(appointment);
    addAuditLog('APPOINTMENT_BOOKED', `${voter.fullName} booked appointment on ${date} at ${time}`);

    return {
        success: true,
        message: 'Appointment booked successfully!',
        appointment: appointment
    };
}

// ----- CHECK AVAILABILITY -----
function checkAvailability(lga, date, time) {
    const appointments = getAppointments();
    const existing = appointments.filter(a =>
        a.lga === lga &&
        a.date === date &&
        a.time === time &&
        a.status === 'Scheduled'
    );

    // Max 5 appointments per time slot
    return existing.length < 5;
}

// ----- GET AVAILABLE SLOTS -----
function getAvailableSlots(lga, date) {
    const allSlots = getTimeSlots();
    const appointments = getAppointments();
    const booked = appointments.filter(a =>
        a.lga === lga &&
        a.date === date &&
        a.status === 'Scheduled'
    );

    const bookedTimes = booked.map(a => a.time);

    return allSlots.filter(slot => !bookedTimes.includes(slot));
}

// ----- GET VOTER APPOINTMENTS -----
function getVoterAppointments(voterId) {
    const appointments = getAppointments();
    return appointments.filter(a => a.voterId === voterId);
}

// ----- CANCEL APPOINTMENT -----
function cancelAppointment(appointmentId, reason = '') {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        return { success: false, message: 'Appointment not found!' };
    }

    appointments[index].status = 'Cancelled';
    appointments[index].cancelledAt = getCurrentDateTime();
    appointments[index].cancellationReason = reason;
    saveAppointments(appointments);

    addAuditLog('APPOINTMENT_CANCELLED', `Appointment ${appointmentId} cancelled. Reason: ${reason}`);

    return { success: true, message: 'Appointment cancelled successfully!' };
}

// ----- RESCHEDULE APPOINTMENT -----
function rescheduleAppointment(appointmentId, newDate, newTime) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        return { success: false, message: 'Appointment not found!' };
    }

    const appointment = appointments[index];

    if (appointment.status === 'Cancelled') {
        return { success: false, message: 'Cannot reschedule a cancelled appointment!' };
    }

    if (appointment.status === 'Completed') {
        return { success: false, message: 'Cannot reschedule a completed appointment!' };
    }

    // Check availability for new slot
    const available = checkAvailability(appointment.lga, newDate, newTime);
    if (!available) {
        return { success: false, message: 'This time slot is not available!' };
    }

    // Update appointment
    appointments[index].date = newDate;
    appointments[index].time = newTime;
    appointments[index].updatedAt = getCurrentDateTime();
    saveAppointments(appointments);

    addAuditLog('APPOINTMENT_RESCHEDULED', `Appointment ${appointmentId} rescheduled to ${newDate} ${newTime}`);

    return {
        success: true,
        message: 'Appointment rescheduled successfully!',
        appointment: appointments[index]
    };
}

// ----- COMPLETE APPOINTMENT -----
function completeAppointment(appointmentId) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        return { success: false, message: 'Appointment not found!' };
    }

    if (appointments[index].status === 'Cancelled') {
        return { success: false, message: 'Cannot complete a cancelled appointment!' };
    }

    appointments[index].status = 'Completed';
    appointments[index].completedAt = getCurrentDateTime();
    saveAppointments(appointments);

    addAuditLog('APPOINTMENT_COMPLETED', `Appointment ${appointmentId} completed`);

    return { success: true, message: 'Appointment completed successfully!' };
}

// ----- GET APPOINTMENT STATS -----
function getAppointmentStats() {
    const appointments = getAppointments();

    return {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'Scheduled').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
        cancelled: appointments.filter(a => a.status === 'Cancelled').length,
        byLga: getAppointmentsByLGA()
    };
}

function getAppointmentsByLGA() {
    const appointments = getAppointments();
    const stats = {};

    appointments.forEach(a => {
        if (a.lga) {
            stats[a.lga] = (stats[a.lga] || 0) + 1;
        }
    });

    return stats;
}