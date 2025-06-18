import mongoose from 'mongoose';
 import { MONGODB_URI, NODE_ENV } from './env.config.js';
 
 let cachedConnection = null;
 
 export const connectToDatabase = async () => {
   if (cachedConnection) return cachedConnection;
 
   try {
     const options = {
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
       maxPoolSize: 10,
       minPoolSize: 5,
       dbName: NODE_ENV || 'production',
     };
 
     mongoose.connection.on('connected', () => {
       console.log('MongoDB connected successfully');
     });
     mongoose.connection.on('error', (err) => {
       console.log('MongoDB connection error:', err);
     });
     mongoose.connection.on('disconnected', () => {
       console.log('MongoDB disconnected');
     });
 
     // Optional: avoid buffering model calls until connected
     mongoose.set('bufferCommands', false);
 
     const connection = await mongoose.connect(MONGODB_URI, options);
     cachedConnection = connection;
 
     if (MONGODB_URI.startsWith('mongodb+srv://') && options.dbName) {
       mongoose.connection.client.db(options.dbName);
     }
 
     return connection;
   } catch (error) {
     console.log('MongoDB connection failed:', error);
     throw error;
   }
 };
 
 // Graceful shutdown
 process.on('SIGINT', async () => {
   try {
     await mongoose.connection.close();
     process.exit(0);
   } catch (err) {
     process.exit(1);
   }
 });