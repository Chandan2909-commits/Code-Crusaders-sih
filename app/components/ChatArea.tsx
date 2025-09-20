'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const formatMessage = (content: string) => {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  // Handle tables
  const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((\|.+\|\n?)+)/g;
  formatted = formatted.replace(tableRegex, (match: string, header: string, body: string) => {
    const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
    const rows = body.trim().split('\n').map((row: string) =>
      row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
    );

    let table = '<table><thead><tr>';
    headerCells.forEach(cell => {
      table += `<th>${cell}</th>`;
    });
    table += '</tr></thead><tbody>';

    rows.forEach(row => {
      table += '<tr>';
      row.forEach(cell => {
        table += `<td>${cell}</td>`;
      });
      table += '</tr>';
    });

    table += '</tbody></table>';
    return table;
  });

  // Handle bullet points
  formatted = formatted.replace(/^• (.*$)/gm, '<li>$1</li>');
  formatted = formatted.replace(/^- (.*$)/gm, '<li>$1</li>');

  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
};

export default function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="chat-area">
      <div className={`messages-container ${messages.length === 0 ? 'empty-state' : ''}`}>
        {messages.length === 0 ? (
  <div className="empty-content" style={{ textAlign: 'center' }}>
      <img 
              src="/Untitled-video-Made-with-Clipc-unscreen.gif"
              alt="How can I help you today?" 
              style={{ width: '250px', height: 'auto', marginBottom: '0px' }}
            />
    
    <h1 className="empty-title">How can I help you today?</h1>
  </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-group ${message.role === 'user' ? 'message-user-group' : 'message-assistant-group'
                  }`}
              >
                <div className="message-content">
                  <div className={`message-avatar ${message.role === 'user' ? 'user-avatar' : 'assistant-avatar'
                    }`}>
                    {message.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div
                    className="message-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content)
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-group message-assistant-group">
                <div className="message-content">
                  <div className="message-avatar assistant-avatar">
                    AI
                  </div>
                  <div className="message-text">
                    <div className="thinking">
                      <div className="thinking-dots">
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="input-area">
        <div className="input-container">
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
