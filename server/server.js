require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./db/postgres');
const { TelemetryLog } = require('./db/mongo');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'computopia_super_secret_jwt_key_2026';

// 1. REGISTER INITIATE
app.post('/api/auth/register', async (req, res) => {
    const { handle, email, password, realm } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await db.createInitiate({
            handle,
            email,
            password_hash,
            realm: realm || '🧠 AI & Cybersecurity'
        });

        await TelemetryLog.create({ handle: user.handle, action: 'REGISTER', details: { realm: user.realm } });

        const token = jwt.sign({ id: user.id, handle: user.handle }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, token, user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: 'Handle or email already registered.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. LOGIN INITIATE
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await db.findInitiate(identifier);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Initiate not found. Please register first.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid master passkey.' });
        }

        await TelemetryLog.create({ handle: user.handle, action: 'LOGIN' });

        const token = jwt.sign({ id: user.id, handle: user.handle }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            token,
            user: {
                handle: user.handle,
                email: user.email,
                realm: user.realm,
                xp: user.xp,
                clearance: user.clearance
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. TELEMETRY LOGGING ENDPOINT
app.post('/api/telemetry/log', async (req, res) => {
    const { handle, action, details } = req.body;
    try {
        await TelemetryLog.create({ handle: handle || 'anonymous', action, details });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 COMPUTOPIA Backend Server Live at http://localhost:${PORT}`);
});