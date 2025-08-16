
import next from "next";
import { createServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import { log } from "console";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = []; // [{roomid: "xx", users : ["user1, user2"]}]
const userSockets = new Map();

function findRoom(roomId) {
  return rooms.find(room => room.room_id === roomId);
}

function removeUserFromRoom(username, roomId) {
  const room = findRoom(roomId);
  if (room) {
    room.users = room.users.filter(user => user !== username);
    if (room.users.length === 0) {
      const roomIndex = rooms.findIndex(r => r.room_id === roomId);
      if (roomIndex !== -1) {
        rooms.splice(roomIndex, 1);
      }
    }
  }
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketIoServer(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ room_id, username }) => {
      console.log("joining", username, "to room", room_id);
      
      let room = findRoom(room_id);
      if (!room) {
        room = { room_id, users: [] };
        rooms.push(room);
      }

      if (!room.users.includes(username)) {
        room.users.push(username);
      }

      socket.join(room_id);

      socket.username = username;
      socket.room_id = room_id;

      userSockets.set(username, socket.id);

      socket.to(room_id).emit("log", `${username} joined the room`);
      socket.emit("log", "You have joined this room");
      
      console.log(`Room ${room_id} now has users:`, room.users);
    });

    socket.on("message", ({ room_id, username, message }) => {
      let room = findRoom(room_id);
      if (!room_id || !room) return;
      socket.to(room_id).emit("message", { username, message });
      socket.emit("message", { username, message });
      console.log(`Sent message ${message} from ${username} in room ${room_id}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (socket.username && socket.room_id) {
        removeUserFromRoom(socket.username, socket.room_id);
        userSockets.delete(socket.username);
        socket.to(socket.room_id).emit("log", `${socket.username} left the room`);
        console.log(`Removed ${socket.username} from room ${socket.room_id}`);
      }
    });
  });

  httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});