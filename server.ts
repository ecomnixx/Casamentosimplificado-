import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const MASTER_EMAIL = 'familiacardoso21@gmail.com';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed
if (!fs.existsSync(USERS_FILE)) {
  const initialUsers = [
    {
      id: 'admin-master',
      name: 'Administrador Master',
      email: MASTER_EMAIL,
      status: 'approved',
      role: 'admin',
      amountPaid: 9.99,
      paymentMethod: 'pix',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
}

function readUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

// Middleware
app.use(express.json());

// Server-Sent Events (SSE) for 100% Real-Time communication between devices
interface SseClient {
  id: string;
  res: Response;
}

let sseClients: SseClient[] = [];

function broadcastSse(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (err) {
      console.error('Error writing SSE to client:', err);
    }
  });
}

// Keep-alive ping every 15 seconds to keep SSE connections open through Cloud Run / Nginx
setInterval(() => {
  const ping = `: ping\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(ping);
    } catch (err) {
      // client likely disconnected
    }
  });
}, 15000);

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Real-time SSE stream
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Initial event
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// API: Get all users
app.get('/api/users', (req: Request, res: Response) => {
  const users = readUsers();
  res.json(users);
});

// API: Check single user status by email
app.get('/api/users/status', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const users = readUsers();
  const user = users.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    return res.json({ exists: false, status: null, user: null });
  }

  return res.json({ exists: true, status: user.status, user });
});

// API: Register or submit access request (called when bride generates Pix or registers)
app.post('/api/users/register', (req: Request, res: Response) => {
  const { name, email, password, phone, role, status, amountPaid, paymentMethod } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  const isMaster = cleanEmail === MASTER_EMAIL;
  const users = readUsers();
  const existingIndex = users.findIndex((u) => u.email?.toLowerCase() === cleanEmail);

  const newUser = {
    id: existingIndex >= 0 ? users[existingIndex].id : `user_${Date.now()}`,
    name: (name || (isMaster ? 'Administrador Master' : 'Noiva')).trim(),
    email: cleanEmail,
    password: password || '123456',
    phone: phone || '',
    role: isMaster ? 'admin' : role || 'user',
    status: isMaster ? 'approved' : status || 'pending',
    amountPaid: amountPaid !== undefined ? amountPaid : 9.99,
    paymentMethod: paymentMethod || 'pix',
    createdAt: existingIndex >= 0 && users[existingIndex].createdAt ? users[existingIndex].createdAt : new Date().toISOString(),
    paidAt: isMaster ? new Date().toISOString() : existingIndex >= 0 ? users[existingIndex].paidAt : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...newUser };
  } else {
    users.push(newUser);
  }

  writeUsers(users);

  // Broadcast to all connected clients in real time!
  broadcastSse({
    type: 'new_request',
    user: newUser,
  });

  return res.json({ success: true, user: newUser });
});

// API: Approve user (called by Master)
app.post('/api/users/approve', (req: Request, res: Response) => {
  const { id, email } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  const users = readUsers();
  let updatedUser: any = null;

  const newUsers = users.map((u) => {
    if ((id && u.id === id) || (cleanEmail && u.email?.toLowerCase() === cleanEmail)) {
      updatedUser = {
        ...u,
        status: 'approved',
        paidAt: u.paidAt || new Date().toISOString(),
      };
      return updatedUser;
    }
    return u;
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  writeUsers(newUsers);

  // Broadcast approval in real-time! The bride's screen unlocks immediately!
  broadcastSse({
    type: 'user_approved',
    user: updatedUser,
  });

  return res.json({ success: true, user: updatedUser });
});

// API: Reject / Suspend user (called by Master)
app.post('/api/users/reject', (req: Request, res: Response) => {
  const { id, email } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  const users = readUsers();
  let updatedUser: any = null;

  const newUsers = users.map((u) => {
    if ((id && u.id === id) || (cleanEmail && u.email?.toLowerCase() === cleanEmail)) {
      updatedUser = {
        ...u,
        status: 'rejected',
      };
      return updatedUser;
    }
    return u;
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  writeUsers(newUsers);

  broadcastSse({
    type: 'user_rejected',
    user: updatedUser,
  });

  return res.json({ success: true, user: updatedUser });
});

// API: Delete user (called by Master)
app.post('/api/users/delete', (req: Request, res: Response) => {
  const { id, email } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  if (cleanEmail === MASTER_EMAIL) {
    return res.status(403).json({ error: 'Não é permitido excluir a conta Master' });
  }

  let users = readUsers();
  users = users.filter((u) => {
    if (id && u.id === id) return false;
    if (cleanEmail && u.email?.toLowerCase() === cleanEmail) return false;
    return true;
  });

  writeUsers(users);

  broadcastSse({
    type: 'user_deleted',
    id,
    email: cleanEmail,
  });

  return res.json({ success: true });
});

async function start() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

start();
