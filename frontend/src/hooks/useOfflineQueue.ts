"use client";

import { useEffect, useRef, useCallback } from "react";
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface QueuedItem {
  id?: number;
  timestamp: number;
  endpoint: string;
  method: string;
  payload: unknown;
  retries: number;
}

interface TrackNetDB extends DBSchema {
  offlineQueue: {
    key: number;
    value: QueuedItem;
  };
}

export const useOfflineQueue = () => {
  const dbRef = useRef<IDBPDatabase<TrackNetDB> | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      dbRef.current = await openDB<TrackNetDB>("TrackNetDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("offlineQueue")) {
            db.createObjectStore("offlineQueue", { keyPath: "id", autoIncrement: true });
          }
        },
      });
    };

    initDB().catch((error) => console.error("Failed to initialize IndexedDB:", error));

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, []);

  // Add item to queue
  const enqueue = useCallback(
    async (endpoint: string, method: string, payload: unknown) => {
      if (!dbRef.current) return;

      const item: QueuedItem = {
        timestamp: Date.now(),
        endpoint,
        method,
        payload,
        retries: 0,
      };

      await dbRef.current.add("offlineQueue", item);
      console.log(`[Offline Queue] Enqueued: ${method} ${endpoint}`);
    },
    []
  );

  // Process queue when back online
  const processQueue = useCallback(async () => {
    if (!dbRef.current || isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      const items = await dbRef.current.getAll("offlineQueue");

      for (const item of items) {
        try {
          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });

          if (response.ok) {
            if (item.id) {
              await dbRef.current.delete("offlineQueue", item.id);
            }
            console.log(`[Offline Queue] Synced: ${item.method} ${item.endpoint}`);
          } else {
            item.retries++;
            if (item.id) {
              await dbRef.current.put("offlineQueue", item);
            }
          }
        } catch (error) {
          item.retries++;
          if (item.id) {
            await dbRef.current.put("offlineQueue", item);
          }
          console.error(`[Offline Queue] Failed to sync: ${item.endpoint}`, error);
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    window.addEventListener("online", processQueue);
    return () => {
      window.removeEventListener("online", processQueue);
    };
  }, [processQueue]);

  return { enqueue, processQueue };
};
