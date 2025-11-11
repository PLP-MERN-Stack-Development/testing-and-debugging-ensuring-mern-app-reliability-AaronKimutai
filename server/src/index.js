const mongoose = require('mongoose');
const app = require('./app'); 

const PORT = process.env.PORT || 5000;


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mernBugTracker';

// --- Database Connection ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    
    // --- Start Server ---
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // exit the process if connection fails.
  });
