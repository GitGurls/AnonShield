const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const identityRoutes = require('./routes/identity.routes');
const vaultRoutes = require('./routes/vault.routes');
const threatRoutes = require('./routes/threat.routes');
const auditRoutes = require('./routes/audit.routes');
const statsRoutes = require('./routes/stats.routes');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://anon-shield-theta.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// ===== GLOBAL MIDDLEWARE =====
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Attach socket.io to requests
app.use((req, res, next) => { req.io = io; next(); });

// ===== API ROUTES =====
app.use('/api/identity', identityRoutes);
app.use('/api/vault',    vaultRoutes);
app.use('/api/threat',   threatRoutes);
app.use('/api/audit',    auditRoutes);
app.use('/api/stats',    statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'operational', version: '1.0.0', timestamp: new Date() });
});

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('subscribe:threats', (identityHash) => {
    socket.join(`threats:${identityHash}`);
  });
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║   AnonShield API Server v1.0.0            ║
║   Port: ${PORT}  |  ENV: ${process.env.NODE_ENV || 'development'}         ║
║   Zero-Trust Security Active ✓            ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
