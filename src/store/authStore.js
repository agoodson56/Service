/**
 * Auth Store — user authentication & management
 * Passwords are hashed with SHA-256 + salt for security.
 * Users are stored in localStorage.
 */

const STORAGE_KEY = '3dservice_users';
const SESSION_KEY = '3dservice_session';

// Simple SHA-256 hash (browser-native)
async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default users — seeded on first run
const DEFAULT_USERS = [
    {
        id: 'admin-001',
        email: 'agoodson@3dtsi.com',
        name: 'Anthony Goodson',
        role: 'Admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'mgr-001',
        email: 'rrichard@3dtsi.com',
        name: 'R. Richard',
        role: 'Service Manager',
        createdAt: new Date().toISOString(),
    },
];

const DEFAULT_PASSWORDS = {
    'agoodson@3dtsi.com': '56AG62ccg60??!!',
    'rrichard@3dtsi.com': '12345678',
};

// Initialize users if not present
async function initializeUsers() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing);

    const users = [];
    for (const user of DEFAULT_USERS) {
        const salt = generateSalt();
        const hash = await hashPassword(DEFAULT_PASSWORDS[user.email], salt);
        users.push({ ...user, salt, hash });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return users;
}

function getUsers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

function setSession(user) {
    const session = { id: user.id, email: user.email, name: user.name, role: user.role };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

async function login(email, password) {
    const users = await initializeUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'Invalid email or password' };

    const hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) return { success: false, error: 'Invalid email or password' };

    const session = setSession(user);
    return { success: true, user: session };
}

function logout() {
    clearSession();
}

async function addUser({ email, name, role, password }) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'A user with this email already exists' };
    }
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        email, name, role, salt, hash,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
}

async function changePassword(userId, newPassword) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };

    const salt = generateSalt();
    const hash = await hashPassword(newPassword, salt);
    users[idx].salt = salt;
    users[idx].hash = hash;
    saveUsers(users);
    return { success: true };
}

function updateUser(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };

    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return { success: true };
}

function deleteUser(userId) {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length === users.length) return { success: false, error: 'User not found' };
    saveUsers(filtered);
    return { success: true };
}

function listUsers() {
    return getUsers().map(u => ({
        id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt,
    }));
}

export {
    initializeUsers, getSession, login, logout,
    addUser, changePassword, updateUser, deleteUser, listUsers,
};
