"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

// Expose Pusher globally for Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

  // Initialize Echo based on .env variables
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_APP_KEY) {
      const echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel: any, options: any) => {
          return {
            authorize: (socketId: string, callback: Function) => {
              api.post('/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name
              })
              .then(response => {
                callback(false, response.data);
              })
              .catch(error => {
                callback(true, error);
              });
            }
          };
        },
      });
      setEchoInstance(echo);
    }
    
    return () => {
      if (echoInstance) {
        echoInstance.disconnect();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        // We'll just manage the 'all' combined list and derive unread from that locally or use backend counts
        const all = response.data.data.all || [];
        setNotifications(all);
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      fetchNotifications(); // Revert on failure
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await api.post('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistically update
    const isUnread = !notifications.find(n => n.id === id)?.read_at;
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    
    // We didn't make a single delete endpoint yet, but usually it's handled via the all list.
    // For now we'll fetch just to keep in sync if it gets complex.
    fetchNotifications(); 
  };

  const deleteAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await api.delete('/notifications/all');
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      fetchNotifications();
    }
  };

  // Manage authenticated user websocket channel
  useEffect(() => {
    fetchNotifications();

    const storedUser = localStorage.getItem('user');
    if (storedUser && echoInstance) {
      try {
        const user = JSON.parse(storedUser);
        
        // Listen to private channel App.Models.User.{id}
        echoInstance.private(`App.Models.User.${user.id}`)
          .notification((notification: any) => {
            console.log('New notification received via websocket:', notification);
            // Re-fetch to guarantee up-to-date data, or inject optimistically
            fetchNotifications(); 
          });

      } catch (e) {
        console.error('Failed to parse user for websocket connection', e);
      }
    }
    
    return () => {
      // Cleanup listener if user logs out or unmounts
      if (storedUser && echoInstance) {
        try {
          const user = JSON.parse(storedUser);
          echoInstance.leave(`App.Models.User.${user.id}`);
        } catch (e) {}
      }
    }
  }, [echoInstance]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
