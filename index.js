const express = require('express');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to read the database
async function readDB() {
  const data = await fs.readFile('db.json', 'utf8');
  return JSON.parse(data);
}

// Helper function to write to the database
async function writeDB(data) {
  await fs.writeFile('db.json', JSON.stringify(data, null, 2));
}

// GET all todos
app.get('/todos', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const db = await readDB();
    const newTodo = {
      id: db.todos.length + 1,
      task,
      status: false
    };
    db.todos.push(newTodo);
    await writeDB(db);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// PUT update status of even ID todos
app.put('/todos/update-even', async (req, res) => {
  try {
    const db = await readDB();
    db.todos = db.todos.map(todo => {
      if (todo.id % 2 === 0 && todo.status === false) {
        return { ...todo, status: true };
      }
      return todo;
    });
    await writeDB(db);
    res.json({ message: 'Updated status of even ID todos' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todos' });
  }
});

// DELETE todos with status true
app.delete('/todos/completed', async (req, res) => {
  try {
    const db = await readDB();
    db.todos = db.todos.filter(todo => !todo.status);
    await writeDB(db);
    res.json({ message: 'Deleted completed todos' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});