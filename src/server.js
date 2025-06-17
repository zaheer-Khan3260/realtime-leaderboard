import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./socket/socket.js";

dotenv.config({
    path: './env'
});

console.log("Cors origin env", process.env.CORS_ORIGIN);

const corsOptions = {
    origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json( {limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.send('Hello from Real Time Leaderboard System');
});

// server.use('/', indexRouter);

export default server;

