const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Use 127.0.0.1 instead of localhost to avoid Windows IPv6 resolution issues
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/computopia_telemetry';

const dataDir = path.join(__dirname, '..', 'data');
const telemetryFile = path.join(dataDir, 'telemetry_mongo.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(telemetryFile)) fs.writeFileSync(telemetryFile, JSON.stringify([], null, 2));

let isMongoConnected = false;

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 })
    .then(() => {
        isMongoConnected = true;
        console.log('✅ MongoDB [telemetry] cluster connected at 127.0.0.1:27017');
    })
    .catch(() => {
        isMongoConnected = false;
        console.log('⚡ MongoDB local service not detected -> Using Hybrid Disk Store (server/data/telemetry_mongo.json)');
    });

const TelemetrySchema = new mongoose.Schema({
    handle: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
});

const MongoModel = mongoose.model('TelemetryLog', TelemetrySchema);

// Unified wrapper: saves to MongoDB if online, or server/data/telemetry_mongo.json if offline
const TelemetryLog = {
    async create(entry) {
        const record = { ...entry, timestamp: new Date().toISOString() };
        if (isMongoConnected) {
            return await MongoModel.create(record);
        } else {
            const logs = JSON.parse(fs.readFileSync(telemetryFile, 'utf8'));
            logs.push(record);
            fs.writeFileSync(telemetryFile, JSON.stringify(logs, null, 2));
            return record;
        }
    }
};

module.exports = { TelemetryLog, isMongoConnected: () => isMongoConnected };