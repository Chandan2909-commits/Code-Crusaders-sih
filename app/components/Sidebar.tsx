'use client';

import { MessageSquare, Plus, Menu, X } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ chats, activeChat, onChatSelect, onNewChat, collapsed, onToggle }: SidebarProps) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button onClick={onToggle} className="toggle-btn">
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
        {!collapsed && (
          <button onClick={onNewChat} className="new-chat-btn">
            <Plus size={16} />
            New chat
          </button>
        )}
      </div>
      
      {!collapsed && (
        <div className="chat-history">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
            >
              <MessageSquare size={16} />
              <div className="chat-item-content">
                <div className="chat-item-title">
                  {chat.title || 'New Chat'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}