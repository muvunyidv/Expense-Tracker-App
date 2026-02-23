const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. LOAD DOTENV FIRST
dotenv.config();

// 2. NOW LOAD THE REST
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const expensesRoutes = require('./routes/expenses');
const planRoutes = require('./routes/planRoutes'); 
const todos = require('./routes/todos'); // NEW: Import todo routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/plans', planRoutes); // Existing Requests/Plans logic
app.use('/api/todos', todos);  // NEW: Matches the frontend API.get("/todos")

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// 404 handler - MUST be placed after all defined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;