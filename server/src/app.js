const express = require('express');
const cors = require('cors');
const bugRoutes = require('./routes/bugRoutes');
const postRoutes = require('./routes/postRoutes'); 

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Main application routes
app.use('/api/bugs', bugRoutes);
app.use('/api/posts', postRoutes); 

// --- Root Route for Health Check ---
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});


app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});



app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred on the server",
  });
});

module.exports = app;