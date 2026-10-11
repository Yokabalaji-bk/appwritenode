import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const DEFAULT_URI = 'mongodb+srv://new-user01:591MPNTDNNGnkeoD@cluster0.dm3sn0b.mongodb.net/appwrite_users?retryWrites=true&w=majority';
let isConnecting = false;
/**
 * Connect to MongoDB with connection reuse for serverless/Appwrite Functions
 */
export const connectDB = async (customUri) => {
    const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;
    // 1: connected
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (isConnecting) {
        while (isConnecting && mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return mongoose.connection;
    }
    try {
        isConnecting = true;
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            autoIndex: true,
        });
        isConnecting = false;
        console.log(`[MongoDB] Connected to host: ${conn.connection.host}, database: ${conn.connection.name}`);
        return conn.connection;
    }
    catch (error) {
        isConnecting = false;
        console.error(`[MongoDB] Connection error:`, error?.message || error);
        throw error;
    }
};
export const disconnectDB = async () => {
    // 0: disconnected
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('[MongoDB] Disconnected from database.');
    }
};
//# sourceMappingURL=db.js.map