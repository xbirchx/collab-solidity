const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session storage (in production, use a database)
const sessions = new Map();

// Helper function to generate session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to generate user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 9);
};

// Routes

// GET /api/sessions/:sessionId - Get session data
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// POST /api/sessions - Create new session
app.post('/api/sessions', (req, res) => {
  const sessionId = generateSessionId();
  const userId = generateUserId();
  
  const session = {
    sessionId,
    adminUserId: userId,
    editors: [userId],
    users: [{
      userId,
      nickname: 'You',
      isAdmin: true,
      canEdit: true,
      isOnline: true
    }],
    createdAt: new Date().toISOString()
  };
  
  sessions.set(sessionId, session);
  
  res.json({
    session,
    currentUserId: userId
  });
});

// POST /api/sessions/:sessionId/join - Join existing session
app.post('/api/sessions/:sessionId/join', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const userId = generateUserId();
  const newUser = {
    userId,
    nickname: `User-${userId.slice(-6)}`,
    isAdmin: false,
    canEdit: false,
    isOnline: true
  };
  
  session.users.push(newUser);
  sessions.set(sessionId, session);
  
  res.json({
    session,
    currentUserId: userId
  });
});

// PUT /api/sessions/:sessionId/users/:userId - Update user data
app.put('/api/sessions/:sessionId/users/:userId', (req, res) => {
  const { sessionId, userId } = req.params;
  const { nickname, isOnline } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const userIndex = session.users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (nickname !== undefined) {
    session.users[userIndex].nickname = nickname;
  }
  if (isOnline !== undefined) {
    session.users[userIndex].isOnline = isOnline;
  }
  
  sessions.set(sessionId, session);
  res.json(session);
});

// PUT /api/sessions/:sessionId/permissions - Update permissions
app.put('/api/sessions/:sessionId/permissions', (req, res) => {
  const { sessionId } = req.params;
  const { action, userId, adminUserId } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Verify admin is making the request
  if (session.adminUserId !== adminUserId) {
    return res.status(403).json({ error: 'Only admin can modify permissions' });
  }
  
  const userIndex = session.users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  switch (action) {
    case 'grant_edit':
      session.editors.push(userId);
      session.users[userIndex].canEdit = true;
      break;
    case 'revoke_edit':
      session.editors = session.editors.filter(id => id !== userId);
      session.users[userIndex].canEdit = false;
      break;
    case 'transfer_admin':
      session.adminUserId = userId;
      session.users.forEach(user => {
        user.isAdmin = user.userId === userId;
      });
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
  
  sessions.set(sessionId, session);
  res.json(session);
});

// DELETE /api/sessions/:sessionId/users/:userId - Remove user from session
app.delete('/api/sessions/:sessionId/users/:userId', (req, res) => {
  const { sessionId, userId } = req.params;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.users = session.users.filter(u => u.userId !== userId);
  session.editors = session.editors.filter(id => id !== userId);
  
  // If admin left and no other users, delete session
  if (session.adminUserId === userId && session.users.length === 0) {
    sessions.delete(sessionId);
    return res.json({ message: 'Session deleted' });
  }
  
  // If admin left, transfer admin to first remaining user
  if (session.adminUserId === userId && session.users.length > 0) {
    session.adminUserId = session.users[0].userId;
    session.users[0].isAdmin = true;
  }
  
  sessions.set(sessionId, session);
  res.json(session);
});

// GET /api/sessions - List all sessions (for debugging)
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.entries()).map(([id, session]) => ({
    sessionId: id,
    userCount: session.users.length,
    adminUserId: session.adminUserId,
    createdAt: session.createdAt
  }));
  
  res.json(sessionList);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 