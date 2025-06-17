import { Server } from 'socket.io';
import PlayerService from '../services/player.service.js';
import http from 'http';
import express from 'express';

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
      origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
      methods: ["GET", "POST"]
  }
})

const leaderboardCache = new Map(); // { "region:gameMode": topPlayers[] }

io.on('connection', (socket) => {
  
  // Test emit for handshake
  socket.emit('test-handshake', { message: 'Connected to the server!' });

  socket.on('test-handshake', (data) => {
    console.log(data);
  })

  // Subscribe to leaderboard updates
  socket.on('subscribe', async ({ region, gameMode }) => {
    const room = `leaderboard:${region}:${gameMode}`;
    socket.join(room);
    
    // Send cached or fresh leaderboard
    const key = `${region}:${gameMode}`;
    let topPlayers = leaderboardCache.get(key);
    
    if (!topPlayers) {
      topPlayers = await PlayerService.getTopPlayers(region, gameMode, 10);
      leaderboardCache.set(key, topPlayers);
    }
    
    socket.emit('leaderboardUpdate', topPlayers);
  });

  // Update player score
  socket.on('updateScore', async ({ 
    playerId, 
    name, 
    region, 
    gameMode, 
    score 
  }) => {
    const updatedPlayer = await PlayerService.updateScore(
      playerId,
      name,
      region,
      gameMode,
      score
    );

    // Check if affects current leaderboard
    const key = `${region}:${gameMode}`;
    const cached = leaderboardCache.get(key) || [];
    const minScore = cached[cached.length - 1]?.dailyScore || 0;

    if (updatedPlayer.dailyScore >= minScore || cached.length < 10) {
      const topPlayers = await PlayerService.getTopPlayers(region, gameMode, 10);
      leaderboardCache.set(key, topPlayers);
      io.to(`leaderboard:${region}:${gameMode}`).emit('leaderboardUpdate', topPlayers);
    }
  });
});

export { app, io, server };