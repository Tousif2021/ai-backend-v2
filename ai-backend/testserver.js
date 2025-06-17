const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/helloget', (req, res) => {
  res.json({ msg: 'GET works!' });
});

app.post('/api/hellopost', (req, res) => {
  res.json({ msg: 'POST works!', body: req.body });
});

app.listen(5050, () => {
  console.log('Simple server running on port 5050');
});
