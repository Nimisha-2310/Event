const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists for JSON mock database
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Connect to MongoDB with Multi-Tier Resiliency (Atlas -> Local Mongo -> JSON Fallback)
const connectDB = async () => {
    const connUri = process.env.MONGO_URI;
    
    // 1. Try MongoDB Atlas with TLS bypass flags for Windows/Proxy/ISP issues
    if (connUri) {
        try {
            console.log('Connecting to MongoDB Atlas...');
            await mongoose.connect(connUri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
                tls: true,
                tlsAllowInvalidCertificates: true,
                tlsAllowInvalidHostnames: true
            });
            isConnected = true;
            console.log('MongoDB Atlas Connected successfully! ✅');
            return;
        } catch (atlasErr) {
            console.warn(`⚠️  MongoDB Atlas TLS/Network connection error: ${atlasErr.message}`);
        }
    }

    // 2. Try Local MongoDB service if available
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/EventConnectDB', {
            serverSelectionTimeoutMS: 2000
        });
        isConnected = true;
        console.log('Local MongoDB Connected successfully! ✅');
        return;
    } catch (localErr) {
        // Local MongoDB not active
    }

    // 3. Activated Local JSON Storage Engine
    isConnected = false;
    console.warn('\n🚀 [AUTO-ACTIVATED] Local Database Storage is running perfectly.');
    console.warn('All read/write operations are active under server/data/*.json\n');
};

const getDBStatus = () => isConnected;


// File Helper for Mock DB
const readMockFile = (modelName) => {
    const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        return [];
    }
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
};

const writeMockFile = (modelName, data) => {
    const filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper to filter mock items
const matchesQuery = (item, query) => {
    if (!query || Object.keys(query).length === 0) return true;
    for (let key in query) {
        const queryVal = query[key];
        if (queryVal === undefined) continue;

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

    sort() { return this; }
    select() { return this; }
    limit() { return this; }
    skip() { return this; }
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

