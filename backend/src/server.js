require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const { setIO } = require('./socket');
const { REDIS_URL, NOTIFICATION_PUBSUB_CHANNEL } = require('./redisConfig');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
setIO(io);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('CRM API is running');
});

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const contactRoutes = require('./routes/contact');
const assignmentRoutes = require('./routes/assignment');
const notificationRoutes = require('./routes/notification');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Socket.io: each logged-in client joins a private room named `user_<id>`.
// Every notification is emitted only to that room, so other users never see it.
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// The Bull worker (src/worker.js) may run as a completely separate Node
// process and therefore has no direct access to this `io` instance. When it
// creates a notification it publishes a small message on this Redis
// channel; we subscribe here and forward it down the correct socket room.
// (If you run api + worker in the same process via `npm run dev`, this is
// what actually delivers the worker's notifications live.)
const subscriber = new Redis(REDIS_URL);
subscriber.subscribe(NOTIFICATION_PUBSUB_CHANNEL, (err) => {
  if (err) console.error('Redis subscribe error:', err.message);
});

subscriber.on('message', (channel, rawMessage) => {
  if (channel !== NOTIFICATION_PUBSUB_CHANNEL) return;
  try {
    const { userId, notification } = JSON.parse(rawMessage);
    io.to(`user_${userId}`).emit('new_notification', notification);
  } catch (err) {
    console.error('Failed to process pub/sub notification message:', err);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
