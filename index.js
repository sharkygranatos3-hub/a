const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(cors());          // CORS erlauben
app.use(express.json());   // JSON verarbeiten

const PORT = process.env.PORT || 10000;

// Test-Endpunkt
app.get('/', (req, res) => res.send('Backend läuft!'));

// Login-Route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if(username === 'admin' && password === '12345'){
    res.json({ token: 'dummy-token-admin' });
  } else {
    res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }
});

// Akten erstellen
app.post('/api/cases', (req, res) => {
  res.json({ id: Math.floor(Math.random()*1000) });
});

// Akten abrufen
app.get('/api/cases/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Testakte', content: 'Dies ist eine Dummy-Akte.' });
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
