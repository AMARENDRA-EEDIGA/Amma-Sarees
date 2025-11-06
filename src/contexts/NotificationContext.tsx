import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'customer';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  customerId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAdmin } = useAuth();

  // Load notifications from shared storage whenever admin logs in
  useEffect(() => {
    if (isAdmin) {
      const loadNotifications = () => {
        const saved = localStorage.getItem('sharedNotifications');
        if (saved) {
          try {
            const parsedNotifications = JSON.parse(saved);
            // Filter out invalid notifications
            const validNotifications = parsedNotifications.filter((n: any) => n.id && n.message);
            setNotifications(validNotifications);
          } catch (error) {
            console.error('Error parsing notifications:', error);
            setNotifications([]);
          }
        }
      };
      
      loadNotifications();
      
      // Check for new notifications every 3 seconds when admin is active
      const interval = setInterval(loadNotifications, 3000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAdmin]);

  // Save notifications to shared storage
  useEffect(() => {
    if (isAdmin && notifications.length > 0) {
      localStorage.setItem('sharedNotifications', JSON.stringify(notifications));
    }
  }, [notifications, isAdmin]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!isAdmin) return; // Only admins receive notifications
    
    const notification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('sharedNotifications');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}