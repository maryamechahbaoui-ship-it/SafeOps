const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const planningRoutes = require('./routes/planningRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const pvRoutes = require('./routes/pvRoutes');
const adminRoutes = require('./routes/adminRoutes');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/pv', pvRoutes);
app.use('/api', adminRoutes); // Includes /dashboard, /sites, /users, /equipments, /stocks

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OCP Maintenance Production API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Production MVC server is running on http://127.0.0.1:${PORT}`);
});
