import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearNotification,
  type AppNotification 
} from '../../store/index.ts';
import { formatRelativeTime } from '../../lib/utils.ts';
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
  const notifications = useAppSelector(state => state.ui.notifications);
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
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'OUTREACH':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'FINANCIAL':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'SYSTEM':
      default:
        return <Workflow className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
        className={`p-2 rounded-xl border text-slate-500 hover:text-slate-900 transition-all relative ${
          isOpen 
            ? 'bg-blue-50/70 border-blue-300 text-blue-700' 
            : 'border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsAsRead())}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-100 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications'}
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer group ${
                    !notif.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {notif.targetTab ? (
                        <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:underline">
                          <span>View {notif.targetTab.toLowerCase()}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      ) : <span />}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(clearNotification(notif.id));
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
