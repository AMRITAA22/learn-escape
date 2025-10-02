const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

app.use(cors());
app.use(express.json());

const roomUsers = {}; // Stores { roomId: [ {id, name}, ... ] }

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-room', (data) => {
        if (!data || !data.roomId || !data.user) return;
        const { roomId, user } = data;
        
        socket.join(roomId);

        if (!roomUsers[roomId]) {
            roomUsers[roomId] = [];
        }
        
        // Give the new user the list of existing users to call
        const usersInThisRoom = roomUsers[roomId];
        socket.emit("all-users", usersInThisRoom);

        // Add the new user to the list
        roomUsers[roomId].push({ id: socket.id, name: user.name });

        // Update the UI list for everyone
        io.in(roomId).emit('update-user-list', roomUsers[roomId]);
    });
    
    // An initiator sends an "offer" to a target user
    socket.on("sending-signal", payload => {
        io.to(payload.userToSignal).emit('offer-signal', { signal: payload.signal, callerID: payload.callerID });
    });

    // A target user sends an "answer" back to the initiator
    socket.on("returning-signal", payload => {
        io.to(payload.callerID).emit('answer-signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        let roomId_left = null;
        for (const roomId in roomUsers) {
            const userIndex = roomUsers[roomId].findIndex(u => u.id === socket.id);
            if (userIndex !== -1) {
                roomUsers[roomId].splice(userIndex, 1);
                roomId_left = roomId;
                break;
            }
        }
        if (roomId_left) {
            io.in(roomId_left).emit("user-left", { id: socket.id });
            io.in(roomId_left).emit('update-user-list', roomUsers[roomId_left]);
        }
    });

    // Chat functionality
    socket.on('send-message', ({ roomId, message, user }) => {
        io.in(roomId).emit('receive-message', { message, user });
    });
});

// --- API Routes, Server Start, and connectDB function ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/studyRooms'));
app.get('/', (req, res) => res.send('Learn Escape API is alive!'));
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