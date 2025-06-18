import { io } from "socket.io-client";

class TestSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.updateInterval = null;
    this.testData = [
      { playerId: "player_1", name: "Player1", region: "AS", gameMode: "duo", score: 9944 },
      { playerId: "player_2", name: "Player2", region: "NA", gameMode: "solo", score: 8756 },
      { playerId: "player_3", name: "Player3", region: "EU", gameMode: "squad", score: 12345 },
      { playerId: "player_4", name: "Player4", region: "AS", gameMode: "duo", score: 6543 },
      { playerId: "player_5", name: "Player5", region: "NA", gameMode: "solo", score: 7890 }
    ];
    this.currentTestIndex = 0;
  }

  connect() {
    console.log("Attempting to connect to server...");
    
    this.socket = io("http://localhost:3000", {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to server!");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Send initial test events
      this.sendTestEvents();
      
      // Start periodic updates
      this.startPeriodicUpdates();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;
      this.stopPeriodicUpdates();
      
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        setTimeout(() => this.connect(), 1000);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.log("❌ Connection error:", error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log("❌ Max reconnection attempts reached. Stopping...");
        this.stopPeriodicUpdates();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.sendTestEvents();
      this.startPeriodicUpdates();
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
    });

    this.socket.on("reconnect_error", (error) => {
      console.log("❌ Reconnection error:", error.message);
    });

    this.socket.on("reconnect_failed", () => {
      console.log("❌ Reconnection failed after all attempts");
      this.stopPeriodicUpdates();
    });

    // Game events
    this.socket.on("test-handshake", (data) => {
      console.log("📨 Received test-handshake from server:", data);
    });

    this.socket.on("leaderboardUpdate", (data) => {
      console.log("🏆 Leaderboard Update:", data);
    });

    this.socket.on("scoreUpdate", (data) => {
      console.log("📊 Score Update:", data);
    });

    this.socket.on("playerUpdate", (data) => {
      console.log("👤 Player Update:", data);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.log("❌ Socket error:", error);
    });
  }

  sendTestEvents() {
    if (!this.isConnected) return;

    console.log("📤 Sending initial test events...");
    
    // Send test handshake
    this.socket.emit("test-handshake", { 
      msg: "Hello from client!", 
      timestamp: new Date().toISOString() 
    });

    // Subscribe to different regions and game modes
    const subscriptions = [
      { region: "AS", gameMode: "duo" },
      { region: "NA", gameMode: "solo" },
      { region: "EU", gameMode: "squad" }
    ];

    subscriptions.forEach(sub => {
      this.socket.emit("subscribe", sub);
      console.log(`📡 Subscribed to ${sub.region} - ${sub.gameMode}`);
    });
  }

  startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Send score updates every 5 seconds
    this.updateInterval = setInterval(() => {
      if (!this.isConnected) return;

      const testData = this.testData[this.currentTestIndex];
      const scoreDelta = Math.floor(Math.random() * 100) + 1; // Random score increase 1-100
      
      const updateData = {
        ...testData,
        scoreDelta: scoreDelta
      };

      console.log(`📤 Sending score update: ${testData.name} +${scoreDelta} points`);
      this.socket.emit("updateScore", updateData);

      // Move to next test data
      this.currentTestIndex = (this.currentTestIndex + 1) % this.testData.length;
    }, 5000);

    console.log("🔄 Started periodic score updates (every 5 seconds)");
  }

  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("⏹️ Stopped periodic updates");
    }
  }

  disconnect() {
    console.log("🔌 Disconnecting from server...");
    this.stopPeriodicUpdates();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Manual score update method
  sendManualUpdate(playerData) {
    if (!this.isConnected) {
      console.log("❌ Not connected to server");
      return;
    }

    console.log("📤 Sending manual score update:", playerData);
    this.socket.emit("updateScore", playerData);
  }

  // Manual subscription method
  subscribe(region, gameMode) {
    if (!this.isConnected) {
      console.log("❌ Not connected to server");
      return;
    }

    console.log(`📡 Subscribing to ${region} - ${gameMode}`);
    this.socket.emit("subscribe", { region, gameMode });
  }
}

const testClient = new TestSocketClient();

testClient.connect();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  testClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  testClient.disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log('❌ Uncaught Exception:', error);
  testClient.disconnect();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  testClient.disconnect();
  process.exit(1);
});

// Export for potential external use
export default testClient;
