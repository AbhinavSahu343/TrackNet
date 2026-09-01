import { useState, useEffect } from 'react';

export interface OfflineOrder {
  id: string;
  item: string;
  seatNumber: string;
  timestamp: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineOrder[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tracknet_offline_orders');
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch (e) {
        setQueue([]);
      }
    }
  }, []);

  const addToQueue = (item: string, seat: string) => {
    const newOrder: OfflineOrder = {
      id: Math.random().toString(36).substring(2, 9),
      item,
      seatNumber: seat,
      timestamp: Date.now()
    };
    const updated = [...queue, newOrder];
    setQueue(updated);
    localStorage.setItem('tracknet_offline_orders', JSON.stringify(updated));
  };

  const clearQueue = () => {
    setQueue([]);
    localStorage.removeItem('tracknet_offline_orders');
  };

  return { queue, addToQueue, clearQueue };
}