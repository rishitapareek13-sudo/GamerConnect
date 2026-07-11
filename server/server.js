const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Real-time chat logic
io.on('connection', (socket) => {
  socket.on('join-team', (teamId) => {
    socket.join(teamId);
  });

  socket.on('send-message', async ({ teamId, senderId, text }) => {
    try {
      const message = await Message.create({ team: teamId, sender: senderId, text });
      const populated = await message.populate('sender', 'username');
      io.to(teamId).emit('new-message', populated);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));