import Db from './datalayer.services.js';
import { getTimestamp } from '../helpers/index.js';


class PlayerService {
  constructor() {
    this.players = new Db('players');
  }

  async updateScore(playerId, name, region, gameMode, scoreDelta) {
    
    const result = await this.players.updateOne(
      { playerId, region, gameMode },
      {
        $set: { 
          name,
          lastUpdated: getTimestamp(),
          region,
          gameMode 
        },
        $inc: { dailyScore: scoreDelta },
        $setOnInsert: { createdAt: getTimestamp() }
      },
      { upsert: true }
    );
    
    return result;
  }

  async getTopPlayers(region, gameMode, limit = 10) {
    const results = await this.players.find(
      { region, gameMode },
      {
        projection: { _id: 0, playerId: 1, name: 1, dailyScore: 1 },
        sort: { dailyScore: -1 },
        limit
      }
    );
    return results.data;
  }
}

export default new PlayerService();