import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addNotification, addToast } from '../../../store/index.ts';
import { Send, User, Bot, Clock, Paperclip } from 'lucide-react';
import { isMockModeEnv } from '../../../lib/api/client.ts';

/**
 * There is no messaging API in MVP-1. Real mode shows no conversation and does not pretend to send;
 * the demo conversation and local sending exist only in mock mode.
 */
const MESSAGING_AVAILABLE = isMockModeEnv();

export function PortalMessagesView() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);

  const [messages, setMessages] = useState(!MESSAGING_AVAILABLE ? [] : [
    {
      id: 'm1',
      sender: 'GrowthPrint Engineering Lead',
      role: 'AGENCY',
      timestamp: 'Yesterday at 5:15 PM',
      text: 'Hi Sarah, we analyzed the query logs from yesterday’s 4 PM promotion. We isolated an unindexed coupon join query. We have submitted a written estimate (GP-REQ-2026-088) for 6 engineering hours to index the database and batch SKU availability lookups.'
    },
    {
      id: 'm2',
      sender: 'Sarah Chen',
      role: 'CLIENT',
      timestamp: 'Today at 8:45 AM',
      text: 'Thanks Alex. We reviewed the estimate. Our next flash campaign launches Friday at noon, so getting this deployed before Thursday evening is crucial.'
    },
    {
      id: 'm3',
      sender: 'GrowthPrint Engineering Lead',
      role: 'AGENCY',
      timestamp: 'Today at 9:02 AM',
      text: 'Understood. As soon as you click Authorize on the ticket, our staging pull request will run through automated load tests simulating 2,500 simultaneous checkouts.'
    }
  ]);

  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!MESSAGING_AVAILABLE || !inputVal.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: currentUser.name,
        role: 'CLIENT',
        timestamp: 'Just now',
        text: inputVal.trim()
      }
    ]);
    dispatch(addToast({
      type: 'success',
      title: 'Message Sent',
      message: 'Your technical lead has been notified.'
    }));
    dispatch(addNotification({
      category: 'SYSTEM',
      title: 'Client Message Received',
      message: `${currentUser.name} sent a new message in the client channel.`,
      priority: 'MEDIUM',
      targetTab: 'MESSAGES'
    }));
    setInputVal('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            GP
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              GrowthPrint Direct Engineering Channel
            </h3>
            <span className="text-[11px] text-slate-500">
              Direct communication with assigned technical lead
            </span>
          </div>
        </div>

        <div className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FBFDFF]">
        {messages.map((msg) => {
          const isClient = msg.role === 'CLIENT';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-700">{msg.sender}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>
              <div 
                className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isClient 
                    ? 'bg-blue-600 text-white rounded-tr-xs' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {!MESSAGING_AVAILABLE && (
        <p role="note" className="mx-4 mb-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          In-portal messaging is not available yet. Please contact your GrowthPrint account manager by email.
        </p>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
        <label htmlFor="portal-message-input" className="sr-only">Message to your technical lead</label>
        <input
          id="portal-message-input"
          type="text"
          disabled={!MESSAGING_AVAILABLE}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type a message to your technical lead..."
          className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!MESSAGING_AVAILABLE}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
