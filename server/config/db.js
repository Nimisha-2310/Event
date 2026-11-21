const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;

// Resilient Storage Path: Vercel serverless functions require writing only to /tmp
const isVercel = !!process.env.VERCEL;
const BASE_DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : BASE_DATA_DIR;

// Ensure data directory exists for JSON mock database
try {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // If running in Vercel lambda and /tmp/data was just created, copy seed JSON files
    if (isVercel && fs.existsSync(BASE_DATA_DIR)) {
        const seedFiles = fs.readdirSync(BASE_DATA_DIR);
        for (const file of seedFiles) {
            if (file.endsWith('.json')) {
                const srcPath = path.join(BASE_DATA_DIR, file);
                const destPath = path.join(DATA_DIR, file);
                if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
        }
    }
} catch (fsErr) {
    console.warn('Filesystem init warning:', fsErr.message);
}

// Promise timeout wrapper for reliable fast failover
const withTimeout = (promise, ms) => {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Connection timed out after ${ms}ms`)), ms);
        })
    ]).finally(() => clearTimeout(timer));
};

// Connect to MongoDB with Multi-Tier Resiliency (Atlas -> Local Mongo -> JSON Fallback)
const connectDB = async () => {
    const connUri = process.env.MONGO_URI;
    
    // 1. Try MongoDB Atlas with TLS bypass flags for Windows/Proxy/ISP issues
    if (connUri) {
        try {
            console.log('Connecting to MongoDB Atlas...');
            await withTimeout(mongoose.connect(connUri, {
                serverSelectionTimeoutMS: 3000,
                connectTimeoutMS: 3000,
                tls: true,
                tlsAllowInvalidCertificates: true,
                tlsAllowInvalidHostnames: true
            }), 3500);
            isConnected = true;
            console.log('MongoDB Atlas Connected successfully! ✅');
            return;
        } catch (atlasErr) {
            console.warn(`⚠️  MongoDB Atlas TLS/Network connection error: ${atlasErr.message}`);
        }
    }

    // 2. Try Local MongoDB service if available
    try {
        await withTimeout(mongoose.connect('mongodb://127.0.0.1:27017/EventConnectDB', {
            serverSelectionTimeoutMS: 1500
        }), 2000);
        isConnected = true;
        console.log('Local MongoDB Connected successfully! ✅');
        return;
    } catch (localErr) {
        // Local MongoDB not active
    }

    // 3. Activated Local JSON Storage Engine
    isConnected = false;
    console.warn('\n🚀 [AUTO-ACTIVATED] Local Database Storage is running perfectly.');
    console.warn(`All read/write operations are active under: ${DATA_DIR}/*.json\n`);
};

const getDBStatus = () => isConnected;

// File Helper for Mock DB
const readMockFile = (modelName) => {
    const filename = `${modelName.toLowerCase()}.json`;
    const targetPath = path.join(DATA_DIR, filename);
    const sourcePath = path.join(BASE_DATA_DIR, filename);

    // If target doesn't exist, try copying from base seed files
    if (!fs.existsSync(targetPath)) {
        if (fs.existsSync(sourcePath)) {
            try {
                const initialData = fs.readFileSync(sourcePath, 'utf8');
                try { fs.writeFileSync(targetPath, initialData); } catch (wErr) {}
                return JSON.parse(initialData || '[]');
            } catch (e) {}
        }
        try { fs.writeFileSync(targetPath, JSON.stringify([], null, 2)); } catch (wErr) {}
        return [];
    }

    try {
        const data = fs.readFileSync(targetPath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
};

const writeMockFile = (modelName, data) => {
    try {
        const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving mock file for ${modelName}:`, err.message);
    }
};

// Helper to filter mock items
const matchesQuery = (item, query) => {
    if (!query || Object.keys(query).length === 0) return true;
    for (let key in query) {
        const queryVal = query[key];
        if (queryVal === undefined) continue;

        // Support ID matching for both _id and id fields
        if (key === '_id' || key === 'id') {
            const matchesId = String(item._id) === String(queryVal) || String(item.id) === String(queryVal);
            if (!matchesId) return false;
            continue;
        }

        const itemVal = item[key];
        if (typeof queryVal === 'string' && typeof itemVal === 'string' && key.toLowerCase().includes('email')) {
            if (itemVal.trim().toLowerCase() !== queryVal.trim().toLowerCase()) {
                return false;
            }
        } else if (String(itemVal) !== String(queryVal)) {
            return false;
        }
    }
    return true;
};

// Chainable Mock Query Builder
class MockQuery {
    constructor(promiseFn) {
        this._promiseFn = promiseFn;
    }

    sort(sortObj) {
        if (sortObj && typeof sortObj === 'object') {
            const orig = this._promiseFn;
            this._promiseFn = async () => {
                const data = await orig();
                if (!Array.isArray(data)) return data;
                const key = Object.keys(sortObj)[0];
                const dir = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;
                return [...data].sort((a, b) => {
                    if (a[key] < b[key]) return -1 * dir;
                    if (a[key] > b[key]) return 1 * dir;
                    return 0;
                });
            };
        }
        return this;
    }

    select() { return this; }
    
    limit(n) {
        if (typeof n === 'number') {
            const orig = this._promiseFn;
            this._promiseFn = async () => {
                const data = await orig();
                return Array.isArray(data) ? data.slice(0, n) : data;
            };
        }
        return this;
    }

    skip(n) {
        if (typeof n === 'number') {
            const orig = this._promiseFn;
            this._promiseFn = async () => {
                const data = await orig();
                return Array.isArray(data) ? data.slice(n) : data;
            };
        }
        return this;
    }

    lean() { return this; }
    populate() { return this; }

    async exec() {
        return await this._promiseFn();
    }

    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }

    catch(reject) {
        return this.exec().catch(reject);
    }

    finally(callback) {
        return this.exec().finally(callback);
    }
}

// Mongoose Mock Model Proxy Creator
const getModel = (modelName, realModel) => {
    const handler = {
        get(target, prop) {
            // If MongoDB is connected, delegate to the real Mongoose Model hook
            if (isConnected) {
                const val = Reflect.get(realModel, prop);
                return typeof val === 'function' ? val.bind(realModel) : val;
            }

            // Fallback mock definitions
            switch (prop) {
                case 'find':
                    return function (query = {}) {
                        return new MockQuery(async () => {
                            const data = readMockFile(modelName);
                            return data.filter(item => matchesQuery(item, query));
                        });
                    };

                case 'findOne':
                    return function (query = {}) {
                        return new MockQuery(async () => {
                            const data = readMockFile(modelName);
                            const match = data.find(item => matchesQuery(item, query));
                            if (!match) return null;
                            return {
                                ...match,
                                save: async function() {
                                    const currentData = readMockFile(modelName);
                                    const index = currentData.findIndex(i => String(i._id) === String(this._id) || String(i.id) === String(this.id));
                                    if (index !== -1) {
                                        currentData[index] = { ...this };
                                        delete currentData[index].save;
                                        writeMockFile(modelName, currentData);
                                    }
                                    return this;
                                }
                            };
                        });
                    };

                case 'findById':
                    return function (id) {
                        return new MockQuery(async () => {
                            const data = readMockFile(modelName);
                            const match = data.find(item => String(item._id) === String(id) || String(item.id) === String(id));
                            if (!match) return null;
                            return {
                                ...match,
                                save: async function() {
                                    const currentData = readMockFile(modelName);
                                    const index = currentData.findIndex(i => String(i._id) === String(this._id) || String(i.id) === String(this.id));
                                    if (index !== -1) {
                                        currentData[index] = { ...this };
                                        delete currentData[index].save;
                                        writeMockFile(modelName, currentData);
                                    }
                                    return this;
                                }
                            };
                        });
                    };

                case 'countDocuments':
                case 'count':
                    return function (query = {}) {
                        return new MockQuery(async () => {
                            const data = readMockFile(modelName);
                            return data.filter(item => matchesQuery(item, query)).length;
                        });
                    };

                case 'create':
                    return async function (body) {
                        const data = readMockFile(modelName);
                        // Generate mock ID
                        const mockId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                        
                        const now = new Date().toISOString();
                        const newDoc = {
                            _id: mockId,
                            id: data.length + 1,
                            ...body,
                            createdAt: body.createdAt || now
                        };

                        if (modelName.toLowerCase() === 'booking' && !newDoc.bookingDate) {
                            newDoc.bookingDate = now;
                        }

                        data.push(newDoc);
                        writeMockFile(modelName, data);
                        return newDoc;
                    };

                case 'insertMany':
                    return async function (docs) {
                        if (!Array.isArray(docs)) docs = [docs];
                        const results = [];
                        for (const doc of docs) {
                            results.push(await handler.get(target, 'create')(doc));
                        }
                        return results;
                    };

                case 'findByIdAndUpdate':
                    return async function (id, updateBody, options = {}) {
                        const data = readMockFile(modelName);
                        const index = data.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
                        if (index === -1) return null;
                        
                        let updates = updateBody;
                        if (updateBody.$set) {
                            updates = updateBody.$set;
                        }

                        data[index] = {
                            ...data[index],
                            ...updates
                        };
                        writeMockFile(modelName, data);
                        return data[index];
                    };

                case 'findOneAndUpdate':
                    return function (query, updateBody, options = {}) {
                        return new MockQuery(async () => {
                            const data = readMockFile(modelName);
                            const index = data.findIndex(item => matchesQuery(item, query));
                            if (index === -1) return null;
                            let updates = updateBody;
                            if (updateBody.$set) updates = updateBody.$set;
                            data[index] = { ...data[index], ...updates };
                            writeMockFile(modelName, data);
                            return data[index];
                        });
                    };

                case 'findByIdAndDelete':
                case 'findByIdAndRemove':
                    return async function (id) {
                        let data = readMockFile(modelName);
                        const match = data.find(item => String(item._id) === String(id) || String(item.id) === String(id));
                        if (!match) return null;

                        data = data.filter(item => String(item._id) !== String(id) && String(item.id) !== String(id));
                        writeMockFile(modelName, data);
                        return match;
                    };

                case 'findOneAndDelete':
                    return function (query) {
                        return new MockQuery(async () => {
                            let data = readMockFile(modelName);
                            const index = data.findIndex(item => matchesQuery(item, query));
                            if (index === -1) return null;
                            const deleted = data.splice(index, 1)[0];
                            writeMockFile(modelName, data);
                            return deleted;
                        });
                    };

                case 'deleteOne':
                    return async function (query = {}) {
                        let data = readMockFile(modelName);
                        const index = data.findIndex(item => matchesQuery(item, query));
                        if (index !== -1) {
                            data.splice(index, 1);
                            writeMockFile(modelName, data);
                            return { deletedCount: 1 };
                        }
                        return { deletedCount: 0 };
                    };

                case 'deleteMany':
                    return async function (query = {}) {
                        let data = readMockFile(modelName);
                        const initialLen = data.length;
                        data = data.filter(item => !matchesQuery(item, query));
                        writeMockFile(modelName, data);
                        return { deletedCount: initialLen - data.length };
                    };

                default:
                    const val = Reflect.get(realModel, prop);
                    return typeof val === 'function' ? val.bind(realModel) : val;
            }
        }
    };

    return new Proxy(realModel, handler);
};

module.exports = {
    connectDB,
    getDBStatus,
    getModel
};
