import Player from '../model/players.model.js';
import { catchAsync } from '../utils/catchAsync.utils.js';

class PlayerController {
  // Update player score
  updateScore = catchAsync(async (req, res) => {
    const { playerId, name, region, gameMode, scoreDelta } = req.body;

    // Validate required fields
    if (!playerId || !name || !region || !gameMode || scoreDelta === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: playerId, name, region, gameMode, scoreDelta'
      });
    }

    // Validate scoreDelta is a number
    if (typeof scoreDelta !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'scoreDelta must be a number'
      });
    }

    // Validate region
    const validRegions = ['NA', 'EU', 'AS'];
    if (!validRegions.includes(region.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid region. Must be one of: NA, EU, AS'
      });
    }

    // Validate gameMode
    const validGameModes = ['solo', 'duo', 'squad'];
    if (!validGameModes.includes(gameMode.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid gameMode. Must be one of: solo, duo, squad'
      });
    }

    // Find existing player or create new one
    let player = await Player.findOne({ playerId, region, gameMode });

    if (player) {
      // Update existing player
      player.dailyScore += scoreDelta;
      player.name = name;
      player.lastUpdated = new Date();
      await player.save();
    } else {
      // Create new player
      player = new Player({
        playerId,
        name,
        region: region.toUpperCase(),
        gameMode: gameMode.toLowerCase(),
        dailyScore: scoreDelta,
        lastUpdated: new Date(),
        createdAt: new Date()
      });
      await player.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        playerId: player.playerId,
        name: player.name,
        dailyScore: player.dailyScore,
        region: player.region,
        gameMode: player.gameMode,
        lastUpdated: player.lastUpdated
      }
    });
  });

  // Get top players (leaderboard)
  getTopPlayers = catchAsync(async (req, res) => {
    const { region, gameMode, limit = 10 } = req.query;

    // Validate required query parameters
    if (!region || !gameMode) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required query parameters: region, gameMode'
      });
    }

    // Validate region
    const validRegions = ['NA', 'EU', 'AS'];
    if (!validRegions.includes(region.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid region. Must be one of: NA, EU, AS'
      });
    }

    // Validate gameMode
    const validGameModes = ['solo', 'duo', 'squad'];
    if (!validGameModes.includes(gameMode.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid gameMode. Must be one of: solo, duo, squad'
      });
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    // Get top players
    const players = await Player.find({
      region: region.toUpperCase(),
      gameMode: gameMode.toLowerCase()
    })
    .select('playerId name dailyScore lastUpdated')
    .sort({ dailyScore: -1 })
    .limit(limitNum);

    res.status(200).json({
      status: 'success',
      data: players,
      count: players.length
    });
  });

  // Get player by ID
  getPlayerById = catchAsync(async (req, res) => {
    const { playerId } = req.params;
    const { region, gameMode } = req.query;

    if (!region || !gameMode) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required query parameters: region, gameMode'
      });
    }

    const player = await Player.findOne({
      playerId,
      region: region.toUpperCase(),
      gameMode: gameMode.toLowerCase()
    });

    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: 'Player not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: player
    });
  });

  // Get global leaderboard (all regions and game modes)
  getGlobalLeaderboard = catchAsync(async (req, res) => {
    const { limit = 50 } = req.query;

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    const players = await Player.find()
      .select('playerId name dailyScore region gameMode lastUpdated')
      .sort({ dailyScore: -1 })
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      data: players,
      count: players.length
    });
  });

  // Get leaderboard by region only
  getLeaderboardByRegion = catchAsync(async (req, res) => {
    const { region, limit = 20 } = req.params;

    const validRegions = ['NA', 'EU', 'AS'];
    if (!validRegions.includes(region.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid region. Must be one of: NA, EU, AS'
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    const players = await Player.find({ region: region.toUpperCase() })
      .select('playerId name dailyScore gameMode lastUpdated')
      .sort({ dailyScore: -1 })
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      data: players,
      count: players.length
    });
  });

  // Get leaderboard by game mode only
  getLeaderboardByGameMode = catchAsync(async (req, res) => {
    const { gameMode, limit = 20 } = req.params;

    const validGameModes = ['solo', 'duo', 'squad'];
    if (!validGameModes.includes(gameMode.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid gameMode. Must be one of: solo, duo, squad'
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    const players = await Player.find({ gameMode: gameMode.toLowerCase() })
      .select('playerId name dailyScore region lastUpdated')
      .sort({ dailyScore: -1 })
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      data: players,
      count: players.length
    });
  });

  // Get recent updates
  getRecentUpdates = catchAsync(async (req, res) => {
    const { limit = 20 } = req.query;

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    const players = await Player.find()
      .select('playerId name dailyScore region gameMode lastUpdated')
      .sort({ lastUpdated: -1 })
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      data: players,
      count: players.length
    });
  });
}

export default new PlayerController(); 