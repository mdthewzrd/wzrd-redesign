import express from 'express';
const app = express();
app.use(express.json());

const users = new Map();

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }
  const id = String(users.size + 1);
  const user = { id, name, email, createdAt: new Date().toISOString() };
  users.set(id, user);
  res.status(201).json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
