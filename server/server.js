const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

const roomUsers = {}; // Stores { roomId: [ {id (peerId), name, socketId}, ... ] }

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        if (!data || !data.roomId || !data.peerId || !data.user) return;
        const { roomId, peerId, user } = data;

        socket.join(roomId);
        
        if (!roomUsers[roomId]) {
            roomUsers[roomId] = [];
        }

        const otherUsersInRoom = roomUsers[roomId];
        socket.emit("all-users", otherUsersInRoom);

        roomUsers[roomId].push({ id: peerId, name: user.name, socketId: socket.id });

        socket.to(roomId).emit("user-joined", { peerId, user });
        
        io.in(roomId).emit('update-user-list', roomUsers[roomId]);
    });
    
    socket.on('send-message', ({ roomId, message, user }) => {
        socket.to(roomId).emit('receive-message', { message, user });
    });

    socket.on('disconnect', () => {
        let roomId_left = null;
        let peerId_left = null;
        for (const roomId in roomUsers) {
            const userIndex = roomUsers[roomId].findIndex(u => u.socketId === socket.id);
            if (userIndex !== -1) {
                peerId_left = roomUsers[roomId][userIndex].id;
                roomUsers[roomId].splice(userIndex, 1);
                roomId_left = roomId;
                break;
            }
        }
        if (roomId_left) {
            io.in(roomId_left).emit("user-left", { peerId: peerId_left });
            io.in(roomId_left).emit('update-user-list', roomUsers[roomId_left]);
        }
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/studyRooms'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}