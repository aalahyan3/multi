'use client'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { useSocket } from '../../hooks/useSocket'

const MyMessage = ({ message }: { message: string }) => {
  return (
    <div className='flex gap-2'>
      <div className='bg-green-100 h-10 p-1 min-w-10 rounded-full text-center flex items-center justify-center text-sm shadow'>
        <span className='text-xs font-mono'>you</span>
      </div>
      <div className='border border-gray-400 p-2 rounded max-w-2/3'>
        {message}
      </div>
    </div>
  )
}

const TheirMessage = ({ who, message }: { who: string; message: string }) => {
  return (
    <div className='flex gap-2 flex-row-reverse'>
      <div className='bg-violet-100 h-10 p-1 rounded-full text-center flex items-center justify-center text-sm shadow'>
        <span className='text-xs font-mono'>{who}</span>
      </div>
      <div className='border border-gray-400 p-2 rounded max-w-2/3'>
        {message}
      </div>
    </div>
  )
}

const LogMessage = ({ message }: { message: string }) => {
  return (
    <div className='text-sm text-center font-mono text-gray-600'>
        {message}
    </div>
  )
}

function PopUp({ error }: { error: string }) {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!error) return;

    setShow(true);
    setFade(false);

    const fadeTimer = setTimeout(() => setFade(true), 800);
    const hideTimer = setTimeout(() => setShow(false), 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [error]);

  if (!show) return null;

  return (
    <div
      className={`pop-up bg-red-300 p-4 absolute right-1 top-1 rounded text-center min-w-1/4 text-xs font-mono 
                  transition-all duration-200 transform 
                  ${fade ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
    >
      <span>{error}</span>
    </div>
  );
}

function Page() {
  const params = useParams();
  const searchParams = useSearchParams()
  const roomId = params.id;
  const username = searchParams.get("user") as string;
  const { socket, isConnected } = useSocket("http://localhost:3000");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const hasJoinedRoom = useRef(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  type MessageType = {
    sender: string,
    content: string,
    isGeneric: boolean
  }
  const [messages, setMessages] = useState<MessageType[]>([]);


  useEffect(()=>
  {
    // alert("s")
    if (messagesRef.current)
      {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
  }, [messages])

  useEffect(() => {
    if (!username || !roomId){
      document.location.href = "/";
    };
    if (!socket) return;

    const room_join_data = { room_id: roomId, username };

    const handleLog = (log: string) => {
      setMessages(prev => [...prev, { sender: "", content: log, isGeneric:true}]);
    };

    const handleMessage = (msg: { username: string; message: string }) => {
      console.log('Received message:', msg);
      setMessages(prev => [...prev, { sender: msg.username, content: msg.message, isGeneric:false}]);
    };

    const handleError = (err: string) => {
      console.log('Received error:', err);
      setError(err);
    };

    const handleConnect = () => {
      console.log('Socket connected, joining room...');
      hasJoinedRoom.current = false;
      socket.emit("join-room", room_join_data);
      hasJoinedRoom.current = true;
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      hasJoinedRoom.current = false;
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("log", handleLog);
    socket.on("message", handleMessage);
    socket.on("error", handleError);

    if (socket.connected && !hasJoinedRoom.current) {
      socket.emit("join-room", room_join_data);
      hasJoinedRoom.current = true;
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("log", handleLog);
      socket.off("message", handleMessage);
      socket.off("error", handleError);
    };
  }, [socket, roomId, username]);

  function handleSend() {
    if (!message.trim() || !socket) return;
    console.log('Sending message:', message);
    socket.emit("message", { room_id: roomId, username, message: message.trim() });
    setMessage('');
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSend();
    }
  }

  if (!isConnected){
    return(
      <h1>connecting to server, please wait...</h1>
    )
  }
  return (
    <div className='relative max-w-[1000px] mx-auto'>
      {error && <PopUp error={error} />}
      <div className='p-4'>
        <div className='mt-6'>
          <h1 className='text-2xl font-bold text-center text-gray-800'>{roomId}</h1>
          <p className='text-center text-sm text-gray-500'>You logged as {username}</p>
        </div>
        <div className='border h-120 mt-10 border-gray-300 shadow p-4 flex flex-col'>
          <div ref={messagesRef} className='flex-1 overflow-y-auto mb-4'>
            <div  className='flex flex-col gap-4'>
              {messages.map((msg, idx) => (
                msg.sender === username ?
                  <MyMessage message={msg.content} key={idx} /> : (msg.isGeneric ? <LogMessage key={idx} message={msg.content}/> : <TheirMessage key={idx} who={msg.sender} message={msg.content} />)
              ))}
            </div>
          </div>
          <div className='border-t pt-4'>
            <label htmlFor="message" className='text-sm text-gray-500'>Enter message</label>
            <div className='flex'>
              <input
                type="text"
                value={message}
                className='border p-2 flex-1 mr-2'
                onChange={(e) => { setMessage(e.target.value) }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
              />
              <button
                className='px-4 py-2 bg-black text-white border border-black cursor-pointer hover:bg-gray-800'
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page;