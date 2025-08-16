"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const app = (0, next_1.default)({ dev: false }); // is next an objct or a func
const handler = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, http_1.createServer)((req, res) => {
        handler(req, res);
    });
    const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        console.log("a user have connected to socket", socket);
        socket.on("disconnect", () => {
            console.log("bye", socket);
        });
    });
    httpServer.listen(3000, () => {
        console.log("server is running...");
    });
});
