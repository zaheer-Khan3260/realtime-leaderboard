import { ObjectId } from 'mongodb';
import Db from '../services/datalayer.services.js';

const regions = ['NA', 'EU', 'AS'];
const gameModes = ['solo', 'duo', 'squad'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName(index) {
  return `Player${index + 1}`;
}

function getRandomScore() {
  return Math.floor(Math.random() * 10000);
}

function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  now.setDate(now.getDate() - daysAgo);
  return now;
}

async function seedPlayers() {
  const db = new Db('players');
  const players = [];

  for (let i = 0; i < 1000; i++) {
    const now = new Date();
    players.push({
      _id: new ObjectId(),
      playerId: `player_${i + 1}`,
      name: getRandomName(i),
      dailyScore: getRandomScore(),
      region: getRandomElement(regions),
      gameMode: getRandomElement(gameModes),
      lastUpdated: getRandomDate(),
      createdAt: now,
    });
  }

  try {
    const result = await db.insertMany(players);
    console.log('Inserted player IDs:', result);
  } catch (err) {
    console.error('Error inserting players:', err);
  }
}

seedPlayers();
