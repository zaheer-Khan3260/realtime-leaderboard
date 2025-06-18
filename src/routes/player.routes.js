import express from 'express';
import playerController from '../controllers/player.controller.js';

const router = express.Router();

// POST /api/players/score - Update player score
router.post('/score', playerController.updateScore);

// GET /api/players/leaderboard - Get top players for specific region and game mode
router.get('/leaderboard', playerController.getTopPlayers);

// GET /api/players/global - Get global leaderboard (all regions and game modes)
router.get('/global', playerController.getGlobalLeaderboard);

// GET /api/players/recent - Get recently updated players
router.get('/recent', playerController.getRecentUpdates);

// GET /api/players/:playerId - Get specific player by ID
router.get('/:playerId', playerController.getPlayerById);

// GET /api/players/region/:region - Get leaderboard by region only
router.get('/region/:region', playerController.getLeaderboardByRegion);

// GET /api/players/gamemode/:gameMode - Get leaderboard by game mode only
router.get('/gamemode/:gameMode', playerController.getLeaderboardByGameMode);

export default router; 