'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiX, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedQuestion?: string;
  relatedAnswer?: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
  onUpdateCount?: () => void;
}

export default function NotificationDropdown({ onClose, onUpdateCount }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      onUpdateCount?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      onUpdateCount?.();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {(notification.relatedQuestion || notification.relatedAnswer) && (
                  <div className="mt-2">
                    <Link
                      href={notification.relatedQuestion 
                        ? `/questions/${notification.relatedQuestion}`
                        : `/answers/${notification.relatedAnswer}`
                      }
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={onClose}
                    >
                      View related content →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/notifications"
            className="block text-center text-sm text-blue-600 hover:text-blue-700"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
} 