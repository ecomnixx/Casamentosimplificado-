import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAccount } from '../types';
import {
  playNotificationChime,
  sendSystemNotification,
  subscribeToUserEvents,
  broadcastUserEvent,
} from '../utils/notifications';
import {
  fetchServerUsers,
  approveUserOnServer,
  subscribeToRealtimeServer,
} from '../services/api';

const MASTER_EMAIL = 'familiacardoso21@gmail.com';

export function useAccessNotifications(isAdmin: boolean) {
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [activeAlert, setActiveAlert] = useState<UserAccount | null>(null);
  const seenPendingIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Sync users from server
  const refreshUsers = useCallback(async () => {
    try {
      const serverList = await fetchServerUsers();
      const pending = serverList.filter(
        (u) =>
          u.status === 'pending' &&
          u.email?.trim().toLowerCase() !== MASTER_EMAIL.toLowerCase()
      );

      setPendingUsers(pending);

      if (!isAdmin) return;

      if (isFirstLoadRef.current) {
        // Initial load: don't chime for pre-existing records
        pending.forEach((u) => seenPendingIdsRef.current.add(u.id));
        isFirstLoadRef.current = false;
        return;
      }

      // Check for any unseen pending user
      const newArrivals = pending.filter((u) => !seenPendingIdsRef.current.has(u.id));
      if (newArrivals.length > 0) {
        const newest = newArrivals[0];
        newArrivals.forEach((u) => seenPendingIdsRef.current.add(u.id));

        playNotificationChime();
        setActiveAlert(newest);
        sendSystemNotification(
          '🔔 Nova Solicitação de Acesso!',
          `${newest.name || 'Nova noiva'} (${newest.email}) realizou o pagamento e solicitou liberação de acesso.`
        );
      }
    } catch (e) {
      console.error('Error refreshing users for notifications:', e);
    }
  }, [isAdmin]);

  // Quick 1-click approval
  const approveUserQuick = useCallback(
    async (userId: string) => {
      try {
        const user = pendingUsers.find((u) => u.id === userId);
        await approveUserOnServer(userId, user?.email);

        broadcastUserEvent('user_approved', user || { id: userId });
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        if (activeAlert?.id === userId) {
          setActiveAlert(null);
        }
      } catch (err) {
        console.error('Error in approveUserQuick:', err);
      }
    },
    [activeAlert, pendingUsers]
  );

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  useEffect(() => {
    // 1. Initial fetch from server
    refreshUsers();

    // 2. Real-time Server-Sent Events (SSE) listener
    const unsubscribeSse = subscribeToRealtimeServer((event) => {
      if (event.type === 'new_request' && event.user) {
        const incoming = event.user;
        if (incoming.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
          setPendingUsers((prev) => {
            const exists = prev.some((u) => u.id === incoming.id || u.email === incoming.email);
            return exists ? prev : [incoming, ...prev];
          });

          if (isAdmin && !seenPendingIdsRef.current.has(incoming.id)) {
            seenPendingIdsRef.current.add(incoming.id);
            playNotificationChime();
            setActiveAlert(incoming);
            sendSystemNotification(
              '🔔 Nova Solicitação de Acesso!',
              `${incoming.name || 'Nova noiva'} (${incoming.email}) solicitou liberação de acesso.`
            );
          }
        }
      } else if (event.type === 'user_approved' && event.user) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== event.user?.id && u.email !== event.user?.email));
      } else if (event.type === 'user_deleted' && event.id) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== event.id));
      }
    });

    // 3. Local cross-tab / window custom event listener
    const unsubscribeLocal = subscribeToUserEvents(() => {
      refreshUsers();
    });

    // 4. Polling fallback every 3 seconds to guarantee freshness
    const interval = setInterval(refreshUsers, 3000);

    return () => {
      unsubscribeSse();
      unsubscribeLocal();
      clearInterval(interval);
    };
  }, [refreshUsers, isAdmin]);

  return {
    pendingUsers,
    pendingCount: pendingUsers.length,
    activeAlert,
    dismissAlert,
    approveUserQuick,
    refreshPending: refreshUsers,
  };
}
