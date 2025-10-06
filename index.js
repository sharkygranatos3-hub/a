const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Backend läuft!'));
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
const cors = require('cors');
app.use(cors()); // erlaube alle Domains
