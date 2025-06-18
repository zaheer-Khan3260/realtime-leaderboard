import { getTimestamp } from '../helpers/index.js';
import Player from '../model/players.model.js';

class PlayerService {
  async updateScore(playerId, name, region, gameMode, scoreDelta) {
    try {
      const result = await Player.findOneAndUpdate(
        { playerId, region, gameMode },
        {
          $set: { 
            name,
            lastUpdated: new Date(),
            region: region.toUpperCase(),
            gameMode: gameMode.toLowerCase()
          },
          $inc: { dailyScore: scoreDelta },
          $setOnInsert: { createdAt: new Date() }
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }

  async getTopPlayers(region, gameMode, limit = 10) {
    try {
      const players = await Player.find(
        { 
          region: region.toUpperCase(), 
          gameMode: gameMode.toLowerCase() 
        }
      )
      .select('playerId name dailyScore lastUpdated')
      .sort({ dailyScore: -1 })
      .limit(limit)
      .lean();
      
      return players;
    } catch (error) {
      console.error('Error getting top players:', error);
      throw error;
    }
  }

  async getPlayerById(playerId, region, gameMode) {
    try {
      const player = await Player.findOne({
        playerId,
        region: region.toUpperCase(),
        gameMode: gameMode.toLowerCase()
      }).lean();
      
      return player;
    } catch (error) {
      console.error('Error getting player by ID:', error);
      throw error;
    }
  }

  async getGlobalLeaderboard(limit = 50) {
    try {
      const players = await Player.find()
        .select('playerId name dailyScore region gameMode lastUpdated')
        .sort({ dailyScore: -1 })
        .limit(limit)
        .lean();
      
      return players;
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      throw error;
    }
  }
}

export default new PlayerService();