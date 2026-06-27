/* ============================================
   APP.JS - MAIN APPLICATION CONTROLLER
   ============================================ */

// ----- ON PAGE LOAD -----
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Voters Registration Portal Loaded');

    // Initialize auth (creates default users if needed)
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // Update navigation based on login status
    updateNavigation();

    // Load stats if on homepage
    if (document.getElementById('statsContainer')) {
        loadHomeStats();
    }
});

// ----- UPDATE NAVIGATION -----
function updateNavigation() {
    const currentUser = getCurrentUser();
    const nav = document.querySelector('.navbar-nav');

    if (!nav) return;

    if (currentUser) {
        // Logged in - show dashboard and logout
        let dashboardLink = 'dashboard.html';
        if (currentUser.role === 'admin') {
            dashboardLink = 'admin.html';
        }

        nav.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="${dashboardLink}">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="handleLogout()">Logout</a></li>
        `;
    } else {
        // Not logged in - show default links
        nav.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
            <li class="nav-item"><a class="nav-link" href="status.html">Check Status</a></li>
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
        `;
    }
}

// ----- HANDLE LOGOUT -----
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        if (typeof logoutUser === 'function') {
            logoutUser();
        } else {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }
}

// ----- LOAD HOME PAGE STATS -----
function loadHomeStats() {
    const stats = getVoterStats();

    const totalEl = document.getElementById('totalVoters');
    const pendingEl = document.getElementById('pendingVoters');
    const approvedEl = document.getElementById('approvedVoters');
    const rejectedEl = document.getElementById('rejectedVoters');

    if (totalEl) totalEl.textContent = stats.total || 0;
    if (pendingEl) pendingEl.textContent = stats.pending || 0;
    if (approvedEl) approvedEl.textContent = stats.approved || 0;
    if (rejectedEl) rejectedEl.textContent = stats.rejected || 0;
}

// ----- SHOW NOTIFICATION (Toast) -----
function showNotification(message, type = 'success') {
    // Create notification element
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: 500;
        max-width: 350px;
        animation: slideIn 0.5s ease;
    `;
    div.textContent = message;

    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s ease';
        setTimeout(() => div.remove(), 500);
    }, 4000);
}

// ----- SHOW ERROR -----
function showError(message) {
    showNotification(message, 'error');
}

// ----- SHOW SUCCESS -----
function showSuccess(message) {
    showNotification(message, 'success');
}

// ----- FORMAT DATE -----
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// ----- GENERATE ID -----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ----- GENERATE APPLICATION NUMBER -----
function generateApplicationNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `APP${year}${random}`;
}

// ----- GENERATE VOTER ID -----
function generateVoterID() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PVC${year}${random}`;
}

// ----- VALIDATE NIN (11 digits) -----
function validateNIN(nin) {
    return /^\d{11}$/.test(nin);
}

// ----- VALIDATE PHONE (Nigerian) -----
function validatePhone(phone) {
    return /^(0[7-9][0-1]\d{8}|[0-9]{11})$/.test(phone);
}

// ----- VALIDATE EMAIL -----
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----- CHECK DUPLICATE NIN -----
function isDuplicateNIN(nin) {
    const voters = getVoters();
    return voters.some(v => v.nin === nin);
}

// ----- CHECK DUPLICATE EMAIL -----
function isDuplicateEmail(email) {
    const voters = getVoters();
    return voters.some(v => v.email === email);
}

// ----- REDIRECT IF NOT LOGGED IN -----
function requireLogin(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ----- REDIRECT IF NOT ADMIN -----
function requireAdmin(redirectUrl = 'dashboard.html') {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    if (!hasRole('admin')) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ----- REDIRECT IF NOT OFFICER OR ADMIN -----
function requireOfficer(redirectUrl = 'dashboard.html') {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    if (!hasRole(['admin', 'officer'])) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ----- GET LGA LIST -----
function getLGAList() {
    return [
        'Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin',
        'Oshodi-Isolo', 'Shomolu', 'Agege', 'Ifako-Ijaiye',
        'Surulere', 'Lagos Island', 'Lagos Mainland', 'Apapa',
        'Eti-Osa', 'Ikeja', 'Ikorodu', 'Badagry'
    ];
}

// ----- GET POLLING UNITS BY LGA -----
function getPollingUnitsByLGA(lga) {
    const all = getPollingUnits();
    return all.filter(p => p.lga === lga);
}

// ============================================
// CSS ANIMATION FOR NOTIFICATIONS
// ============================================
// Add this to style.css if not already there
// @keyframes slideIn {
//     from { transform: translateX(100%); opacity: 0; }
//     to { transform: translateX(0); opacity: 1; }
// }