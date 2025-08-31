const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// connect to mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/pfa';
mongoose.connect(mongoUrl)
  .then(()=> console.log('Mongo connected'))
  .catch(err=> console.error('Mongo connection error', err));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Routers
const authRouter = require('./routes/auth');
const transactionsRouter = require('./routes/transactions');
const parseRouter = require('./routes/parse');

app.use('/api/auth', authRouter);
app.use('/api/transactions', authMiddleware, transactionsRouter);
app.use('/api/parse-receipt', authMiddleware, parseRouter);

// Serve built frontend (if exists)
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({error: 'API route not found'});
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Server started on port', port));
