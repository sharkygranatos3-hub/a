require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const employeeRoutes = require('./routes/employees');
const noteRoutes = require('./routes/notes');
const fileRoutes = require('./routes/files');
const investigationRoutes = require('./routes/investigations');

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/investigations', investigationRoutes);

// MongoDB verbinden
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB verbunden'))
  .catch(err=>console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server läuft auf Port ${PORT}`));
