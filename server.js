const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mgnrega_portal';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB successfully.');
    // Start Server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.warn('Backend running without DB just to serve static frontend files.');
    // Start Server anyway to serve static frontend
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT} in frontend-only mode.`);
    });
});
