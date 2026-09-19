import { UserAccount } from '../types';

const API_BASE = '';

/**
 * Fetch all users from server and synchronize with local storage
 */
export async function fetchServerUsers(): Promise<UserAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: UserAccount[] = await res.json();
    if (Array.isArray(data)) {
      localStorage.setItem('casamento_users', JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated'));
      return data;
    }
    return [];
  } catch (err) {
    console.error('Error fetching users from server, falling back to local storage:', err);
    const local = localStorage.getItem('casamento_users');
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Register a user or request access on the server
 */
export async function registerUserOnServer(user: Partial<UserAccount>): Promise<UserAccount | null> {
  try {
    const res = await fetch(`${API_BASE}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.user) {
      // Sync local storage
      const local = localStorage.getItem('casamento_users');
      const list: UserAccount[] = local ? JSON.parse(local) : [];
      const idx = list.findIndex((u) => u.email.toLowerCase() === data.user.email.toLowerCase());
      if (idx >= 0) {
        list[idx] = data.user;
      } else {
        list.push(data.user);
      }
      localStorage.setItem('casamento_users', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated'));
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('Error registering user on server:', err);
    return null;
  }
}

/**
 * Approve a user on the server (called by Master)
 */
export async function approveUserOnServer(id: string, email?: string): Promise<UserAccount | null> {
  try {
    const res = await fetch(`${API_BASE}/api/users/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, email }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.user) {
      // Sync local storage
      const local = localStorage.getItem('casamento_users');
      const list: UserAccount[] = local ? JSON.parse(local) : [];
      const updated = list.map((u) => (u.id === id || (email && u.email === email) ? data.user : u));
      localStorage.setItem('casamento_users', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated'));
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('Error approving user on server:', err);
    return null;
  }
}

/**
 * Reject or suspend a user on the server
 */
export async function rejectUserOnServer(id: string, email?: string): Promise<UserAccount | null> {
  try {
    const res = await fetch(`${API_BASE}/api/users/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, email }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.user) {
      const local = localStorage.getItem('casamento_users');
      const list: UserAccount[] = local ? JSON.parse(local) : [];
      const updated = list.map((u) => (u.id === id || (email && u.email === email) ? data.user : u));
      localStorage.setItem('casamento_users', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated'));
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('Error rejecting user on server:', err);
    return null;
  }
}

/**
 * Delete a user on the server
 */
export async function deleteUserOnServer(id: string, email?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/users/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, email }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const local = localStorage.getItem('casamento_users');
    if (local) {
      const list: UserAccount[] = JSON.parse(local);
      const filtered = list.filter((u) => u.id !== id && (!email || u.email.toLowerCase() !== email.toLowerCase()));
      localStorage.setItem('casamento_users', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated'));
    }
    return true;
  } catch (err) {
    console.error('Error deleting user on server:', err);
    return false;
  }
}

/**
 * Check user approval status by email from server
 */
export async function checkUserStatusOnServer(email: string): Promise<{
  exists: boolean;
  status: 'approved' | 'pending' | 'rejected' | null;
  user: UserAccount | null;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/users/status?email=${encodeURIComponent(email)}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error checking user status on server:', err);
    // fallback to local storage
    const local = localStorage.getItem('casamento_users');
    if (local) {
      const list: UserAccount[] = JSON.parse(local);
      const found = list.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        return { exists: true, status: found.status, user: found };
      }
    }
    return { exists: false, status: null, user: null };
  }
}

/**
 * Connect to real-time Server-Sent Events (SSE) stream for instant real-time sync across devices
 */
export function subscribeToRealtimeServer(
  onEvent: (event: { type: string; user?: UserAccount; id?: string; email?: string }) => void
): () => void {
  if (typeof window === 'undefined' || !window.EventSource) {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let retryTimeout: any = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;

    try {
      eventSource = new EventSource(`${API_BASE}/api/realtime/stream`);

      eventSource.onopen = () => {
        // Connected to server stream
      };

      eventSource.onmessage = (e) => {
        try {
          if (!e.data) return;
          const data = JSON.parse(e.data);

          // If a new user registered or was updated on server, refresh local store
          if (data.type === 'new_request' && data.user) {
            const local = localStorage.getItem('casamento_users');
            const list: UserAccount[] = local ? JSON.parse(local) : [];
            const idx = list.findIndex((u) => u.email?.toLowerCase() === data.user.email?.toLowerCase());
            if (idx >= 0) {
              list[idx] = data.user;
            } else {
              list.push(data.user);
            }
            localStorage.setItem('casamento_users', JSON.stringify(list));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('casamento_users_updated', { detail: data }));
          } else if (data.type === 'user_approved' && data.user) {
            const local = localStorage.getItem('casamento_users');
            const list: UserAccount[] = local ? JSON.parse(local) : [];
            const updated = list.map((u) =>
              u.id === data.user.id || u.email?.toLowerCase() === data.user.email?.toLowerCase() ? data.user : u
            );
            localStorage.setItem('casamento_users', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('casamento_users_updated', { detail: data }));
          } else if (data.type === 'user_deleted') {
            const local = localStorage.getItem('casamento_users');
            if (local) {
              const list: UserAccount[] = JSON.parse(local);
              const filtered = list.filter(
                (u) => u.id !== data.id && (!data.email || u.email?.toLowerCase() !== data.email?.toLowerCase())
              );
              localStorage.setItem('casamento_users', JSON.stringify(filtered));
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('casamento_users_updated', { detail: data }));
            }
          }

          onEvent(data);
        } catch (err) {
          // ignore keepalive or parse error
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          retryTimeout = setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.error('Error establishing SSE connection:', err);
      if (!isClosed) {
        retryTimeout = setTimeout(connect, 4000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
