import { UserAccount } from '../types';

let audioCtx: AudioContext | null = null;

/**
 * Plays an elegant, pleasant two-tone notification chime using Web Audio API.
 * 100% self-contained, no external MP3 dependencies, works completely offline.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2: 880 Hz (A5) - slightly delayed for a cheerful chime chord
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.0001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.72);
  } catch (err) {
    console.warn('Notification audio unavailable:', err);
  }
}

/**
 * Requests browser notification permission if available
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
  }
  return false;
}

/**
 * Triggers a native system notification if permitted
 */
export function sendSystemNotification(title: string, body: string, icon = '/icon-192.png'): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'casamento-access-request',
      });
    }
  } catch (e) {
    console.warn('System notification error:', e);
  }
}

// Channel for cross-tab instant messaging
const CHANNEL_NAME = 'casamento_access_channel';

export function broadcastUserEvent(type: 'new_request' | 'user_approved' | 'user_rejected', user: Partial<UserAccount>): void {
  // 1. Dispatch custom event in current window
  window.dispatchEvent(
    new CustomEvent('casamento_users_event', {
      detail: { type, user, timestamp: Date.now() },
    })
  );

  // 2. Dispatch BroadcastChannel across tabs/windows
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type, user, timestamp: Date.now() });
      setTimeout(() => channel.close(), 1000);
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback storage event
  try {
    localStorage.setItem('casamento_last_event', JSON.stringify({ type, email: user.email, time: Date.now() }));
  } catch (e) {
    // ignore
  }
}

export function subscribeToUserEvents(
  callback: (data: { type: string; user?: Partial<UserAccount>; timestamp: number }) => void
): () => void {
  let channel: BroadcastChannel | null = null;

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'casamento_last_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {
        // ignore
      }
    }
    if (e.key === 'casamento_users') {
      callback({ type: 'storage_change', timestamp: Date.now() });
    }
  };

  window.addEventListener('casamento_users_event', handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (msg) => {
        if (msg.data) {
          callback(msg.data);
        }
      };
    }
  } catch (e) {
    // ignore
  }

  return () => {
    window.removeEventListener('casamento_users_event', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (channel) {
      channel.close();
    }
  };
}
