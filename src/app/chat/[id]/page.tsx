'use client'
import Cookies from 'js-cookie';
import { AlertCircle, ArrowLeft, MoreVertical } from 'lucide-react';
import React, { use, useEffect, useState, useRef, useCallback } from 'react'
import { useSocket } from '../../hooks/useSocket';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  image_url: string;
  specific_color: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: number;
  content: string;
  createdAt: Date;
}

interface ChatMember {
  id: string;
  chatId: string;
  userId: number;
  user: User;
}

interface ChatData {
  id: string;
  createdAt: string;
  members: ChatMember[];
  messages: Message[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  code: number;
  data: ChatData;
}

type MessageProps = {
  message: Message
  user: User
}

function getContrastColor(hex: string): string {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);

  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}


const MyMessage = ({ message, user }: MessageProps) => {
  const formatTime = (dateString: Date) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col w-full justify-end items-end gap-2 my-3 group">
      <div className="flex flex-col items-end">
        <div className='flex gap-1 items-start'>
           <div 
            className="px-4 py-2 rounded-2xl rounded-br-md max-w-sm shadow-sm  border border-[#ffffff1b]" style={{background: user.specific_color}}
          >
            <p style={{color: getContrastColor(user.specific_color)}} className=" text-sm leading-relaxed">{message.content}</p>
        </div>
        <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md"
            style={{ backgroundColor: user.specific_color }}
          >
            {user.image_url ? (
              <img 
                src={user.image_url} 
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
};

const OthersMessage = ({ message, user }: MessageProps) => {
  const formatTime = (dateString: Date) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex w-full justify-start items-end gap-2 my-3 group">
      <div className="flex flex-col-reverse">
        <div>
          <span className="text-xs text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md"
              style={{ backgroundColor: user.specific_color }}
            >
              {user.image_url ? (
                <img 
                  src={user.image_url} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">{user.username}</span>
          </div>
          <div className=" px-4 py-2 rounded-2xl rounded-bl-md max-w-sm shadow-sm" style={{background: user.specific_color}}>
            <p style={{color: getContrastColor(user.specific_color)}} className="text-gray-800 text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasJoinedChat = useRef(false);
  const chatMembersRef = useRef<ChatMember[]>([]);
  
  const currentUserId = parseInt(Cookies.get('id') as string) || 1;
  const currentUserName = Cookies.get('username') as string;
  
  const { socket, isConnected } = useSocket("http://localhost:3000");

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = useCallback(async (beforeDate?: Date) => {
    try {
      const url = beforeDate 
        ? `/api/chat/${id}/get_messages?limit=20&before=${beforeDate.toISOString()}`
        : `/api/chat/${id}/get_messages?limit=50`;
      
      const response = await fetch(url, { method: 'GET' });
      const apiResponse: ApiResponse = await response.json();
      
      if (!apiResponse.success) {
        setError(apiResponse.message);
        return;
      }
      
      const data = apiResponse.data;
      chatMembersRef.current = data.members;
      
      if (!beforeDate) {
        setChatData(data);
        const sortedMessages = data.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        const newMessages = data.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        if (newMessages.length === 0) {
          setHasMore(false);
        } else {
          const container = messagesContainerRef.current;
          const previousScrollHeight = container?.scrollHeight || 0;
          
          setMessages(prev => [...newMessages, ...prev]);
          
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          }, 0);
        }
      }
    } catch (error) {
      setError("Something went wrong loading messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  useEffect(() => {
    if (!socket || !isConnected) {
      setError("Socket failed to connect");
      return;
    }

    const joinData = { chatId: id, username: currentUserName };

    const handleConnect = () => {
      if (!hasJoinedChat.current) {
        socket.emit("join-chat", joinData);
        hasJoinedChat.current = true;
        setError('');
      }
    };

    const handleMessage = (data: { chatId: string, username: string, message: string }) => {
      const { chatId, username, message } = data;
      

      
      if (chatId !== id) return;
      
      const member = chatMembersRef.current.find(m => m?.user?.username === username);
      
      if (!member) return;
      
      const msg: Message = {
        content: message,
        senderId: member.user.id,
        chatId: chatId,
        createdAt: new Date(),
        id: `temp-${Date.now()}-${Math.random()}`
      };
      
      setMessages(prev => [...prev, msg]);
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    const handleDisconnect = () => {
      hasJoinedChat.current = false;
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleMessage);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, isConnected, id, currentUserName]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop <= 100) {
      setLoadingMore(true);
      const oldestMessage = messages[0];
      if (oldestMessage) {
        fetchMessages(oldestMessage.createdAt);
      }
    }
  }, [messages, loadingMore, hasMore, fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getUserById = (userId: number): User | undefined => {
    return chatData?.members.find(member => member.userId === userId)?.user;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    socket.emit("message", { chatId: id, username: currentUserName, message: messageContent });
    
    try {
      const response = await fetch(`/api/chat/${id}/send_message`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: id, 
          messageContent: messageContent, 
          senderId: currentUserId 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setNewMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-purple-300 font-medium text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 shadow-xl backdrop-blur-sm max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-300">
               {error}
              </h3>
            </div>
          </div>
          <div className='mt-4'>
            <a 
              href="/chat" 
              className='text-sm text-center block text-purple-300 hover:text-purple-200 underline transition-colors'
            >
              ← Go back to active chats
            </a>
          </div>
        </div>
      </div>
    );
  }  

  return (
    <div className="bg-gray-900">
      <div className='flex flex-col h-screen max-w-[1000px] mx-auto border shadow-2xl border-[#ffffff23]'>
          <div className="backdrop-blur-xl bg-black/40 border-b border-purple-500/30 shadow-2xl">
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <button className="lg:hidden p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex -space-x-2">
                  {chatData?.members.map((member, index) => (
                    <div
                      key={member.id}
                      className="relative group"
                      style={{ zIndex: chatData.members.length - index }}
                    >
                      <img
                        src={member.user.image_url}
                        alt={member.user.username}
                        className="w-12 h-12 rounded-full border-3 border-slate-800 shadow-xl ring-2 ring-purple-400/50 transition-transform group-hover:scale-110"
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 shadow-lg"
                        style={{ backgroundColor: member.user.specific_color }}
                      ></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {chatData?.members.map(m => `${m.user.first_name} ${m.user.last_name}`).join(', ')}
                  </h1>
                  <p className="text-purple-400 text-sm font-medium">
                    {chatData?.members.length} member{chatData?.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <button className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#7c3aed #1e1b4b' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: #1e1b4b;
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb {
                background: #7c3aed;
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #8b5cf6;
              }
            `}</style>

            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-3 shadow-xl border border-purple-500/20">
                  <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="text-purple-300 font-medium text-sm">Loading older messages...</span>
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const user = getUserById(message.senderId) as User;
              const isCurrentUser = user?.id === currentUserId;
              
              if (isCurrentUser) {
                return <MyMessage key={message.id || index} message={message} user={user} />;
              } else {
                return <OthersMessage key={message.id || index} message={message} user={user} />;
              }
            })}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="backdrop-blur-xl bg-black/40 border-t border-purple-500/30 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-4 border-2 border-slate-600/50 bg-slate-800/60 backdrop-blur-sm rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 placeholder-slate-400 text-slate-100 shadow-xl transition-all duration-200"
                  rows={1}
                  style={{ 
                    minHeight: '56px',
                    maxHeight: '140px',
                    overflow: 'auto'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 140)}px`;
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="group relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-700 text-white p-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none disabled:scale-100 disabled:opacity-50"
                style={{ minHeight: '56px', minWidth: '56px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity group-disabled:opacity-0"></div>
                <svg
                  className="w-6 h-6 relative z-10 transform transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}

export default page;