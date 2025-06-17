import mongoDbClient from '../config/mongodb.config.js';

async function createIndexes() {
  const collection = await mongoDbClient.getCollection('players');
  // Compound index for leaderboard queries
  await collection.createIndex({ region: 1, gameMode: 1, dailyScore: -1 });
  // TTL index for automatic daily resets
  await collection.createIndex({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });
  console.log('Indexes created!');
  process.exit(0);
}

createIndexes().catch(err => {
  console.error(err);
  process.exit(1);
});
