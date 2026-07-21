const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists for JSON mock database
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Connect to MongoDB
const connectDB = async () => {
    try {
        const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventDB';
        console.log(`Connecting to MongoDB at: ${connUri}...`);
        
        // Short timeout (3 seconds) to fail-fast if MongoDB isn't running
        await mongoose.connect(connUri, {
            serverSelectionTimeoutMS: 3000
        });
        
        isConnected = true;
        console.log('MongoDB Connected successfully! ✅');
    } catch (err) {
        isConnected = false;
        console.warn('\n⚠️  MongoDB is not running or failed to connect.');
        console.warn('🚀 [FALLBACK] Emulated MongoDB (JSON Local Storage) is now activated!');
        console.warn('Your Mongoose Schemas will read/write under the server/data/ folder.\n');
    }
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

// Mongoose Mock Model Proxy Creator
const getModel = (modelName, realModel) => {
    const handler = {
        get(target, prop) {
            // If MongoDB is connected, delegate to the real Mongoose Model hook
            if (isConnected) {
                return Reflect.get(realModel, prop);
            }

            // Fallback mock definitions
            switch (prop) {
                case 'find':
                    return function (query = {}) {
                        return {
                            exec: async () => {
                                const data = readMockFile(modelName);
                                return data.filter(item => {
                                    for (let key in query) {
                                        if (query[key] !== undefined && item[key] !== query[key]) {
                                            return false;
                                        }
                                    }
                                    return true;
                                });
                            },
                            then: function(resolve) {
                                return this.exec().then(resolve);
                            }
                        };
                    };

                case 'findOne':
                    return function (query = {}) {
                        return {
                            exec: async () => {
                                const data = readMockFile(modelName);
                                const match = data.find(item => {
                                    for (let key in query) {
                                        if (query[key] !== undefined && item[key] !== query[key]) {
                                            return false;
                                        }
                                    }
                                    return true;
                                });
                                if (!match) return null;
                                return {
                                    ...match,
                                    save: async function() {
                                        const currentData = readMockFile(modelName);
                                        const index = currentData.findIndex(i => i._id === this._id);
                                        if (index !== -1) {
                                            currentData[index] = { ...this };
                                            delete currentData[index].save;
                                            writeMockFile(modelName, currentData);
                                        }
                                        return this;
                                    }
                                };
                            },
                            then: function(resolve) {
                                return this.exec().then(resolve);
                            }
                        };
                    };

                case 'findById':
                    return function (id) {
                        return {
                            exec: async () => {
                                const data = readMockFile(modelName);
                                const match = data.find(item => String(item._id) === String(id));
                                if (!match) return null;
                                return {
                                    ...match,
                                    save: async function() {
                                        const currentData = readMockFile(modelName);
                                        const index = currentData.findIndex(i => i._id === this._id);
                                        if (index !== -1) {
                                            currentData[index] = { ...this };
                                            delete currentData[index].save;
                                            writeMockFile(modelName, currentData);
                                        }
                                        return this;
                                    }
                                };
                            },
                            then: function(resolve) {
                                return this.exec().then(resolve);
                            }
                        };
                    };

                case 'create':
                    return async function (body) {
                        const data = readMockFile(modelName);
                        // Generate mock ID
                        const mockId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                        
                        const newDoc = {
                            _id: mockId,
                            id: data.length + 1, // for backward compatibility with id increment
                            ...body,
                            createdAt: new Date().toISOString()
                        };

                        data.push(newDoc);
                        writeMockFile(modelName, data);
                        return newDoc;
                    };

                case 'findByIdAndUpdate':
                    return async function (id, updateBody, options = {}) {
                        const data = readMockFile(modelName);
                        const index = data.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
                        if (index === -1) return null;
                        
                        // Handle mongo $set structure or flat body
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
                    // Fallback for props not defined
                    return Reflect.get(realModel, prop);
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
