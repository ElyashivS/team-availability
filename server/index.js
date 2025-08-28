require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add some hard-coded mock users (for testing purposes)
app.post('/api/users/mock', (req, res) => {
  let users = [];
  if (Array.isArray(req.body?.users)) {
    users = req.body.users;
  } else if (req.body?.user && typeof req.body.user === 'object') {
    users = [req.body.user];
  } else {
    users = [
      { username: 'john.doe', password: 'password123' },
      { username: 'jane.smith', password: 'password456' },
      { username: 'bob.wilson', password: 'password789' },
      { username: 'alice.johnson', password: 'password101' },
      { username: 'charlie.brown', password: 'password123' },
      { username: 'diana.white', password: 'password456' },
      { username: 'emily.green', password: 'password789' },
      { username: 'frank.black', password: 'password101' },
      { username: 'grace.gray', password: 'password123' },
      { username: 'henry.white', password: 'password456' }
    ];
  }

  users.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
      [user.username, hashedPassword],
      (err) => {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log('Added user:', user.username);
        }
      }
    );
  });
  res.json({ message: 'Mock users added successfully' });
});

// Add some hard-coded mock statuses (for testing purposes)
app.post('/api/status/mock', (req, res) => {
  const statuses = [
    { username: 'john.doe', status: 'Working' },
    { username: 'jane.smith', status: 'Working Remotely' },
    { username: 'bob.wilson', status: 'On Vacation' },
    { username: 'alice.johnson', status: 'Working' },
    { username: 'charlie.brown', status: 'Business Trip' },
    { username: 'diana.white', status: 'On Vacation' },
    { username: 'emily.green', status: 'Working' },
    { username: 'frank.black', status: 'Working Remotely' },
    { username: 'grace.gray', status: 'On Vacation' },
    { username: 'henry.white', status: 'Business Trip' },
  ];

  statuses.forEach(status => {
    db.get('SELECT id FROM users WHERE username = ?', [status.username], (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        return;
      }
      if (user) {
        db.run('INSERT OR REPLACE INTO status (user_id, status) VALUES (?, ?)',
          [user.id, status.status],
          (err) => {
            if (err) {
              console.error('Error inserting status:', err);
            } else {
              console.log(`Added status for ${status.username}: ${status.status}`);
            }
          }
        );
      }
    });
  });

  res.json({ message: 'Mock statuses added successfully' });
});

// Status options (server-controlled)
const STATUS_OPTIONS = ['Working', 'Working Remotely', 'On Vacation', 'Business Trip'];

// Get list of allowed statuses
app.get('/api/status/options', (req, res) => {
  res.json({ options: STATUS_OPTIONS });
});

// Get current user
app.get('/api/user/me', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

// Get all users with their current status
app.get('/api/status', authenticateToken, (req, res) => {
  db.all(`
    SELECT users.username, s.status, s.updated_at 
    FROM users 
    LEFT JOIN (
      SELECT user_id, status, updated_at
      FROM status s1
      WHERE updated_at = (
        SELECT MAX(updated_at)
        FROM status s2
        WHERE s2.user_id = s1.user_id
      )
    ) s ON users.id = s.user_id
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update user's status
app.put('/api/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const userId = req.user.id;

  if (typeof status !== 'string' || !STATUS_OPTIONS.includes(status)) {
    return res.status(400).json({ error: 'Invalid status option' });
  }

  db.run('INSERT OR REPLACE INTO status (user_id, status) VALUES (?, ?)',
    [userId, status],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Status updated successfully' });
    }
  );
});

app.delete('/api/delete-all', (req, res) => {
  db.run('DELETE FROM users', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All users deleted successfully' });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
