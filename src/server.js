const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.json({ message: 'Hello Eyego' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});