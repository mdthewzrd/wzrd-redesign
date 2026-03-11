import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validationMiddleware } from './middleware/validation.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

const tasks = new Map();
const users = new Map();

app.post('/api/tasks', validationMiddleware, (req, res) => {
  const { title, description, priority = 'medium' } = req.body;
  
  const task = {
    id: uuidv4(),
    title,
    description,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.set(task.id, task);
  res.status(201).json(task);
});

app.get('/api/tasks', (req, res) => {
  const { status, priority } = req.query;
  let result = Array.from(tasks.values());
  
  if (status) result = result.filter(t => t.status === status);
  if (priority) result = result.filter(t => t.priority === priority);
  
  res.json(result);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const allowed = ['title', 'description', 'priority', 'status'];
  const updates = {};
  
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }
  
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  tasks.set(task.id, task);
  
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  if (!tasks.has(req.params.id)) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.delete(req.params.id);
  res.status(204).send();
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));

export default app;
