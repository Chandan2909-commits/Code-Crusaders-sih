'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { Chat, Message } from './types';
import { getDatabase } from './lib/mongodb';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const db = await getDatabase();
      const chatsCollection = db.collection('chats');
      const data = await chatsCollection.find({}).sort({ updated_at: -1 }).toArray();
      
      setChats(data.map(chat => ({
        ...chat,
        id: chat._id.toString(),
        created_at: new Date(chat.created_at),
        updated_at: new Date(chat.updated_at)
      })));
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      console.log('Loading messages for chat:', chatId);
      const db = await getDatabase();
      const messagesCollection = db.collection('messages');
      const data = await messagesCollection.find({ chat_id: chatId }).sort({ timestamp: 1 }).toArray();
      
      console.log('Loaded messages:', data);
      setMessages(data.map(msg => ({
        ...msg,
        id: msg._id.toString(),
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const selectChat = (chatId: string) => {
    setActiveChat(chatId);
    loadMessages(chatId);
  };

  const createNewChat = async () => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    try {
      const db = await getDatabase();
      const chatsCollection = db.collection('chats');
      await chatsCollection.insertOne({
        _id: newChat.id,
        title: newChat.title,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
      });

      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChatId);
      setMessages([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };



  const sendMessage = async (content: string) => {
    let chatId = activeChat;
    
    // Create new chat if none exists
    if (!chatId) {
      const newChatId = uuidv4();
      const newChat: Chat = {
        id: newChatId,
        title: 'New Chat',
        messages: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      try {
        const db = await getDatabase();
        const chatsCollection = db.collection('chats');
        await chatsCollection.insertOne({
          _id: newChat.id,
          title: newChat.title,
          created_at: newChat.created_at,
          updated_at: newChat.updated_at,
        });

        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChatId);
        setMessages([]);
        chatId = newChatId;
      } catch (error) {
        console.error('Error creating chat:', error);
        chatId = uuidv4();
        setActiveChat(chatId);
        setMessages([]);
      }
    }

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to MongoDB
      if (chatId) {
        try {
          const db = await getDatabase();
          const messagesCollection = db.collection('messages');
          await messagesCollection.insertOne({
            _id: userMessage.id,
            chat_id: chatId,
            content: userMessage.content,
            role: userMessage.role,
            timestamp: userMessage.timestamp,
          });
        } catch (error) {
          console.error('Error saving user message:', error);
        }
      }

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = {
          id: uuidv4(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to MongoDB
        if (chatId) {
          try {
            const db = await getDatabase();
            const messagesCollection = db.collection('messages');
            await messagesCollection.insertOne({
              _id: assistantMessage.id,
              chat_id: chatId,
              content: assistantMessage.content,
              role: assistantMessage.role,
              timestamp: assistantMessage.timestamp,
            });

            // Update chat title if it's the first message
            const currentChat = chats.find(c => c.id === chatId);
            if (currentChat && currentChat.title === 'New Chat') {
              const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
              const chatsCollection = db.collection('chats');
              await chatsCollection.updateOne(
                { _id: chatId },
                { $set: { title: newTitle, updated_at: new Date() } }
              );

              setChats(prev => prev.map(chat => 
                chat.id === chatId 
                  ? { ...chat, title: newTitle, updated_at: new Date() }
                  : chat
              ));
            }
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={selectChat}
        onNewChat={createNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col" style={{ flex: 1, height: '100vh' }}>
        <div className="bg-orange-50 p-3 border-b border-orange-200 flex-shrink-0" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="/skills" 
              style={{
                backgroundColor: '#ff8c42',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e67c3a'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#ff8c42'}
            >
              Skill Gap Analysis
            </a>
            <a 
              href="https://sihjre23.streamlit.app/" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#ff8c42',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e67c3a'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#ff8c42'}
            >
              Job Recommendation Engine
            </a>
          </div>
        </div>
        <ChatArea
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}