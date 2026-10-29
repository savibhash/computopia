const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/computopia_db',
    connectionTimeoutMillis: 2500
});

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'initiates_postgres.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([], null, 2));

let isPgConnected = false;

async function initPostgres() {
    const query = `
    CREATE TABLE IF NOT EXISTS initiates (
      id SERIAL PRIMARY KEY,
      handle VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      realm VARCHAR(100) DEFAULT '🧠 AI & Cybersecurity',
      xp INTEGER DEFAULT 2450,
      clearance VARCHAR(50) DEFAULT 'GRAND ARCHITECT',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await pool.query(query);
        isPgConnected = true;
        console.log('✅ PostgreSQL [initiates] relational table verified & online.');
    } catch (err) {
        isPgConnected = false;
        console.log('⚡ PostgreSQL local service not detected -> Using Hybrid Disk Store (server/data/initiates_postgres.json)');
    }
}

initPostgres();

// Unified Database Operations (Works with both live PostgreSQL & Hybrid JSON file)
const db = {
    async findInitiate(identifier) {
        if (isPgConnected) {
            const res = await pool.query('SELECT * FROM initiates WHERE handle = $1 OR email = $1;', [identifier]);
            return res.rows[0] || null;
        } else {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            return users.find(u => u.handle.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) || null;
        }
    },

    async createInitiate({ handle, email, password_hash, realm }) {
        if (isPgConnected) {
            const q = `
        INSERT INTO initiates (handle, email, password_hash, realm)
        VALUES ($1, $2, $3, $4)
        RETURNING id, handle, email, realm, xp, clearance;
      `;
            const res = await pool.query(q, [handle, email, password_hash, realm]);
            return res.rows[0];
        } else {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            if (users.some(u => u.handle.toLowerCase() === handle.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
                const err = new Error('Duplicate user');
                err.code = '23505';
                throw err;
            }
            const newUser = {
                id: users.length + 1,
                handle,
                email,
                password_hash,
                realm: realm || '🧠 AI & Cybersecurity',
                xp: 2450,
                clearance: 'GRAND ARCHITECT',
                created_at: new Date().toISOString()
            };
            users.push(newUser);
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
            return newUser;
        }
    }
};

module.exports = db;