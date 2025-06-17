import { MongoClient, ServerApiVersion } from 'mongodb';
 import { NODE_ENV as ENVIRONMENT, MONGODB_URI } from './env.config.js';
 
 class MongoDBClient {

    constructor(uri) {
         this.client = new MongoClient(uri, {
             serverApi: {
                 version: ServerApiVersion.v1,
                 deprecationErrors: true,
             },
             maxPoolSize: 50,
             minPoolSize: 5,
             maxIdleTimeMS: 3000,
         });
         this.db = null;
     }
 
     /**
      * Connect to the MongoDB server.
      * @returns {Promise<Db>} The connected database instance.
      * @typedef {import('mongodb').Db} Db
      */
     async connect() {
         try {
             const isConnected = await this.isConnected();
             if (!isConnected) {
                 await this.client.connect();
                 this.db = this.client.db(ENVIRONMENT);
             }
 
             return this.db;
         } catch (error) {
             throw error;
         }
     }
 
     async isConnected() {
         const isConnected = this.client.topology?.isConnected();
         return !!isConnected;
     }
     #collectionMap = new Map();
 
     /**
      * Get a collection from the connected database.
      * @param {string} collectionName - The name of the collection to retrieve.
      * @returns {Promise<Collection>} The MongoDB collection instance.
      * @typedef {import('mongodb').Collection} Collection
      */
 
     async getCollection(collectionName) {
         try {
             if (!this.db || !this.isConnected()) await this.connect();
             const hasCachedCollection = this.#collectionMap.has(collectionName);
             if (hasCachedCollection) {
                 return this.#collectionMap.get(collectionName);
             }
 
             const collection = this.db.collection(collectionName);
             this.#collectionMap.set(collectionName, collection);
             return collection;
         } catch (error) {
             console.log(
                 `Failed to get collection: ${collectionName} ${ENVIRONMENT}`,
                 error,
             );
             throw error;
         }
     }
 
     /**
      * Close the MongoDB connection.
      * @returns {Promise<void>}
      */
     async close() {
         try {
             await this.client.close();
             this.#collectionMap.clear();
             console.log(
                 `MongoDB connection closed ${ENVIRONMENT}`,
             );
         } catch (error) {
             console.log(
                 `Failed to close MongoDB connection: ${ENVIRONMENT}`,
                 error,
             );
             throw error;
         }
     }
 }
 
 const mongoDbClient = new MongoDBClient(MONGODB_URI);
 
 export default mongoDbClient;