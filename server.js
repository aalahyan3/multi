
import next from "next";
import { createServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import { log } from "console";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const chats = []; // [{roomid: "xx", users : ["user1, user2"]}]
const userSockets = new Map();

function findChat(id) {
  return chats.find(c => c.chatId === id);
}

function removeUserFromRoom(username, chatId) {
  const chat = findChat(chatId);
  if (chat) {
    chat.users = chat.users.filter(user => user !== username);
    if (chat.users.length === 0) {
      const roomIndex = chats.findIndex(r => r.chatId === chatId);
      if (roomIndex !== -1) {
        chats.splice(roomIndex, 1);
      }
    }
  }
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketIoServer(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-chat", ({ chatId, username }) => {
      console.log("joining", username, "to chat", chatId);
      
      let chat = findChat(chatId);
      if (!chat) {
        chat = { chatId, users: [] };
        chats.push(chat);
      }

      if (!chat.users.includes(username)) {
        chat.users.push(username);
      }

      socket.join(chatId);

      socket.username = username;
      socket.chatId = chatId

      userSockets.set(username, socket.id);
      console.log(username , "joinded", chatId);
      socket.to(chatId).emit("log", `${username} joined the chat`);
      socket.emit("log", "You have joined this chat");
      
      console.log(`Room ${chatId} now has users:`, chat.users);
    });

    socket.on("message", ({ chatId, username, message }) => {
      let chat = findChat(chatId);
      console.log(chatId, username, message);
      
      if (!chatId || !chat) return;
      
      io.to(chatId).emit("message", { chatId, username, message });
      console.log(`Sent message ${message} from ${username} in room ${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (socket.username && socket.chatId) {
        removeUserFromRoom(socket.username, socket.chatId);
        userSockets.delete(socket.username);
        socket.to(socket.chatId).emit("log", `${socket.username} left the room`);
        console.log(`Removed ${socket.username} from room ${socket.chatId}`);
      }
    });
  });

  httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});