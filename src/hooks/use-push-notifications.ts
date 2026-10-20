'use client';

import { useCallback, useEffect, useState } from 'react';
import { pushService } from '@/services/push.service';
import {
  isPushSupported,
  needsIosInstallToEnablePush,
  registerServiceWorker,
  subscribeToPush,
} from '@/lib/push';

type PushStatus = 'loading' | 'unsupported' | 'needs-ios-install' | 'denied' | 'subscribed' | 'unsubscribed';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus(needsIosInstallToEnablePush() ? 'needs-ios-install' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    const registration = await registerServiceWorker();
    const existing = await registration?.pushManager.getSubscription();
    setStatus(existing ? 'subscribed' : 'unsubscribed');
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStatus();
  }, [checkStatus]);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const registration = await registerServiceWorker();
      if (!registration) throw new Error('Service worker registration failed');

      const vapidPublicKey = await pushService.getVapidPublicKey();
      const subscription = await subscribeToPush(registration, vapidPublicKey);
      await pushService.subscribe(subscription.toJSON());

      setStatus('subscribed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable notifications');
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const registration = await registerServiceWorker();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await pushService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus('unsubscribed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disable notifications');
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable };
}

export default usePushNotifications;
