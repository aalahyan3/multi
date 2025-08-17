'use client'
import React, { use, useEffect, useState, useRef, useCallback } from 'react'

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
  createdAt: string;
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

function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [currentUserId] = useState(1); // You can replace this with actual current user ID

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (beforeDate?: string) => {
    try {
      const url = beforeDate 
        ? `/api/chat/${id}/get_messages?limit=20&before=${beforeDate}`
        : `/api/chat/${id}/get_messages?limit=50`;
      
      const response = await fetch(url, { method: 'GET' });
      const apiResponse: ApiResponse = await response.json();
      
      if (!apiResponse.success) {
        console.error('API Error:', apiResponse.message);
        return;
      }
      
      const data = apiResponse.data;
      
      if (!beforeDate) {
        // Initial load
        setChatData(data);
        setMessages(data.messages.reverse()); // Reverse to show oldest first
        setTimeout(scrollToBottom, 100);
      } else {
        // Loading more messages
        const newMessages = data.messages.reverse();
        if (newMessages.length === 0) {
          setHasMore(false);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop === 0) {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateDivider = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  // Placeholder functions for you to implement
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // TODO: Implement message sending logic
    // const messageData = {
    //   content: newMessage,
    //   chatId: id
    // };
    // await sendMessage(messageData);

    fetch(`/api/chat/${id}/send_message`, {method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({chatId:id, messageContent:newMessage, senderId:currentUserId })})
    
    setNewMessage('');
    console.log('Send message:', newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-violet-600 font-medium">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-violet-200/50 shadow-lg shadow-violet-100/50">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {chatData?.members.map((member, index) => (
                <div
                  key={member.id}
                  className="relative group"
                  style={{ zIndex: chatData.members.length - index }}
                >
                  <img
                    src={member.user.image_url}
                    alt={member.user.username}
                    className="w-12 h-12 rounded-full border-3 border-white shadow-lg ring-2 ring-violet-200 transition-transform group-hover:scale-110"
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: member.user.specific_color }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {chatData?.members.map(m => `${m.user.first_name} ${m.user.last_name}`).join(', ')}
              </h1>
              <p className="text-violet-500 font-medium">
                {chatData?.members.length} member{chatData?.members.length !== 1 ? 's' : ''} • Active now
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="w-4 h-4 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <span className="text-violet-600 font-medium text-sm">Loading more messages...</span>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const user = getUserById(message.senderId);
          const isCurrentUser = message.senderId === currentUserId;
          const previousMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          const showDateDivider = shouldShowDateDivider(message, previousMessage);
          const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;
          const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
          
          return (
            <div key={message.id}>
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-8">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                      {formatDate(message.createdAt)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-md opacity-30"></div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={`flex items-end space-x-3 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar for other users */}
                {!isCurrentUser && (
                  <div className="w-10 h-10 flex-shrink-0">
                    {showAvatar && user && (
                      <div className="relative">
                        <img
                          src={user.image_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white"
                        />
                        <div 
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: user.specific_color }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                  {/* Username (for other users) */}
                  {!isCurrentUser && showAvatar && user && (
                    <div className="text-xs font-semibold text-violet-600 mb-2 ml-4">
                      {user.first_name} {user.last_name}
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className="relative group">
                    <div
                      className={`px-4 py-3 shadow-lg transition-all duration-200 group-hover:scale-105 ${
                        isCurrentUser
                          ? `bg-gradient-to-r from-violet-500 to-purple-600 text-white ${
                              isLastInGroup ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-br-lg'
                            }`
                          : `bg-white/90 backdrop-blur-sm text-gray-800 border border-violet-100 ${
                              isLastInGroup ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-bl-lg'
                            }`
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-2 font-medium ${
                        isCurrentUser ? 'text-violet-100' : 'text-violet-400'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                    
                    {/* Message glow effect */}
                    {isCurrentUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl blur-xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="backdrop-blur-xl bg-white/80 border-t border-violet-200/50 p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-4 pr-12 border-2 border-violet-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/70 backdrop-blur-sm placeholder-violet-400 text-gray-800 shadow-lg transition-all duration-200"
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
            <div className="absolute right-3 bottom-4 flex space-x-1">
              <button className="p-1.5 rounded-full hover:bg-violet-100 text-violet-400 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <button className="p-1.5 rounded-full hover:bg-violet-100 text-violet-400 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 12a2 2 0 002 2h10a2 2 0 002-2L17 4M11 9v4M13 9v4" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="group relative bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-105 disabled:scale-100"
            style={{ minHeight: '56px', minWidth: '56px' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity group-disabled:opacity-0"></div>
            <svg
              className="w-6 h-6 relative z-10 transform group-hover:translate-x-0.5 transition-transform"
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
  );
}

export default page;