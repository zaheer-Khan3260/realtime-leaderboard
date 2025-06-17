import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Change port if needed

socket.on("connect", () => {
  console.log("Connected to server!");

  // Send a test event if your server expects one
  socket.emit("test-handshake", { msg: "Hello from client!" });
  socket.emit("subscribe", {region: "AS",gameMode: "duo"})
  socket.emit("updateScore", {playerId: "player_1", name: "Player1", region: "AS", gameMode: "duo", score: 9944})
});

socket.on("test-handshake", (data) => {
  console.log("Received from server:", data);
});

socket.on("leaderboardUpdate", (data) => {
    console.log(data);
})

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
