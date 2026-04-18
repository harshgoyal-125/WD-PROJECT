// === State & Mock Data ===
let currentLang = 'en';
let workerData = null;
let isAdmin = false;
const ANNUAL_LIMIT = 100;

// Mock database simulating the backend response
const mockDB = {
    workers: [
        { id: '1', jobCardNumber: 'RJ-12-001', password: '123', name: 'Ram Kumar', totalDaysWorkedCurrentFY: 80, totalWagesEarnedCurrentFY: 16000 }
    ],
    demands: [
        { id: 'd1', workerId: '1', status: 'Pending', requestedDays: 15, workTypePreferred: 'Land development' }
    ]
};

// === i18n Dictionary ===
const i18n = {
    en: {
        portal_title: "MGNREGA Portal",
        portal_subtitle: "Work Demand & Tracking System",
        login_title: "Worker Login",
        job_card_num: "Job Card Number",
        password: "Password / PIN",
        login_btn: "Login",
        welcome: "Welcome, Worker",
        logout: "Logout",
        days_worked: "Days Worked (Current FY)",
        wages_earned: "Wages Earned",
        pending_demands: "Pending Demands",
        latest_demand_status: "Latest Demand Status",
        no_demands: "No active work demands found. Submit one below.",
        status_pending: "Pending",
        status_allocated: "Work Allocated",
        status_muster: "Muster Roll",
        status_completed: "Completed/Paid",
        submit_demand: "Submit New Work Demand",
        pref_work: "Preferred Work Type",
        family_members: "Family Members Participating",
        start_date: "Availability Start Date",
        days_req: "Number of Days Requested",
        days_calc_helper: "Cannot exceed remaining days in 100-day limit.",
        submit_btn: "Submit Formal Demand",
        go_to_register: "Don't have an account? Register here",
        go_to_login: "Already have an account? Login here",
        register_title: "Register Worker",
        worker_name: "Full Name",
        register_btn: "Register",
        register_success: "Registration successful! You can now log in.",
        admin_panel_title: "Admin Approval Dashboard",
        admin_panel_subtitle: "Manage and allocate requested work demands",
        pending_demands_list: "List of Pending Demands",
        worker_id: "Worker ID",
        action: "Action",
        no_pending_admin: "No pending demands found."
    },
    hi: {
        portal_title: "मनरेगा पोर्टल",
        portal_subtitle: "कार्य मांग और ट्रैकिंग प्रणाली",
        login_title: "श्रमिक लॉगिन",
        job_card_num: "जॉब कार्ड नंबर",
        password: "पासवर्ड / पिन",
        login_btn: "लॉगिन करें",
        welcome: "स्वागत है, श्रमिक",
        logout: "लॉग आउट",
        days_worked: "काम किए गए दिन",
        wages_earned: "कमाया गया वेतन",
        pending_demands: "लंबित मांगें",
        latest_demand_status: "नवीनतम मांग स्थिति",
        no_demands: "कोई सक्रिय कार्य मांग नहीं मिली। नीचे एक जमा करें।",
        status_pending: "लंबित",
        status_allocated: "कार्य आवंटित",
        status_muster: "मस्टर रोल",
        status_completed: "पूर्ण/भुगतान किया",
        submit_demand: "नई कार्य मांग जमा करें",
        pref_work: "पसंदीदा कार्य प्रकार",
        family_members: "भाग लेने वाले परिवार के सदस्य",
        start_date: "उपलब्धता आरंभ तिथि",
        days_req: "अनुरोध किए गए दिनों की संख्या",
        days_calc_helper: "100-दिन की सीमा में शेष दिनों से अधिक नहीं हो सकता।",
        submit_btn: "औपचारिक मांग जमा करें",
        go_to_register: "खाता नहीं है? यहाँ रजिस्टर करें",
        go_to_login: "पहले से खाता है? यहाँ लॉग इन करें",
        register_title: "श्रमिक पंजीकरण",
        worker_name: "पूरा नाम",
        register_btn: "रजिस्टर करें",
        register_success: "पंजीकरण सफल! अब आप लॉग इन कर सकते हैं।",
        admin_panel_title: "व्यवस्थापक अनुमोदन डैशबोर्ड",
        admin_panel_subtitle: "अनुरोधित कार्य मांगों का प्रबंधन और आवंटन करें",
        pending_demands_list: "लंबित मांगों की सूची",
        worker_id: "श्रमिक आईडी",
        action: "कार्रवाई",
        no_pending_admin: "कोई लंबित मांग नहीं मिली।"
    }
};

// === DOM Elements ===
const els = {
    langToggle: document.getElementById('langToggle'),
    // Sections
    loginSection: document.getElementById('loginSection'),
    registerSection: document.getElementById('registerSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    adminSection: document.getElementById('adminSection'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    demandForm: document.getElementById('demandForm'),
    
    // Messages
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),
    registerSuccess: document.getElementById('registerSuccess'),
    
    // Buttons/Links
    goToRegisterBtn: document.getElementById('goToRegisterBtn'),
    goToLoginBtn: document.getElementById('goToLoginBtn'),
    logoutBtns: document.querySelectorAll('.logoutBtnAction'),
    
    // Stats (Worker)
    displayJobCard: document.getElementById('displayJobCard'),
    statDaysWorked: document.getElementById('statDaysWorked'),
    statWages: document.getElementById('statWages'),
    statPending: document.getElementById('statPending'),
    
    // Form & Logic (Worker)
    daysReqInput: document.getElementById('daysReq'),
    limitWarning: document.getElementById('limitWarning'),
    limitWarningText: document.getElementById('limitWarningText'),
    demandSuccess: document.getElementById('demandSuccess'),
    
    // Timeline (Worker)
    noDemandsMsg: document.getElementById('noDemandsMsg'),
    timelineContainer: document.getElementById('timelineContainer'),
    
    // Admin
    adminDemandsTableBody: document.getElementById('adminDemandsTableBody'),
    adminNoDemands: document.getElementById('adminNoDemands')
};

// === Functions ===

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    applyLanguage();
    if(isAdmin) updateAdminDashboard();
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang] && i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });

    const jobCardPlaceholder = currentLang === 'en' ? "e.g. RJ-12-001" : "उदा. RJ-12-001";
    document.getElementById('jobCardInput').placeholder = jobCardPlaceholder;
    document.getElementById('regJobCardInput').placeholder = jobCardPlaceholder;
    document.getElementById('regNameInput').placeholder = currentLang === 'en' ? "e.g. Ram Kumar" : "उदा. राम कुमार";
}

// === Navigation/Routing Functions ===

function switchSection(sectionId) {
    const sections = ['loginSection', 'registerSection', 'dashboardSection', 'adminSection'];
    sections.forEach(s => {
        document.getElementById(s).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

els.goToRegisterBtn.addEventListener('click', () => {
    switchSection('registerSection');
});

els.goToLoginBtn.addEventListener('click', () => {
    switchSection('loginSection');
});

// === Authentication Logic ===

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regNameInput').value.trim();
    const jc = document.getElementById('regJobCardInput').value.trim();
    const pwd = document.getElementById('regPasswordInput').value.trim();
    
    // Check if worker already exists
    const exists = mockDB.workers.find(w => w.jobCardNumber === jc);
    if(exists) {
        els.registerError.textContent = currentLang === 'en' ? "Job Card already registered." : "जॉब कार्ड पहले से पंजीकृत है।";
        els.registerError.classList.remove('hidden');
        els.registerSuccess.classList.add('hidden');
        return;
    }
    
    // Add to MockDB
    mockDB.workers.push({
        id: Date.now().toString(),
        jobCardNumber: jc,
        password: pwd,
        name: name,
        totalDaysWorkedCurrentFY: 0,
        totalWagesEarnedCurrentFY: 0
    });
    
    els.registerError.classList.add('hidden');
    els.registerForm.reset();
    
    // Visually shift the user to the login section to log in
    switchSection('loginSection');
    
    // Pre-fill the login input
    document.getElementById('jobCardInput').value = jc;
    
    // Show a temporary success alert in the login panel
    els.loginError.classList.remove('hidden', 'text-red-500');
    els.loginError.classList.add('text-green-600');
    els.loginError.textContent = currentLang === 'en' ? "Registration successful! Please login." : "पंजीकरण सफल! कृपया लॉगिन करें।";
    
    setTimeout(() => {
        els.loginError.classList.add('hidden');
        els.loginError.classList.remove('text-green-600');
        els.loginError.classList.add('text-red-500');
    }, 5000);
}

function handleLogin(e) {
    e.preventDefault();
    const jc = document.getElementById('jobCardInput').value.trim();
    const pwd = document.getElementById('passwordInput').value.trim();
    
    // Admin checking
    if(jc === 'admin' && pwd === 'admin123') {
        isAdmin = true;
        els.loginError.classList.add('hidden');
        switchSection('adminSection');
        updateAdminDashboard();
        return;
    }

    // Normal Worker
    const user = mockDB.workers.find(w => w.jobCardNumber === jc && w.password === pwd);
    
    if (user) {
        workerData = user;
        isAdmin = false;
        els.loginError.classList.add('hidden');
        switchSection('dashboardSection');
        updateWorkerDashboard();
    } else {
        els.loginError.textContent = currentLang === 'en' ? "Invalid Job Card or Password" : "अमान्य जॉब कार्ड या पासवर्ड";
        els.loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    workerData = null;
    isAdmin = false;
    els.loginForm.reset();
    els.demandForm.reset();
    els.registerForm.reset();
    els.limitWarning.classList.add('hidden');
    els.demandSuccess.classList.add('hidden');
    els.loginError.classList.add('hidden');
    els.registerError.classList.add('hidden');
    els.registerSuccess.classList.add('hidden');
    switchSection('loginSection');
}

// === Worker Logic ===

function updateWorkerDashboard() {
    if(!workerData) return;
    
    const greeting = i18n[currentLang].welcome;
    document.querySelector('[data-i18n="welcome"]').textContent = `${greeting}, ${workerData.name}`;
    els.displayJobCard.textContent = workerData.jobCardNumber;
    
    els.statDaysWorked.textContent = workerData.totalDaysWorkedCurrentFY;
    els.statWages.textContent = workerData.totalWagesEarnedCurrentFY.toLocaleString('en-IN');
    
    const workerDemands = mockDB.demands.filter(d => d.workerId === workerData.id);
    const activeDemands = workerDemands.filter(d => d.status !== 'Completed' && d.status !== 'Paid');
    
    els.statPending.textContent = activeDemands.length;

    if (workerDemands.length > 0) {
        els.noDemandsMsg.classList.add('hidden');
        els.timelineContainer.classList.remove('hidden');
        renderTimeline(workerDemands[0].status); 
    } else {
        els.noDemandsMsg.classList.remove('hidden');
        els.timelineContainer.classList.add('hidden');
    }
}

function renderTimeline(currentStatus) {
    const steps = ['Pending', 'Allocated', 'Muster Roll Issued', 'Completed'];
    document.querySelectorAll('.status-step').forEach(node => {
        node.classList.remove('active', 'completed-step');
        node.classList.replace('bg-mgnrega-blue', 'bg-gray-300');
        node.classList.replace('text-white', 'text-gray-600');
    });

    const currentIndex = steps.indexOf(currentStatus) !== -1 ? steps.indexOf(currentStatus) : 0;

    document.querySelectorAll('.status-step').forEach((node, index) => {
        if(index < currentIndex) {
            node.classList.add('completed-step');
            node.classList.replace('bg-gray-300', 'bg-green-500');
            node.classList.replace('text-gray-600', 'text-white');
        } else if (index === currentIndex) {
            node.classList.add('active');
            node.classList.replace('bg-gray-300', 'bg-mgnrega-blue');
            node.classList.replace('text-gray-600', 'text-white');
        }
    });
}

function handleDemandFormInteraction(e) {
    if (!workerData) return;
    
    const requested = parseInt(e.target.value) || 0;
    const remainingDays = Math.max(0, ANNUAL_LIMIT - workerData.totalDaysWorkedCurrentFY);

    if (requested > remainingDays) {
        els.limitWarningText.textContent = currentLang === 'en' 
            ? `You only have ${remainingDays} days remaining in your annual 100-day limit.`
            : `आपकी वार्षिक 100-दिन की सीमा में केवल ${remainingDays} दिन बचे हैं।`;
        els.limitWarning.classList.remove('hidden');
    } else {
        els.limitWarning.classList.add('hidden');
    }
}

function handleDemandSubmit(e) {
    e.preventDefault();
    const requested = parseInt(els.daysReqInput.value) || 0;
    const workTypePreferred = document.getElementById('workType').value;
    const remainingDays = Math.max(0, ANNUAL_LIMIT - workerData.totalDaysWorkedCurrentFY);

    if (requested > remainingDays) {
        els.daysReqInput.focus();
        return;
    }

    mockDB.demands.unshift({
        id: 'd' + Date.now(),
        workerId: workerData.id,
        status: 'Pending',
        requestedDays: requested,
        workTypePreferred: workTypePreferred
    });

    els.limitWarning.classList.add('hidden');
    els.demandSuccess.classList.remove('hidden');
    setTimeout(() => { els.demandSuccess.classList.add('hidden') }, 5000);
    els.demandForm.reset();
    updateWorkerDashboard();
}

// === Admin Logic ===

function updateAdminDashboard() {
    els.adminDemandsTableBody.innerHTML = '';
    
    // Find all pending demands
    const pendingDemands = mockDB.demands.filter(d => d.status === 'Pending');
    
    if(pendingDemands.length === 0) {
        els.adminNoDemands.classList.remove('hidden');
        els.adminDemandsTableBody.parentElement.classList.add('hidden');
        return;
    }
    
    els.adminNoDemands.classList.add('hidden');
    els.adminDemandsTableBody.parentElement.classList.remove('hidden');
    
    pendingDemands.forEach(demand => {
        const worker = mockDB.workers.find(w => w.id === demand.workerId);
        const approveText = currentLang === 'en' ? 'Approve' : 'मंजूर';
        const rejectText = currentLang === 'en' ? 'Reject' : 'अस्वीकार';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-900">${worker ? worker.jobCardNumber : 'Unknown'}</td>
            <td class="px-4 py-3">${demand.workTypePreferred}</td>
            <td class="px-4 py-3">${demand.requestedDays}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="approveDemand('${demand.id}')" class="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold mr-2">${approveText}</button>
                <button onclick="rejectDemand('${demand.id}')" class="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold">${rejectText}</button>
            </td>
        `;
        els.adminDemandsTableBody.appendChild(row);
    });
}

// Need to attach to window for inline onclick in template literals
window.approveDemand = function(demandId) {
    const demand = mockDB.demands.find(d => d.id === demandId);
    if(demand) {
        demand.status = 'Allocated';
        updateAdminDashboard();
    }
}

window.rejectDemand = function(demandId) {
    const demand = mockDB.demands.find(d => d.id === demandId);
    if(demand) {
        demand.status = 'Rejected';
        updateAdminDashboard();
    }
}

// === Event Listeners ===
els.langToggle.addEventListener('click', toggleLanguage);
els.loginForm.addEventListener('submit', handleLogin);
els.registerForm.addEventListener('submit', handleRegister);
els.logoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));
els.daysReqInput.addEventListener('input', handleDemandFormInteraction);
els.demandForm.addEventListener('submit', handleDemandSubmit);

// Initialize
applyLanguage();
