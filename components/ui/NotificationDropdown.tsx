import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearNotification
} from '../../store/index.ts';
import type { AppNotification } from '../../types/ui.ts';
import { formatRelativeTime } from '../../lib/utils.ts';
import { ATTENTION_PREFIX } from '../../lib/attention.ts';
import { useAttention } from '../../hooks/useAttention.ts';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  CreditCard, 
  AlertCircle, 
  Workflow, 
  ExternalLink,
  X
} from 'lucide-react';

interface NotificationDropdownProps {
  onNavigateTab?: (tab: string) => void;
}

export function NotificationDropdown({ onNavigateTab }: NotificationDropdownProps) {
  const dispatch = useAppDispatch();
  const stored = useAppSelector(state => state.ui.notifications);
  // Real "needs attention" items computed from the loaded data, then anything raised during this session.
  const { notifications: attention } = useAttention();
  const notifications = useMemo(() => [...attention, ...stored], [attention, stored]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = filter === 'UNREAD' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    dispatch(markNotificationAsRead(notif.id));
    if (notif.targetTab && onNavigateTab) {
      onNavigateTab(notif.targetTab);
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ACTION_REQUIRED':
        return <AlertCircle className="w-4 h-4 text-gp-warning" />;
      case 'OUTREACH':
        return <Sparkles className="w-4 h-4 text-gp-info" />;
      case 'FINANCIAL':
        return <CreditCard className="w-4 h-4 text-gp-success" />;
      case 'SYSTEM':
      default:
        return <Workflow className="w-4 h-4 text-gp-text-muted" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
        className={`p-2 rounded-lg border text-gp-text-muted hover:text-gp-text transition-colors relative ${
          isOpen 
            ? 'bg-gp-primary-soft border-gp-primary/40 text-gp-primary-strong' 
            : 'border-gp-border hover:bg-gp-surface-secondary'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gp-danger text-gp-danger-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gp-surface rounded-lg border border-gp-border shadow-gp-pop z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 border-b border-gp-divider flex items-center justify-between bg-gp-surface-secondary/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gp-text">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 bg-gp-primary-soft text-gp-primary-strong rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsAsRead(attention.map(n => n.id)))}
                  className="text-xs text-gp-primary-strong hover:text-gp-primary-hover font-semibold flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="text-gp-text-muted hover:text-gp-text p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gp-divider text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-gp-text text-gp-canvas font-semibold'
                  : 'text-gp-text-secondary hover:text-gp-text hover:bg-gp-surface-secondary'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-gp-text text-gp-canvas font-semibold'
                  : 'text-gp-text-secondary hover:text-gp-text hover:bg-gp-surface-secondary'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gp-divider">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gp-text-muted">
                {filter === 'UNREAD' ? 'No unread notifications' : 'Nothing needs your attention right now.'}
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-gp-surface-secondary/70 transition-colors flex items-start gap-3 cursor-pointer group ${
                    !notif.isRead ? 'bg-gp-primary-soft/50' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-gp-surface-secondary shrink-0">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs ${!notif.isRead ? 'font-bold text-gp-text' : 'font-medium text-gp-text-secondary'}`}>
                        {notif.title}
                      </h4>
                      {notif.timestamp && (
                        <span className="text-xs text-gp-text-muted whitespace-nowrap">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gp-text-secondary leading-relaxed mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      {notif.targetTab ? (
                        <span className="text-gp-primary-strong font-semibold flex items-center gap-1 group-hover:underline">
                          <span>View {notif.targetTab.toLowerCase()}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      ) : <span />}

                      {!notif.id.startsWith(ATTENTION_PREFIX) && <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(clearNotification(notif.id));
                        }}
                        aria-label="Remove notification"
                        className="text-gp-text-muted hover:text-gp-danger p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
