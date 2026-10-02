require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./database');

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from the .env file.');
}

app.use(cors());
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '2h',
    },
  );
}

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required.',
    });
  }

  const token = authorization.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    });
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'Student Service Portal API is running.',
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdAt = new Date().toISOString();

    const result = db
      .prepare(`
        INSERT INTO users
        (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        name.trim(),
        normalizedEmail,
        passwordHash,
        'student',
        createdAt,
      );

    const user = db
      .prepare(`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: 'Account created successfully.',
      user,
    });
  } catch (error) {
    console.error('Register error:', error);

    return res.status(500).json({
      message: 'Unable to create account.',
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const accessToken = createToken(user);

    return res.json({
      message: 'Login successful.',
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Unable to login.',
    });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const user = db
    .prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = ?
    `)
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found.',
    });
  }

  return res.json({
    user,
  });
});

app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/users',
    );

    if (!response.ok) {
      return res.status(502).json({
        message: 'Unable to retrieve student records.',
      });
    }

    const students = await response.json();

    return res.json({
      students,
    });
  } catch (error) {
    console.error('Student API error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve student records.',
    });
  }
});

app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${encodeURIComponent(req.params.id)}`,
    );

    if (response.status === 404) {
      return res.status(404).json({
        message: 'Student not found.',
      });
    }

    if (!response.ok) {
      return res.status(502).json({
        message: 'Unable to retrieve student details.',
      });
    }

    const student = await response.json();

    return res.json({
      student,
    });
  } catch (error) {
    console.error('Student details API error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve student details.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Student Service Portal API running on port ${PORT}`);
});
