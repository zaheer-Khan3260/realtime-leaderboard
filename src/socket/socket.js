import { Server } from 'socket.io';
import PlayerService from '../services/player.service.js';
import http from 'http';
import express from 'express';

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN, "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

const leaderboardCache = new Map(); // { "region:gameMode": topPlayers[] }

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.emit('test-handshake', { 
    message: 'Connected to the server!',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  socket.on('test-handshake', (data) => {
    console.log('📨 Received test-handshake from client:', data);
    socket.emit('test-handshake', { 
      message: 'Handshake received!',
      originalData: data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('subscribe', async ({ region, gameMode }) => {
    try {
      console.log(`📡 Client ${socket.id} subscribing to ${region}:${gameMode}`);
      
      const room = `leaderboard:${region}:${gameMode}`;
      socket.join(room);
      
      // Send cached or fresh leaderboard
      const key = `${region}:${gameMode}`;
      let topPlayers = leaderboardCache.get(key);
      
      if (!topPlayers) {
        console.log(`🔄 Fetching fresh leaderboard for ${region}:${gameMode}`);
        topPlayers = await PlayerService.getTopPlayers(region, gameMode, 10);
        leaderboardCache.set(key, topPlayers);
      }
      
      console.log(`📊 Sending leaderboard to ${socket.id}:`, topPlayers.length, 'players');
      socket.emit('leaderboardUpdate', {
        region,
        gameMode,
        players: topPlayers,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error in subscribe:', error);
      socket.emit('error', { 
        message: 'Failed to subscribe to leaderboard',
        error: error.message 
      });
    }
  });

  // Update player score
  socket.on('updateScore', async ({ 
    playerId, 
    name, 
    region, 
    gameMode, 
    scoreDelta 
  }) => {
    try {
      console.log(`📤 Score update from ${socket.id}:`, { playerId, name, region, gameMode, scoreDelta });
      
      if (!playerId || !name || !region || !gameMode || scoreDelta === undefined) {
        socket.emit('error', { 
          message: 'Missing required fields: playerId, name, region, gameMode, scoreDelta' 
        });
        return;
      }

      if (typeof scoreDelta !== 'number') {
        socket.emit('error', { 
          message: 'scoreDelta must be a number' 
        });
        return;
      }

      const result = await PlayerService.updateScore(
        playerId,
        name,
        region,
        gameMode,
        scoreDelta
      );

      console.log(`✅ Score updated successfully for ${playerId}`);

      socket.emit('scoreUpdate', {
        playerId,
        name,
        region,
        gameMode,
        scoreDelta,
        success: true,
        timestamp: new Date().toISOString()
      });

      const key = `${region}:${gameMode}`;
      const cached = leaderboardCache.get(key) || [];
      const minScore = cached[cached.length - 1]?.dailyScore || 0;

      const topPlayers = await PlayerService.getTopPlayers(region, gameMode, 10);
      leaderboardCache.set(key, topPlayers);
      
      console.log(`Broadcasting leaderboard update for ${region}:${gameMode}`);
      io.to(`leaderboard:${region}:${gameMode}`).emit('leaderboardUpdate', {
        region,
        gameMode,
        players: topPlayers,
        updatedPlayer: { playerId, name, scoreDelta },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating score:', error);
      socket.emit('error', { 
        message: 'Failed to update score',
        error: error.message 
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected:`, reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error from client:', error);
  });
});

setInterval(() => {
  console.log('Cleaning up leaderboard cache...');
  leaderboardCache.clear();
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down socket server...');
  io.close(() => {
    console.log('✅ Socket server closed');
    process.exit(0);
  });
});

export { app, io, server };