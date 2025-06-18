import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dailyScore: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  region: {
    type: String,
    required: true,
    enum: ['NA', 'EU', 'AS'],
    uppercase: true
  },
  gameMode: {
    type: String,
    required: true,
    enum: ['solo', 'duo', 'squad'],
    lowercase: true
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'players'
});



const Player = mongoose.model('Player', playerSchema);

export default Player;
