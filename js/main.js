// =========================================================================
// COMPUTOPIA — MASTER FRONTEND CONTROLLER (js/main.js)
// Connects UI + Terminal + Auth Drawer to Node.js, PostgreSQL & MongoDB
// =========================================================================

const API_BASE = 'http://localhost:5000/api';
const avatarSeeds = ['Savibhash', 'Turing', 'Cipher', 'Nexus', 'Quantum', 'Kali'];
let currentSeedIndex = 0;

// -------------------------------------------------------------------------
// 1. HOME PAGE INTERACTIVE TERMINAL (+ MONGODB TELEMETRY LOGGING)
// -------------------------------------------------------------------------
const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');

const responses = {
    help: `Available Computopia Commands:
  • ai        — Inspect Artificial Intelligence & Neural Network metrics
  • cyber     — Run simulated cryptographic & security audit
  • datasci   — View Data Science & Statistical pipeline overview
  • binary    — Convert "COMPUTOPIA" into raw 8-bit ASCII binary
  • dbstatus  — Check PostgreSQL & MongoDB backend cluster status
  • quote     — Retrieve timeless wisdom from CS pioneers
  • clear     — Clear terminal buffer`,
    ai: `[AI / ML MODULE LOADED]
  • Architecture : Multi-Head Self-Attention Transformer & Deep CNN
  • Optimization : Stochastic Gradient Descent (AdamW, lr=0.0003)
  • Core Math    : Matrix Multiplication (Y = W·X + b) + Partial Derivatives
  • Status       : Synaptic weights converged.`,
    cyber: `[CYBERSECURITY AUDIT INITIATED]
  • Port Scan    : 22/SSH (Open - Key Auth), 443/HTTPS (TLS 1.3 Active)
  • Cipher Suite : ECDHE-RSA-AES256-GCM-SHA384
  • Firewall     : Netfilter/iptables enforcing strict zero-trust policy
  • Advice       : "Never trust raw user input; validate, sanitize, encrypt."`,
    datasci: `[DATA SCIENCE ENGINE]
  • Ingestion    : 4.8 Terabytes structured + unstructured telemetry
  • Pipeline     : Clean -> Normalize -> Feature Engineer -> Cross-Validate
  • Models       : Random Forest, XGBoost, Bayesian Inference`,
    binary: `[ASCII TO 8-BIT BINARY ENCODER]
  C = 01000011 | O = 01001111 | M = 01001101 | P = 01010000
  U = 01010101 | T = 01010100 | O = 01001111 | P = 01010000
  I = 01001001 | A = 01000001`,
    quote: `"We can only see a short distance ahead, but we can see plenty there that needs to be done." — Alan Turing (1950)`
};

function printLine(text, className = '') {
    if (!output) return;
    const div = document.createElement('div');
    div.className = 'term-line ' + className;
    div.innerText = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

async function logTelemetryToMongo(action, details = {}) {
    const handle = localStorage.getItem('computopia_initiate') || 'anonymous';
    try {
        await fetch(`${API_BASE}/telemetry/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handle, action, details })
        });
    } catch (_) {
        // Ignore when backend is offline
    }
}

window.runCommand = async function (cmd) {
    const clean = cmd.trim().toLowerCase().split(' ')[0];
    printLine(`seeker@computopia:~$ ${cmd}`, 'cmd-echo');
    logTelemetryToMongo('TERMINAL_CMD', { command: cmd });

    if (clean === 'clear') {
        if (output) output.innerHTML = '';
        return;
    }

    if (clean === 'dbstatus') {
        printLine('Pinging Node.js Backend (PostgreSQL + MongoDB) at localhost:5000...', 'muted');
        try {
            const res = await fetch(`${API_BASE}/telemetry/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle: 'system_check', action: 'PING' })
            });
            if (res.ok) {
                printLine('[ONLINE] Node.js Express API + PostgreSQL + MongoDB Telemetry Active 🟢', 'term-response');
            } else {
                printLine('[WARNING] Server responded with non-200 status.', 'term-error');
            }
        } catch (err) {
            printLine('[OFFLINE] Node server not detected on port 5000. Running in Local Cache Mode.', 'term-error');
        }
        return;
    }

    if (responses[clean]) {
        printLine(responses[clean], 'term-response');
    } else {
        printLine(`Command not recognized: '${cmd}'. Type 'help' for available commands.`, 'term-error');
    }
};

window.loadArticleInTerminal = function (topic) {
    const sanctum = document.getElementById('sanctum');
    if (sanctum) sanctum.scrollIntoView({ behavior: 'smooth' });
    logTelemetryToMongo('READ_DISPATCH', { topic });

    if (topic === 'cpu') {
        printLine('seeker@computopia:~$ cat /chronicles/cpu_architecture.txt', 'cmd-echo');
        printLine('[DISPATCH #01: SILICON & GATES]\nEvery instruction goes through the Fetch -> Decode -> Execute -> Writeback cycle inside the CPU pipeline.', 'term-response');
    } else if (topic === 'crypto') {
        printLine('seeker@computopia:~$ cat /chronicles/asymmetric_crypto.txt', 'cmd-echo');
        printLine('[DISPATCH #02: TRAPDOOR FUNCTIONS]\nMultiplying two 2048-bit prime numbers takes milliseconds. Factoring their product takes classical computers millennia.', 'term-response');
    } else if (topic === 'ai') {
        printLine('seeker@computopia:~$ cat /chronicles/neural_calculus.txt', 'cmd-echo');
        printLine('[DISPATCH #03: MATRICES THAT DREAM]\nBy computing the gradient of the Loss Function (∇L), a neural network iteratively steps downhill toward minimum error.', 'term-response');
    }
};

if (input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            window.runCommand(input.value);
            input.value = '';
        }
    });
}

// -------------------------------------------------------------------------
// 2. PERSONNEL DROPDOWN DRAWER & SETTINGS
// -------------------------------------------------------------------------
window.openAuthModal = function (mode = 'login') {
    const savedUser = localStorage.getItem('computopia_initiate');
    if (savedUser) {
        window.togglePersonnelDropdown();
        return;
    }
    const backdrop = document.getElementById('authBackdrop');
    if (backdrop) {
        backdrop.classList.add('active');
        window.switchAuthTab(mode);
    }
};

window.togglePersonnelDropdown = function () {
    const dropdown = document.getElementById('personnelDropdown');
    const triggerBtn = document.getElementById('authTriggerBtn');
    if (!dropdown || !triggerBtn) return;

    const rect = triggerBtn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 10) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    dropdown.classList.toggle('open');
};

window.closePersonnelDropdown = function () {
    const dropdown = document.getElementById('personnelDropdown');
    if (dropdown) dropdown.classList.remove('open');
};

window.togglePdSubpanel = function (panelId) {
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.toggle('hidden');
};

window.cycleProfileAvatar = function () {
    currentSeedIndex = (currentSeedIndex + 1) % avatarSeeds.length;
    const newUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeeds[currentSeedIndex]}&backgroundColor=09130f`;
    const img = document.getElementById('pdAvatarImg');
    if (img) img.src = newUrl;
    localStorage.setItem('computopia_avatar', newUrl);
    logTelemetryToMongo('AVATAR_UPDATE', { avatar: newUrl });
};

window.saveProfileChanges = function () {
    const newHandle = document.getElementById('editHandleInput').value.trim();
    const newAvatar = document.getElementById('editAvatarInput').value.trim();

    if (newHandle) localStorage.setItem('computopia_initiate', newHandle);
    if (newAvatar) localStorage.setItem('computopia_avatar', newAvatar);

    window.updateNavbarAuthState();
    document.getElementById('profileEditPanel').classList.add('hidden');
    logTelemetryToMongo('PROFILE_EDIT', { newHandle });
};

window.toggleTelemetryBar = function (show) {
    const bar = document.querySelector('.telemetry-bar');
    if (bar) bar.style.display = show ? 'flex' : 'none';
};

window.terminateInitiateSession = function () {
    logTelemetryToMongo('LOGOUT');
    localStorage.removeItem('computopia_initiate');
    localStorage.removeItem('computopia_token');
    window.closePersonnelDropdown();
    window.updateNavbarAuthState();
};

// -------------------------------------------------------------------------
// 3. POSTGRESQL + MONGODB LOGIN & REGISTER CONTROLLER
// -------------------------------------------------------------------------
window.closeAuthModal = function () {
    const backdrop = document.getElementById('authBackdrop');
    const alertBox = document.getElementById('authAlert');
    if (backdrop) backdrop.classList.remove('active');
    if (alertBox) alertBox.classList.add('hidden');
};

window.switchAuthTab = function (mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loreHeading = document.getElementById('loreHeading');
    const loreSubtext = document.getElementById('loreSubtext');
    const alertBox = document.getElementById('authAlert');

    if (alertBox) alertBox.classList.add('hidden');

    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loreHeading.innerText = 'Verify Your Identity';
        loreSubtext.innerText = 'Enter your credentials to synchronize with PostgreSQL & MongoDB and unlock restricted terminal archives.';
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loreHeading.innerText = 'Inscribe New Initiate';
        loreSubtext.innerText = 'Forge your cryptographic identity inside the PostgreSQL vault and select your primary realm of study.';
    }
};

window.togglePassVisibility = function (inputId, btn) {
    const field = document.getElementById(inputId);
    if (field.type === 'password') {
        field.type = 'text';
        btn.innerText = '🙈';
    } else {
        field.type = 'password';
        btn.innerText = '👁️';
    }
};

window.evaluateEntropy = function (val) {
    const fill = document.getElementById('entropyFill');
    const label = document.getElementById('entropyLabel');
    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score += 25;
    if (/[^A-Za-z0-9]/.test(val)) score += 25;

    fill.style.width = score + '%';
    if (score <= 25) {
        fill.style.background = '#ef4444';
        label.innerText = 'Entropy: Low (Vulnerable to brute-force)';
    } else if (score <= 50) {
        fill.style.background = '#f59e0b';
        label.innerText = 'Entropy: Moderate (Standard cipher)';
    } else if (score <= 75) {
        fill.style.background = '#d4af37';
        label.innerText = 'Entropy: Strong (Cryptographically sound)';
    } else {
        fill.style.background = '#10b981';
        label.innerText = 'Entropy: Maximum (AES-256 Vault Grade)';
    }
};

window.showAuthAlert = function (msg) {
    const alertBox = document.getElementById('authAlert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.classList.remove('hidden');
};

window.handleAuthSubmit = async function (e, mode) {
    e.preventDefault();

    if (mode === 'login') {
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                window.showAuthAlert(`❌ ${data.message || 'Authentication rejected.'}`);
                return;
            }

            localStorage.setItem('computopia_initiate', data.user.handle);
            localStorage.setItem('computopia_email', data.user.email);
            localStorage.setItem('computopia_realm', data.user.realm);
            localStorage.setItem('computopia_token', data.token);
            window.showAuthAlert(`⚡ PostgreSQL Verified! Welcome back, Initiate [${data.user.handle}].`);
        } catch (err) {
            const fallbackHandle = identifier.split('@')[0];
            localStorage.setItem('computopia_initiate', fallbackHandle);
            localStorage.setItem('computopia_email', identifier.includes('@') ? identifier : `${fallbackHandle.toLowerCase()}@computopia.core`);
            window.showAuthAlert(`⚡ [Local Cache Mode] Authenticated as [${fallbackHandle}]!`);
        }

        setTimeout(() => {
            window.updateNavbarAuthState();
            window.closeAuthModal();
        }, 950);
    } else {
        const handle = document.getElementById('regHandle').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const realm = document.getElementById('regRealm').value;

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle, email, password, realm })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                window.showAuthAlert(`❌ ${data.message || 'Registration failed.'}`);
                return;
            }

            localStorage.setItem('computopia_initiate', data.user.handle);
            localStorage.setItem('computopia_email', data.user.email);
            localStorage.setItem('computopia_realm', data.user.realm);
            localStorage.setItem('computopia_token', data.token);
            window.showAuthAlert(`✦ Inscribed in PostgreSQL & MongoDB! Welcome, [${data.user.handle}].`);
        } catch (err) {
            localStorage.setItem('computopia_initiate', handle);
            localStorage.setItem('computopia_email', email);
            localStorage.setItem('computopia_realm', realm);
            window.showAuthAlert(`✦ [Local Cache Mode] Initiate [${handle}] inscribed!`);
        }

        setTimeout(() => {
            window.updateNavbarAuthState();
            window.closeAuthModal();
        }, 1000);
    }
};

window.simulateOAuth = function (provider) {
    window.showAuthAlert(`🔐 Handshaking with ${provider} OAuth 2.0... Authenticated!`);
    localStorage.setItem('computopia_initiate', `${provider}_Initiate`);
    logTelemetryToMongo('OAUTH_LOGIN', { provider });
    setTimeout(() => {
        window.updateNavbarAuthState();
        window.closeAuthModal();
    }, 900);
};

window.triggerResetCipher = function (e) {
    e.preventDefault();
    window.showAuthAlert('📩 Recovery cipher dispatch transmitted to your registered email.');
};

window.updateNavbarAuthState = function () {
    const btn = document.getElementById('authTriggerBtn');
    const label = document.getElementById('authBtnLabel');
    const savedUser = localStorage.getItem('computopia_initiate');
    const savedEmail = localStorage.getItem('computopia_email') || `${(savedUser || 'initiate').toLowerCase()}@computopia.core`;
    const savedRealm = localStorage.getItem('computopia_realm') || '🧠 AI & Cybersecurity';
    const savedAvatar = localStorage.getItem('computopia_avatar');

    if (!btn || !label) return;

    if (savedUser) {
        btn.classList.add('logged-in');
        label.innerText = `INITIATE: ${savedUser.toUpperCase()} ▾`;
        document.getElementById('pdHandle').innerText = savedUser.toUpperCase();
        document.getElementById('pdEmail').innerText = savedEmail;
        document.getElementById('pdRealm').innerText = savedRealm;
        if (savedAvatar) {
            document.getElementById('pdAvatarImg').src = savedAvatar;
        }
    } else {
        btn.classList.remove('logged-in');
        label.innerText = 'Login / Join';
    }
};

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('personnelDropdown');
    const triggerBtn = document.getElementById('authTriggerBtn');
    if (dropdown && dropdown.classList.contains('open')) {
        if (!dropdown.contains(e.target) && !triggerBtn.contains(e.target)) {
            window.closePersonnelDropdown();
        }
    }
    if (e.target.id === 'authBackdrop') {
        window.closeAuthModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeAuthModal();
        window.closePersonnelDropdown();
    }
});

window.updateNavbarAuthState();