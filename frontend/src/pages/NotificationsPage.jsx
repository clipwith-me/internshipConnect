// frontend/src/pages/NotificationsPage.jsx

import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import { Badge, Button, Card } from '../components';
import { formatDistanceToNow } from 'date-fns';

/**
 * 🎓 FULL NOTIFICATIONS PAGE
 *
 * Features:
 * - Complete notification history
 * - Filter by read/unread status
 * - Filter by notification type
 * - Mark as read/unread
 * - Delete notifications
 * - Pagination
 * - Create test notifications (development)
 */

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, application, interview, etc.
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'application', label: 'Applications' },
    { value: 'interview', label: 'Interviews' },
    { value: 'offer', label: 'Offers' },
    { value: 'rejection', label: 'Rejections' },
    { value: 'system', label: 'System' },
    { value: 'message', label: 'Messages' },
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationAPI.getAll({
        limit: 50,
        unreadOnly: filter === 'unread'
      });

      if (response.data.success) {
        let notifs = response.data.data.notifications;

        // Filter by type
        if (typeFilter !== 'all') {
          notifs = notifs.filter(n => n.type === typeFilter);
        }

        // Filter by read status
        if (filter === 'read') {
          notifs = notifs.filter(n => n.isRead);
        }

        setNotifications(notifs);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter]);

  // Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Create test notification (development only)
  const handleCreateTest = async () => {
    try {
      await notificationAPI.createTest();
      fetchNotifications();
      alert('Test notification created! Check your notifications.');
    } catch (err) {
      console.error('Failed to create test notification:', err);
      alert('Failed to create test notification. Make sure you are in development mode.');
    }
  };

  // Get notification type badge variant
  const getTypeBadgeVariant = (type) => {
    const variants = {
      application: 'primary',
      interview: 'warning',
      offer: 'success',
      rejection: 'danger',
      system: 'neutral',
      message: 'info',
    };
    return variants[type] || 'neutral';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Notifications
        </h1>
        <p className="text-neutral-600">
          Stay updated with your applications and messages
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Read/Unread Filter */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'primary' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Unread
                {unreadCount > 0 && (
                  <Badge variant="danger" size="sm" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={filter === 'read' ? 'primary' : 'outline'}
                onClick={() => setFilter('read')}
              >
                Read
              </Button>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-md bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}

            {/* Test Notification (Development Only) */}
            {import.meta.env.DEV && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCreateTest}
              >
                <Bell className="w-4 h-4 mr-2" />
                Test
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        // Loading State
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        // Error State
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      ) : notifications.length === 0 ? (
        // Empty State
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No notifications
          </h3>
          <p className="text-neutral-600 mb-6">
            {filter === 'unread'
              ? "You're all caught up! No unread notifications."
              : filter === 'read'
              ? "No read notifications yet."
              : typeFilter !== 'all'
              ? `No ${typeFilter} notifications.`
              : "You don't have any notifications yet."}
          </p>
          {import.meta.env.DEV && (
            <Button onClick={handleCreateTest}>
              <Bell className="w-4 h-4 mr-2" />
              Create Test Notification
            </Button>
          )}
        </Card>
      ) : (
        // Notifications List
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-5 hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-l-4 border-l-primary-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant={getTypeBadgeVariant(notification.type)}
                      size="sm"
                    >
                      {notification.type}
                    </Badge>

                    {!notification.isRead && (
                      <span className="flex items-center text-xs text-primary-600 font-medium">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-1.5"></span>
                        Unread
                      </span>
                    )}

                    <span className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-neutral-900 mb-1">
                    {notification.title}
                  </h4>

                  <p className="text-sm text-neutral-600 mb-3">
                    {notification.message}
                  </p>

                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details →
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {!loading && notifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-neutral-500">
          Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
