const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Hello Eyego Test' });
});

app.get('/', (req, res) => {  
  res.json({ message: 'Hello Eyego' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});